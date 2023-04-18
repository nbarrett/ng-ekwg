import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import first from "lodash-es/first";
import { FileUploader } from "ng2-file-upload";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { FileUtilsService } from "../../file-utils.service";
import { AlertTarget } from "../../models/alert-target.model";
import { DateValue } from "../../models/date.model";
import { MailchimpCampaign, MailchimpCampaignListRequest } from "../../models/mailchimp.model";
import { MemberResource } from "../../models/member-resource.model";
import { Confirm, ConfirmType } from "../../models/ui-actions";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { LineFeedsToBreaksPipe } from "../../pipes/line-feeds-to-breaks.pipe";
import { ContentMetadataService } from "../../services/content-metadata.service";
import { DateUtilsService } from "../../services/date-utils.service";
import { FileUploadService } from "../../services/file-upload.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { MailchimpConfigService } from "../../services/mailchimp-config.service";
import { MailchimpCampaignService } from "../../services/mailchimp/mailchimp-campaign.service";
import { MemberResourcesService } from "../../services/member-resources/member-resources.service";
import { MemberLoginService } from "../../services/member/member-login.service";
import { MemberResourcesReferenceDataService } from "../../services/member/member-resources-reference-data.service";
import { MemberService } from "../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../services/notifier.service";
import { StringUtilsService } from "../../services/string-utils.service";
import { UrlService } from "../../services/url.service";

@Component({
  selector: "app-how-to-modal",
  templateUrl: "how-to-modal.component.html",
})
export class HowToModalComponent implements OnInit, OnDestroy {
  public memberResource: MemberResource;
  public confirm: Confirm;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public notification: Notification;
  private logger: Logger;
  public hasFileOver = false;
  public resourceDate: DateValue;
  private existingTitle: string;
  public uploader: FileUploader;
  private confirmType: ConfirmType = ConfirmType.NONE;
  public selectedMemberIds: string[] = [];
  public editMode: string;
  public campaigns: MailchimpCampaign[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private contentMetadataService: ContentMetadataService,
              private fileUploadService: FileUploadService,
              private mailchimpCampaignService: MailchimpCampaignService,
              private mailchimpConfig: MailchimpConfigService,
              private notifierService: NotifierService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private displayDate: DisplayDatePipe,
              public memberResourcesReferenceData: MemberResourcesReferenceDataService,
              private fullNameWithAlias: FullNameWithAliasPipe,
              private lineFeedsToBreaks: LineFeedsToBreaksPipe,
              private modalService: BsModalService,
              private memberResourcesService: MemberResourcesService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              public fileUtils: FileUtilsService,
              protected dateUtils: DateUtilsService,
              public bsModalRef: BsModalRef,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(HowToModalComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("constructed with memberResource", this.memberResource);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.setBusy();
    this.notify.hide();
    this.uploader = this.fileUploadService.createUploaderFor("memberResources");
    this.subscriptions.push(this.uploader.response.subscribe((response: string | HttpErrorResponse) => {
        this.logger.debug("response", response, "type", typeof response);
        this.notify.clearBusy();
        if (response instanceof HttpErrorResponse) {
          this.notify.error({title: "Upload failed", message: response.error});
        } else if (response === "Unauthorized") {
          this.notify.error({title: "Upload failed", message: response + " - try logging out and logging back in again and trying this again."});
        } else {
          const uploadResponse = JSON.parse(response);
          this.memberResource.data.fileNameData = uploadResponse.response.fileNameData;
          this.memberResource.data.fileNameData.title = this.existingTitle;
          this.logger.debug("JSON response:", uploadResponse, "memberResource:", this.memberResource);
          this.notify.clearBusy();
          this.notify.success({title: "New file added", message: this.memberResource.data.fileNameData.title});
        }
      }
    ));
    this.editMode = this.memberResource.id ? "Edit existing" : "Create new";
    this.resourceDate = this.dateUtils.asDateValue(this.memberResource.resourceDate);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  campaignTracker(index: number, item: MailchimpCampaign) {
    return item.web_id;
  }

  browseToFile(fileElement: HTMLInputElement) {
    this.existingTitle = this.memberResource?.data.fileNameData?.title;
    fileElement.click();
  }

  removeAttachment() {
    this.memberResource.data.fileNameData = {};
  }

  public fileOver(e: any): void {
    this.hasFileOver = e;
  }

  fileDropped($event: File[]) {
    this.logger.debug("fileDropped:", $event);
  }

  onFileSelect($file: File[]) {
    this.notify.setBusy();
    this.notify.progress({title: "Attachment upload", message: `uploading ${first($file).name} - please wait...`});
  }

  close() {
    this.confirm.clear();
    this.bsModalRef.hide();
  }

  cancelMemberResourceDetails() {
    this.close();
  }

  campaignDate(campaign) {
    return this.dateUtils.asValueNoTime(campaign.send_time || campaign.create_time);
  }

  campaignTitle(campaign) {
    return campaign.title + " (" + this.displayDate.transform(this.campaignDate(campaign)) + ")";
  }

  campaignChange() {
    this.logger.debug("campaignChange:memberResource.data.campaign", this.memberResource.data.campaign);
    if (this.memberResource.data.campaign) {
      this.memberResource.title = this.memberResource.data.campaign.title;
      this.memberResource.resourceDate = this.campaignDate(this.memberResource.data.campaign);
    }
  }

  performCampaignSearch(selectFirst): Promise<any> {
    const campaignSearchTerm = this.memberResource.data.campaignSearchTerm;
    if (campaignSearchTerm) {
      this.notify.setBusy();
      this.notify.progress({
        title: "Email search",
        message: "searching for campaigns matching '" + campaignSearchTerm + "'"
      });
      const options: MailchimpCampaignListRequest = {
        limit: this.memberResource.data.campaignSearchLimit,
        concise: true,
        status: "sent"
      };
      options[this.memberResource.data.campaignSearchField] = campaignSearchTerm;
      return this.mailchimpCampaignService.list(options)
        .then((response) => {
          this.campaigns = response.data;
          if (selectFirst) {
            this.memberResource.data.campaign = first(this.campaigns);
            this.campaignChange();
          } else {
            this.logger.debug("this.memberResource.data.campaign", this.memberResource.data.campaign, "first campaign=", first(this.campaigns));
          }
          this.logger.debug("response.data", response.data);
          this.notify.success({
            title: "Email search",
            message: "Found " + this.campaigns.length + " campaigns matching '" + campaignSearchTerm + "'"
          });
          this.notify.clearBusy();
          return true;
        });
    } else {
      return Promise.resolve(true);
    }
  }

  resourceDateChanged(dateValue: DateValue) {
    if (dateValue) {
      this.logger.debug("resourceDateChanged", dateValue);
      this.memberResource.resourceDate = dateValue.value;
    }
  }

  cancelChange() {
    this.bsModalRef.hide();
  }

  delete() {
    this.confirm.toggleOnDeleteConfirm();
  }

  save() {
    this.notify.setBusy();
    this.memberResourcesService.createOrUpdate(this.memberResource)
      .then(() => this.bsModalRef.hide());
  }

  confirmDelete() {
    this.notify.setBusy();
    this.memberResourcesService.delete(this.memberResource)
      .then(() => this.bsModalRef.hide());
  }

}

