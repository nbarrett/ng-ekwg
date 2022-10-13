import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import cloneDeep from "lodash-es/cloneDeep";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { CommitteeFile, CommitteeYear } from "../../../models/committee.model";
import { LoginResponse } from "../../../models/member.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { ApiResponseProcessor } from "../../../services/api-response-processor.service";
import { sortBy } from "../../../services/arrays";
import { CommitteeConfigService } from "../../../services/committee/commitee-config.service";
import { CommitteeFileService } from "../../../services/committee/committee-file.service";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { CommitteeDisplayService } from "../committee-display.service";
import { CommitteeEditFileModalComponent } from "../edit/committee-edit-file-modal.component";
import { CommitteeSendNotificationComponent } from "../send-notification/committee-send-notification.component";

@Component({
  selector: "app-committee-year",
  templateUrl: "./committee-year.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeYearComponent implements OnInit, OnDestroy {

  @Input()
  public confirm: Confirm;
  @Input()
  public notify: AlertInstance;
  @Input()
  public committeeYear: CommitteeYear;

  private logger: Logger;
  private subscription: Subscription;
  public committeeFiles: CommitteeFile[] = [];
  public committeeFile: CommitteeFile;

  constructor(
    public memberLoginService: MemberLoginService,
    private notifierService: NotifierService,
    private apiResponseProcessor: ApiResponseProcessor,
    public display: CommitteeDisplayService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: BsModalService,
    private committeeQueryService: CommitteeQueryService,
    private committeeFileService: CommitteeFileService,
    private urlService: UrlService,
    private changeDetectorRef: ChangeDetectorRef,
    private committeeConfig: CommitteeConfigService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeYearComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const committeeFileId = paramMap.get("relativePath");
      this.logger.info("committeeFileId from route params:", paramMap, committeeFileId);
      if (committeeFileId) {
        this.committeeFileService.getById(committeeFileId).then(response => this.applyFiles([response]));
      } else {
        this.committeeFileService.all().then(response => this.applyFiles(response));
      }
    });
  }

  applyFiles(files: CommitteeFile[]) {
    const filteredFiles = files
      .filter(file => this.display.committeeReferenceData.isPublic(file.fileType) || this.memberLoginService.allowCommittee() || this.memberLoginService.allowFileAdmin())
      .sort(sortBy("-fileDate"));
    this.notify.setReady();
    this.cancelConfirmations();
    this.committeeFiles = filteredFiles;
  }

  selectCommitteeFile(committeeFile: CommitteeFile, committeeFiles: CommitteeFile[]) {
    if (this.confirm.noneOutstanding()) {
      this.committeeFile = committeeFile;
      this.committeeFiles = committeeFiles;
    }
  }

  isActive(committeeFile: CommitteeFile): boolean {
    return committeeFile === this.committeeFile;
  }

  addCommitteeFile() {
    this.confirm.type = ConfirmType.CREATE_NEW;
    this.committeeFile = this.display.defaultCommitteeFile();
    this.logger.debug("addCommitteeFile:", this.committeeFile, "of", this.committeeFiles.length, "files");
    this.editCommitteeFile(this.committeeFile);
  }

  editCommitteeFile(committeeFile: CommitteeFile) {
    this.modalService.show(CommitteeEditFileModalComponent, this.display.createModalOptions({confirm: this.confirm, committeeFile}));
  }

  latestYear(): number {
    return this.committeeQueryService.latestYear(this.committeeFiles);
  }

  committeeFilesForYear(year): CommitteeFile[] {
    return this.committeeQueryService.committeeFilesForYear(year, this.committeeFiles);
  }

  cancelConfirmations() {
    this.confirm.clear();
  }

  deleteCommitteeFile() {
    this.confirm.type = ConfirmType.DELETE;
  }

  createModalOptions(initialState?: any): ModalOptions {
    return {
      class: "modal-xl",
      animated: false,
      backdrop: "static",
      ignoreBackdropClick: false,
      keyboard: true,
      focus: true,
      show: true,
      initialState: cloneDeep(initialState)
    };
  }

  sendNotification(confirm: Confirm, committeeFile: CommitteeFile) {
    this.modalService.show(CommitteeSendNotificationComponent, this.createModalOptions({committeeFile, confirm}));
  }

}
