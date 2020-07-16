import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FileUploader } from "ng2-file-upload";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile, NotificationConfig, UserEdits } from "../../../models/committee.model";
import { MailchimpCampaignListResponse, MailchimpConfigResponse } from "../../../models/mailchimp.model";
import { Member } from "../../../models/member.model";
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
import { MailchimpListService } from "../../../services/mailchimp/mailchimp-list.service";
import { MailchimpSegmentService } from "../../../services/mailchimp/mailchimp-segment.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-committee-edit-file-modal",
  templateUrl: "./committee-edit-file-modal.component.html",
})
export class CommitteeEditFileModalComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public notification: NotificationConfig;
  public userEdits: UserEdits;
  private logger: Logger;
  members: Member[] = [];
  private committeeFile: CommitteeFile;
  private campaigns: MailchimpCampaignListResponse;
  private campaignSearchTerm: string;
  private config: MailchimpConfigResponse;
  private allowConfirmDelete = false;
  private selected: any;
  public hasFileOver = false;
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

  public fileOver(e: any): void {
    this.hasFileOver = e;
  }

  constructor(private contentMetaDataService: ContentMetadataService,
              private authService: AuthService,
              private mailchimpSegmentService: MailchimpSegmentService,
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
              private mailchimpListService: MailchimpListService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              public bsModalRef: BsModalRef,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeEditFileModalComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("constructed with member", this.members.length, "members");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.campaignSearchTerm = "Master";
    this.notify.setBusy();
    this.notify.progress({
      title: "Mailchimp Campaigns",
      message: "Getting campaign information matching " + this.campaignSearchTerm
    });
    this.mailchimpConfig.getConfig()
      .then(config => {
        this.config = config;
        this.logger.debug("retrieved config", config);
      });

    this.mailchimpCampaignService.list({
      limit: 1000,
      concise: true,
      status: "save",
      title: this.campaignSearchTerm
    }).then(response => {
      this.campaigns = response;
      this.logger.debug("response.data", response.data);
      this.notify.success({
        title: "Mailchimp Campaigns",
        message: "Found " + this.campaigns.data.length + " draft campaigns matching " + this.campaignSearchTerm
      });
      this.notify.clearBusy();
    });
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
          // this.committeeFile.fileNameData.title = ??
          this.logger.info("JSON response:", uploadResponse, "committeeFile:", this.committeeFile);
          this.notify.clearBusy();
          this.notify.success({title: "New file added", message: this.committeeFile.fileNameData.title});
        }
      }
    );
  }

  cancelFileChange() {
    this.hideCommitteeFileDialog();
  }

  saveCommitteeFile() {
    this.notify.setBusy();
    this.selected.committeeFile.eventDate = this.dateUtils.asValueNoTime(this.selected.committeeFile.eventDate);
    this.logger.debug("saveCommitteeFile ->", this.selected.committeeFile);
    return this.committeeFileService.createOrUpdate(this.selected.committeeFile)
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
    this.selected.addingNewFile = false;
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

  editCampaign(campaignId) {
    if (!campaignId) {
      this.notify.error({
        title: "Edit Mailchimp Campaign",
        message: "Please select a campaign from the drop-down before choosing edit"
      });
    } else {
      this.notify.hide();
      const webId = this.campaigns.data.find(campaign => campaign.id === campaignId).web_id;
      this.logger.debug("editCampaign:campaignId", campaignId, "web_id", webId);
      return window.open(`${this.mailchimpLinkService.campaignEdit(webId)}`, "_blank");
    }
  }

  save() {
    this.logger.debug("saving config", this.config);
    this.mailchimpConfig.saveConfig(this.config).then(() => this.bsModalRef.hide())
      .catch((error) => this.notify.error(error));
  }

  cancel() {
    this.bsModalRef.hide();
  }
}
