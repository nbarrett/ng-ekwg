import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import cloneDeep from "lodash-es/cloneDeep";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { ApiAction } from "../../../models/api-response.model";
import { CommitteeFile, CommitteeFileApiResponse, CommitteeYear } from "../../../models/committee.model";
import { LoginResponse } from "../../../models/member.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { ApiResponseProcessor } from "../../../services/api-response-processor.service";
import { sortBy } from "../../../services/arrays";
import { CommitteeConfigService } from "../../../services/committee/commitee-config.service";
import { CommitteeFileService } from "../../../services/committee/committee-file.service";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { CommitteeReferenceData } from "../../../services/committee/committee-reference-data";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { CommitteeDisplayService } from "../committee-display.service";
import { CommitteeEditFileModalComponent } from "../edit/committee-edit-file-modal.component";
import { CommitteeSendNotificationModalComponent } from "../send-notification/committee-send-notification-modal.component";

@Component({
  selector: "app-committee-history",
  templateUrl: "./committee-history.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeHistoryComponent implements OnInit, OnDestroy {

  @Input()
  public confirm: Confirm;
  @Input()
  public notify: AlertInstance;

  private logger: Logger;
  private subscription: Subscription;
  public committeeFileYears: CommitteeYear[] = [];
  public committeeFiles: CommitteeFile[] = [];
  public committeeFile: CommitteeFile;
  private committeeReferenceData: CommitteeReferenceData;

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
    this.logger = loggerFactory.createLogger(CommitteeHistoryComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.committeeConfig.events().subscribe(data => this.committeeReferenceData = data);
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const committeeFileId = paramMap.get("committee-file-id");
      this.logger.debug("committeeFileId from route params:", paramMap, committeeFileId);
      if (committeeFileId) {
        this.committeeFileService.getById(committeeFileId);
      } else {
        this.committeeFileService.all();
      }
    });
    this.subscription = this.committeeFileService.notifications().subscribe((apiResponse: CommitteeFileApiResponse) => {
      if (apiResponse.error) {
        this.logger.warn("received error:", apiResponse.error);
        this.notify.error({
          title: "Problem viewing Committee file",
          message: "The file in the link could not be found. Click the Committee tab above to clear this message."
        });
      } else if (this.confirm.notificationsOutstanding()) {
        this.logger.debug("Not processing subscription response due to confirm:", this.confirm.type);
      } else {
        const filteredFiles = this.apiResponseProcessor.processResponse(this.logger, this.committeeFiles, apiResponse)
          .filter(file => this.committeeReferenceData.isPublic(file.fileType) || this.memberLoginService.allowCommittee() || this.memberLoginService.allowFileAdmin())
          .sort(sortBy("-fileDate"));
        if (apiResponse.action === ApiAction.QUERY && filteredFiles.length === 1) {
          this.notify.warning({
            title: "Single Committee File being viewed",
            message: "Click the Committee tab above to restore normal view."
          });
        }
        this.notify.setReady();
        this.cancelConfirmations();
        this.committeeFiles = filteredFiles;
        this.committeeFileYears = this.committeeQueryService.committeeFileYears(this.committeeFiles);
      }
    });
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
    this.modalService.show(CommitteeSendNotificationModalComponent, this.createModalOptions({committeeFile, confirm}));
  }

}
