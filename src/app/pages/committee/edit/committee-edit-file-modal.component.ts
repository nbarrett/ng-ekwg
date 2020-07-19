import { DOCUMENT } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { isEmpty } from "lodash-es";
import first from "lodash-es/first";
import { FileUploader } from "ng2-file-upload";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile, NotificationConfig, UserEdits } from "../../../models/committee.model";
import { DateValue } from "../../../models/date.model";
import { MailchimpCampaignListResponse, MailchimpConfigResponse } from "../../../models/mailchimp.model";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { LineFeedsToBreaksPipe } from "../../../pipes/line-feeds-to-breaks.pipe";
import { CommitteeFileService } from "../../../services/committee/committee-file.service";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { CommitteeReferenceDataService } from "../../../services/committee/committee-reference-data.service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpConfigService } from "../../../services/mailchimp-config.service";
import { MailchimpCampaignService } from "../../../services/mailchimp/mailchimp-campaign.service";
import { MailchimpLinkService } from "../../../services/mailchimp/mailchimp-link.service";
import { MailchimpSegmentService } from "../../../services/mailchimp/mailchimp-segment.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { CommitteeDisplayService } from "../committee-display.service";

@Component({
  selector: "app-committee-edit-file-modal",
  styleUrls: ["committee-edit-file-modal.component.sass"],
  templateUrl: "./committee-edit-file-modal.component.html",
})
export class CommitteeEditFileModalComponent implements OnInit {
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public notification: NotificationConfig;
  public userEdits: UserEdits;
  private logger: Logger;
  private committeeFile: CommitteeFile;
  private campaigns: MailchimpCampaignListResponse;
  private campaignSearchTerm: string;
  private config: MailchimpConfigResponse;
  private allowConfirmDelete = false;
  public hasFileOver = false;
  private eventDate: DateValue;
  private existingTitle: string;
  public uploader: FileUploader = new FileUploader({
    url: "/api/aws/s3/file-upload",
    disableMultipart: false,
    autoUpload: true,
    parametersBeforeFiles: true,
    additionalParameter: {},
    authTokenHeader: "Authorization",
    authToken: `Bearer ${this.authService.authToken()}`,
    formatDataFunctionIsAsync: false,
  });

  constructor(@Inject(DOCUMENT) private document: Document,
              private contentMetaDataService: ContentMetadataService,
              private authService: AuthService,
              private mailchimpSegmentService: MailchimpSegmentService,
              public display: CommitteeDisplayService,
              private committeeQueryService: CommitteeQueryService,
              private committeeReferenceData: CommitteeReferenceDataService,
              private committeeFileService: CommitteeFileService,
              private mailchimpCampaignService: MailchimpCampaignService,
              private mailchimpConfig: MailchimpConfigService,
              private notifierService: NotifierService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private fullNameWithAlias: FullNameWithAliasPipe,
              private lineFeedsToBreaks: LineFeedsToBreaksPipe,
              private modalService: BsModalService,
              private mailchimpLinkService: MailchimpLinkService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              public bsModalRef: BsModalRef,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeEditFileModalComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.debug("constructed with committeeFile", this.committeeFile);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.eventDate = this.dateUtils.asDateValue(this.committeeFile.eventDate);
    this.existingTitle = this.committeeFile?.fileNameData?.title;
    this.campaignSearchTerm = "Master";
    this.notify.hide();

    this.uploader.response.subscribe((response: string | HttpErrorResponse) => {
        this.logger.debug("response", response, "type", typeof response);
        this.notify.clearBusy();
        if (response instanceof HttpErrorResponse) {
          this.notify.error({title: "Upload failed", message: response.error});
        } else if (response === "Unauthorized") {
          this.notify.error({title: "Upload failed", message: response + " - try logging out and logging back in again and trying this again."});
        } else {
          const uploadResponse = JSON.parse(response);
          this.committeeFile.fileNameData = uploadResponse.response.fileNameData;
          this.committeeFile.fileNameData.title = this.existingTitle;
          this.logger.info("JSON response:", uploadResponse, "committeeFile:", this.committeeFile);
          this.notify.clearBusy();
          this.notify.success({title: "New file added", message: this.committeeFile.fileNameData.title});
        }
      }
    );
  }

  public fileOver(e: any): void {
    this.hasFileOver = e;
  }

  fileDropped($event: File[]) {
    this.logger.info("fileDropped:", $event);
  }

  cancelFileChange() {
    this.hideCommitteeFileDialog();
  }

  saveCommitteeFile() {
    this.notify.setBusy();
    this.logger.debug("saveCommitteeFile ->", this.committeeFile);
    return this.committeeFileService.createOrUpdate(this.committeeFile)
      .then(() => this.hideCommitteeFileDialog())
      .then(() => this.notify.clearBusy())
      .catch((error) => this.handleError(error));
  }

  handleError(errorResponse) {
    this.notify.error({
      title: "Your changes could not be saved",
      message: (errorResponse && errorResponse.error ? (". Error was: " + JSON.stringify(errorResponse.error)) : "")
    });
    this.notify.clearBusy();
  }

  removeDeleteOrAddOrInProgressFlags() {
    this.allowConfirmDelete = false;
    this.notify.clearBusy();
  }

  deleteCommitteeFile() {
    this.allowConfirmDelete = true;
  }

  cancelDeleteCommitteeFile() {
    this.removeDeleteOrAddOrInProgressFlags();
  }

  hideCommitteeFileDialog() {
    this.removeDeleteOrAddOrInProgressFlags();
    this.bsModalRef.hide();
  }

  notReady() {
    return this.campaigns.data.length === 0;
  }

  attachmentTitle() {
    return (this.committeeFile && isEmpty(this.committeeFile.fileNameData) ? "Attach" : "Replace") + " File";
  }

  cancel() {
    this.bsModalRef.hide();
  }

  attachFile() {

  }

  showAlertMessage(): boolean {
    return this.notifyTarget.busy || this.notifyTarget.showAlert;
  }

  eventDateChanged(dateValue: DateValue) {
    if (dateValue) {
      this.logger.debug("eventDateChanged", dateValue);
      this.committeeFile.eventDate = dateValue.value;
    }
  }

  browseToFile(fileElement: HTMLInputElement) {
    this.existingTitle = this.committeeFile?.fileNameData?.title;
    fileElement.click();
  }

  removeAttachment() {
    this.committeeFile.fileNameData = undefined;
  }

  onFileSelect($file: File[]) {
    this.notify.setBusy();
    this.notify.progress({title: "Attachment upload", message: `uploading ${first($file).name} - please wait...`});
  }
}
