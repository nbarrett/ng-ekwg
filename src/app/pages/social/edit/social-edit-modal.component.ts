import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import cloneDeep from "lodash-es/cloneDeep";
import first from "lodash-es/first";
import { FileUploader } from "ng2-file-upload";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { Identifiable } from "../../../models/api-response.model";
import { DateValue } from "../../../models/date.model";
import { MemberFilterSelection } from "../../../models/member.model";
import { SocialEvent, SocialEventsPermissions } from "../../../models/social-events.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { LineFeedsToBreaksPipe } from "../../../pipes/line-feeds-to-breaks.pipe";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { FileUploadService } from "../../../services/file-upload.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpConfigService } from "../../../services/mailchimp-config.service";
import { MailchimpCampaignService } from "../../../services/mailchimp/mailchimp-campaign.service";
import { MailchimpLinkService } from "../../../services/mailchimp/mailchimp-link.service";
import { MailchimpListService } from "../../../services/mailchimp/mailchimp-list.service";
import { MailchimpSegmentService } from "../../../services/mailchimp/mailchimp-segment.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { SocialEventsService } from "../../../services/social-events/social-events.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SocialSendNotificationModalComponent } from "../send-notification/social-send-notification-modal.component";
import { SocialDisplayService } from "../social-display.service";

@Component({
  selector: "app-social-edit-modal",
  templateUrl: "social-edit-modal.component.html",
})
export class SocialEditModalComponent implements OnInit {
  public socialEvent: SocialEvent;
  public allow: SocialEventsPermissions;
  public confirm: Confirm;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public notification: Notification;
  private logger: Logger;
  private campaignSearchTerm: string;
  public hasFileOver = false;
  public eventDate: DateValue;
  private existingTitle: string;
  public uploader: FileUploader;
  private confirmType: ConfirmType = ConfirmType.NONE;
  public socialEventEditMode: string;
  public longerDescriptionPreview = true;
  public memberFilterSelections: MemberFilterSelection[];
  public selectedMemberIds: string[] = [];

  constructor(private contentMetadataService: ContentMetadataService,
              private fileUploadService: FileUploadService,
              private mailchimpSegmentService: MailchimpSegmentService,
              private mailchimpListService: MailchimpListService,
              public display: SocialDisplayService,
              private mailchimpCampaignService: MailchimpCampaignService,
              private mailchimpConfig: MailchimpConfigService,
              private notifierService: NotifierService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private fullNameWithAlias: FullNameWithAliasPipe,
              private lineFeedsToBreaks: LineFeedsToBreaksPipe,
              private modalService: BsModalService,
              private mailchimpLinkService: MailchimpLinkService,
              private socialEventsService: SocialEventsService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              public bsModalRef: BsModalRef,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialEditModalComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("constructed with socialEvent", this.socialEvent);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.setBusy();
    this.eventDate = this.dateUtils.asDateValue(this.socialEvent.eventDate);
    this.existingTitle = this.socialEvent?.attachment?.title;
    this.campaignSearchTerm = "Master";
    this.notify.hide();
    this.uploader = this.fileUploadService.createUploaderFor("socialEvents");
    this.selectedMemberIds = this.socialEvent.attendees.map(attendee => attendee.id);
    this.uploader.response.subscribe((response: string | HttpErrorResponse) => {
        this.logger.debug("response", response, "type", typeof response);
        this.notify.clearBusy();
        if (response instanceof HttpErrorResponse) {
          this.notify.error({title: "Upload failed", message: response.error});
        } else if (response === "Unauthorized") {
          this.notify.error({title: "Upload failed", message: response + " - try logging out and logging back in again and trying this again."});
        } else {
          const uploadResponse = JSON.parse(response);
          this.socialEvent.attachment = uploadResponse.response.fileNameData;
          this.socialEvent.attachment.title = this.existingTitle;
          this.logger.debug("JSON response:", uploadResponse, "socialEvent:", this.socialEvent);
          this.notify.clearBusy();
          this.notify.success({title: "New file added", message: this.socialEvent.attachment.title});
        }
      }
    );
  }

  onChange() {
    this.socialEvent.attendees = this.selectedMemberIds.map(item => this.memberService.toIdentifiable(item));
    this.logger.debug("attendees: ", this.socialEvent.attendees);
    if (this.selectedMemberIds.length > 0) {
      this.notify.warning({
        title: "Member selection",
        message: `${this.selectedMemberIds.length} attendees selected`
      });
    } else {
      this.notify.hide();
    }
  }

  groupBy(member: MemberFilterSelection) {
    return member.memberGrouping;
  }

  groupValue(_: string, children: any[]) {
    return ({name: children[0].memberGrouping, total: children.length});
  }

  public fileOver(e: any): void {
    this.hasFileOver = e;
  }

  fileDropped($event: File[]) {
    this.logger.debug("fileDropped:", $event);
  }

  cancelFileChange() {
    this.close();
  }

  saveSocialEvent() {
    this.notify.setBusy();
    this.logger.debug("saveSocialEvent ->", this.socialEvent);
    return this.socialEventsService.createOrUpdate(this.socialEvent)
      .then(() => this.close())
      .then(() => this.notify.clearBusy())
      .catch((error) => this.handleError(error));
  }

  deleteSocialEventDetails() {
    this.confirm.toggleOnDeleteConfirm();
  }

  confirmDeleteSocialEventDetails() {
    Promise.resolve(this.notify.progress("Deleting social event", true))
      .then(() => this.deleteMailchimpSegment())
      .then(() => this.removeSocialEventHideSocialEventDialogAndRefreshSocialEvents())
      .then(() => this.notify.clearBusy())
      .catch((error) => this.notify.error(error));
  }

  deleteMailchimpSegment() {
    if (this.socialEvent.mailchimp && this.socialEvent.mailchimp.segmentId) {
      return this.mailchimpListService.deleteSegment("socialEvents", this.socialEvent.mailchimp.segmentId);
    }
  }

  removeSocialEventHideSocialEventDialogAndRefreshSocialEvents() {
    this.socialEventsService.delete(this.socialEvent).then(() => this.close());
  }

  selectMemberContactDetails(memberId: string) {
    const socialEvent = this.socialEvent;
    if (memberId === null) {
      socialEvent.eventContactMemberId = "";
      socialEvent.displayName = "";
      socialEvent.contactPhone = "";
      socialEvent.contactEmail = "";
    } else {
      this.logger.debug("looking for member id", memberId, "in memberFilterSelections", this.memberFilterSelections);
      const selectedMember = this.memberFilterSelections.find(member => member.id === memberId).member;
      socialEvent.displayName = selectedMember.displayName;
      socialEvent.contactPhone = selectedMember.mobileNumber;
      socialEvent.contactEmail = selectedMember.email;
    }
  }

  editLongerDescription() {
    this.logger.debug("editLongerDescription");
    this.longerDescriptionPreview = false;
  }

  previewLongerDescription() {
    this.logger.debug("previewLongerDescription");
    this.longerDescriptionPreview = true;
  }

  saveSocialEventDetails() {
    Promise.resolve(this.notify.progress({title: "Save in progress", message: "Saving social event"}, true))
      .then(() => this.saveSocialEvent())
      .then(() => this.notify.clearBusy())
      .catch((error) => this.notify.error(error));
  }

  handleError(errorResponse) {
    this.notify.error({
      title: "Your changes could not be saved",
      message: (errorResponse && errorResponse.error ? (". Error was: " + JSON.stringify(errorResponse.error)) : "")
    });
    this.notify.clearBusy();
  }

  deleteSocialEvent() {
    this.confirmType = ConfirmType.DELETE;
  }

  showAlertMessage(): boolean {
    return this.notifyTarget.busy || this.notifyTarget.showAlert;
  }

  pendingCompletion(): boolean {
    return this.notifyTarget.busy || this.confirmType !== ConfirmType.NONE;
  }

  pendingDeletion(): boolean {
    return this.confirmType === ConfirmType.DELETE;
  }

  eventDateChanged(dateValue: DateValue) {
    if (dateValue) {
      this.logger.debug("eventDateChanged", dateValue);
      this.socialEvent.eventDate = dateValue.value;
    }
  }

  browseToFile(fileElement: HTMLInputElement) {
    this.existingTitle = this.socialEvent?.attachment?.title;
    fileElement.click();
  }

  removeAttachment() {
    this.socialEvent.attachment = {};
  }

  onFileSelect($file: File[]) {
    this.notify.setBusy();
    this.notify.progress({title: "Attachment upload", message: `uploading ${first($file).name} - please wait...`});
  }

  close() {
    this.confirm.clear();
    this.bsModalRef.hide();
  }

  confirmDeleteSocialEvent() {
    this.socialEventsService.delete(this.socialEvent)
      .then(() => this.close());
  }

  cancelDeleteSocialEvent() {
    this.confirmType = ConfirmType.NONE;
  }

  copyDetailsToNewSocialEvent() {
    const copiedSocialEvent = cloneDeep(this.socialEvent);
    delete copiedSocialEvent.id;
    delete copiedSocialEvent.mailchimp;
    delete copiedSocialEvent.notification;
    copiedSocialEvent.attendees = [];
    this.socialEvent = copiedSocialEvent;
    this.confirm.clear();
    const existingRecordEditEnabled = this.allow.edits && "Copy Existing".startsWith("Edit");
    this.allow.copy = existingRecordEditEnabled;
    this.allow.delete = existingRecordEditEnabled;
    this.notify.success({
      title: "Existing social event copied!",
      message: "Make changes here and save to create a new social event."
    });
  }

  attendeeCaption() {
    return this.socialEvent && this.socialEvent.attendees.length + (this.socialEvent.attendees.length === 1 ? " member is attending" : " members are attending"
    );
  }

  cancelSocialEventDetails() {
    this.close();
  }

  sendSocialEventNotification() {
    this.modalService.show(SocialSendNotificationModalComponent, this.display.createModalOptions({
      memberFilterSelections: this.memberFilterSelections,
      socialEvent: this.socialEvent,
      allow: this.allow,
      confirm: this.confirm
    }));
    this.close();
  }

}

