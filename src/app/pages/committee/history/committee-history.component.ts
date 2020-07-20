import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { MemberLoginService } from "src/app/services/member/member-login.service";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile, CommitteeFileApiResponse, CommitteeYear } from "../../../models/committee.model";
import { LoginResponse } from "../../../models/member.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { ApiResponseProcessProcessor } from "../../../services/api-response-process-processor.service";
import { sortBy } from "../../../services/arrays";
import { CommitteeFileService } from "../../../services/committee/committee-file.service";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { CommitteeReferenceDataService } from "../../../services/committee/committee-reference-data.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { CommitteeDisplayService } from "../committee-display.service";
import { CommitteeEditFileModalComponent } from "../edit/committee-edit-file-modal.component";

@Component({
  selector: "app-committee-history",
  templateUrl: "./committee-history.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeHistoryComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private subscription: Subscription;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public committeeFileYears: CommitteeYear[] = [];
  public committeeFiles: CommitteeFile[] = [];
  public committeeFile: CommitteeFile;
  @Input()
  public confirm: Confirm;

  constructor(private memberLoginService: MemberLoginService,
              private notifierService: NotifierService,
              private apiResponseProcessor: ApiResponseProcessProcessor,
              private committeeReferenceData: CommitteeReferenceDataService,
              public display: CommitteeDisplayService,
              private route: ActivatedRoute,
              private authService: AuthService,
              private modalService: BsModalService,
              private committeeQueryService: CommitteeQueryService,
              private committeeFileService: CommitteeFileService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeHistoryComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.logger.info("ngOnInit");
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {
    });
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.subscription = this.committeeFileService.notifications().subscribe((apiResponse: CommitteeFileApiResponse) => {
      this.logger.info("received notification:", apiResponse);
      if (apiResponse.error) {
        this.logger.warn("received error:", apiResponse.error);
      } else if (this.confirm.notificationsOutstanding()) {
        this.logger.debug("Not processing subscription response due to confirm:", this.confirm.type);
      } else {
        const filteredFiles = this.apiResponseProcessor.processResponse(this.logger, this.committeeFiles, apiResponse)
          .filter(file => this.committeeReferenceData.isPublic(file.fileType) || this.memberLoginService.allowCommittee() || this.memberLoginService.allowFileAdmin())
          .sort(sortBy("-fileDate"));
        this.notify.progress(`Found ${filteredFiles.length} committee file(s)`);
        this.notify.setReady();
        this.cancelConfirmations();
        this.committeeFiles = filteredFiles;
        this.committeeFileYears = this.committeeQueryService.committeeFileYears(this.committeeFiles);
      }
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const committeeFileId = paramMap.get("committeeFileId");
      this.logger.debug("committeeFileId from route params:", committeeFileId);
      if (committeeFileId) {
        return this.committeeFileService.getById(committeeFileId);
        // .then(committeeFile => {
        //   if (!committeeFile) {
        //     this.notify.error("Committee file could not be found. Try opening again from the link in the notification email");
        //   }
        //   this.committeeFiles = [committeeFile];
        // });
      } else {
        return this.committeeFileService.all();
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
    this.modalService.show(CommitteeEditFileModalComponent, this.display.createModalOptions({onClose: this.cancelConfirmations, committeeFile}));
  }

  latestYear(): number {
    return this.committeeQueryService.latestYear(this.committeeFiles);
  }

  committeeFilesForYear(year): CommitteeFile[] {
    return this.committeeQueryService.committeeFilesForYear(year, this.committeeFiles);
  }

  cancelConfirmations() {
    this.confirm.type = ConfirmType.NONE;
  }

  deleteCommitteeFile() {
    this.confirm.type = ConfirmType.DELETE;
  }

}
