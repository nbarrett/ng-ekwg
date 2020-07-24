import { AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild } from "@angular/core";
import { extend } from "lodash-es";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { chain } from "../../../functions/chain";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile, CommitteeMember, GroupEvent, Notification } from "../../../models/committee.model";
import { DateValue } from "../../../models/date.model";
import { MailchimpCampaignListResponse, MailchimpCampaignReplicateIdentifiersResponse, MailchimpConfigResponse } from "../../../models/mailchimp.model";
import { Member, MemberFilterSelection } from "../../../models/member.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { CommitteeNotificationComponentAndData, CommitteeNotificationDirective } from "../../../notifications/committee/committee-notification.directive";
import { CommitteeNotificationDetailsComponent } from "../../../notifications/committee/templates/committee-notification-details.component";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { LineFeedsToBreaksPipe } from "../../../pipes/line-feeds-to-breaks.pipe";
import { sortBy } from "../../../services/arrays";
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
import { CommitteeDisplayService } from "../committee-display.service";

@Component({
  selector: "app-committee-send-notification-modal",
  templateUrl: "./committee-send-notification-modal.component.html",
  styleUrls: ["./committee-send-notification-modal.component.sass"]
})
export class CommitteeSendNotificationModalComponent implements OnInit, AfterViewInit {
  @ViewChild(CommitteeNotificationDirective) notificationDirective: CommitteeNotificationDirective;
  public confirm: Confirm;
  public committeeFile: CommitteeFile;
  public members: Member[] = [];
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public notification: Notification;
  private logger: Logger;

  public roles: { replyTo: any[]; signoff: CommitteeMember[] };
  private committeeFileBaseUrl: string;
  public selectableRecipients: MemberFilterSelection[];
  private config: MailchimpConfigResponse;
  public campaigns: MailchimpCampaignListResponse;

  constructor(private contentMetaDataService: ContentMetadataService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private mailchimpSegmentService: MailchimpSegmentService,
              private committeeQueryService: CommitteeQueryService,
              private committeeReferenceData: CommitteeReferenceDataService,
              private mailchimpCampaignService: MailchimpCampaignService,
              private mailchimpConfig: MailchimpConfigService,
              private notifierService: NotifierService,
              private display: CommitteeDisplayService,
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
    this.logger = loggerFactory.createLogger(CommitteeSendNotificationModalComponent, NgxLoggerLevel.OFF);
  }

  ngAfterViewInit(): void {

  }

  ngOnInit() {
    this.logger.debug("constructed with", this.members.length, "members");
    this.confirm.type = ConfirmType.SEND_NOTIFICATION;
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.setBusy();
    this.roles = {signoff: this.committeeReferenceData.committeeMembers(), replyTo: []};
    this.committeeFileBaseUrl = this.contentMetaDataService.baseUrl("committeeFiles");

    this.logger.debug("initialised on open: committeeFile", this.committeeFile, ", roles", this.roles);
    this.logger.debug("initialised on open: notification ->", this.notification);

    this.notification = {
      cancelled: false,
      content: {
        text: {value: "", include: true},
        signoffText: {value: "If you have any questions about the above, please don\"t hesitate to contact me.\n\nBest regards,", include: true},
        includeDownloadInformation: !!this.committeeFile,
        destinationType: "committee",
        addresseeType: "Hi *|FNAME|*,",
        selectedMemberIds: [],
        recipients: [],
        signoffAs: {
          include: true,
          value: this.loggedOnRole().type || "secretary"
        },
        title: "Committee Notification"
      },
      groupEvents: [],
      groupEventsFilter: {
        selectAll: true,
        fromDate: this.dateUtils.asDateValue(this.dateUtils.momentNowNoTime().valueOf()),
        toDate: this.dateUtils.asDateValue(this.dateUtils.momentNowNoTime().add(2, "weeks").valueOf()),
        includeContact: true,
        includeDescription: true,
        includeLocation: true,
        includeWalks: true,
        includeSocialEvents: true,
        includeCommitteeEvents: true
      },
    };

    if (this.committeeFile) {
      this.notification.content.title = this.committeeFile.fileType;
      this.notification.content.text.value = "This is just a quick note to let you know in case you are interested, that I\"ve uploaded a new file to the EKWG website. The file information is as follows:";
    }

    const promises: any[] = [
      this.memberService.allLimitedFields(this.memberService.filterFor.GROUP_MEMBERS).then(members => {
        this.members = members;
        this.logger.debug("refreshMembers -> populated ->", this.members.length, "members");
        this.selectableRecipients = members
          .map(member => this.toSelectGeneralMember(member))
          .sort(sortBy("order", "text"));
        this.logger.debug("refreshMembers -> populated ->", this.selectableRecipients.length, "selectableRecipients:", this.selectableRecipients);
      }),
      this.mailchimpConfig.getConfig()
        .then(config => {
          this.config = config;
          this.logger.debug("retrieved config", this.config);
          this.clearRecipientsForCampaignOfType("committee");
        }),
      this.mailchimpCampaignService.list({
        limit: 1000,
        concise: true,
        status: "save",
        title: "Master"
      }).then(response => {
        this.campaigns = response;
        this.logger.debug("response.data", response.data);
      })];
    if (!this.committeeFile) {
      promises.push(this.populateGroupEvents());
    }

    Promise.all(promises).then(() => {
      this.logger.debug("performed total of", promises.length);
      this.notify.clearBusy();
    });
  }

  loggedOnRole(): CommitteeMember {
    const memberId = this.memberLoginService.loggedInMember().memberId;
    const loggedOnRoleData = this.committeeReferenceData.committeeMembers().find(role => {
      return role.memberId === memberId;
    });
    this.logger.debug("loggedOnRole for", memberId, "->", loggedOnRoleData);
    return loggedOnRoleData;
  }

  populateGroupEvents(): Promise<GroupEvent[]> {
    return this.committeeQueryService.groupEvents(this.notification.groupEventsFilter)
      .then(events => {
        this.notification.groupEvents = events;
        this.logger.debug("groupEvents", events);
        return events;
      });
  }

  changeGroupEventSelection(groupEvent) {
    groupEvent.selected = !groupEvent.selected;
  }

  allGeneralSubscribedList(): MemberFilterSelection[] {
    return this.members
      .filter(this.memberService.filterFor.GENERAL_MEMBERS_SUBSCRIBED)
      .map(member => this.toSelectGeneralMember(member));
  }

  allWalksSubscribedList(): MemberFilterSelection[] {
    return this.members
      .filter(this.memberService.filterFor.WALKS_MEMBERS_SUBSCRIBED)
      .map(member => this.toSelectWalksMember(member));
  }

  allSocialSubscribedList(): MemberFilterSelection[] {
    return this.members
      .filter(this.memberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED)
      .map(member => this.toSelectSocialMember(member));
  }

  allCommitteeList(): MemberFilterSelection[] {
    return this.members
      .filter(this.memberService.filterFor.COMMITTEE_MEMBERS)
      .map(member => this.toSelectGeneralMember(member));
  }

  notReady() {
    return this.members.length === 0 || this.notifyTarget.busy || (this.notification.content.recipients.length === 0 && this.notification.content.destinationType === "custom");
  }

  toSelectGeneralMember(member: Member): MemberFilterSelection {
    let memberGrouping;
    let order;
    if (member.groupMember && member.mailchimpLists.general.subscribed) {
      memberGrouping = "Subscribed to general emails";
      order = 0;
    } else if (member.groupMember && !member.mailchimpLists.general.subscribed) {
      memberGrouping = "Not subscribed to general emails";
      order = 1;
    } else if (!member.groupMember) {
      memberGrouping = "Not a group member";
      order = 2;
    } else {
      memberGrouping = "Unexpected state";
      order = 3;
    }
    return {
      id: this.memberService.extractMemberId(member),
      order,
      memberGrouping,
      memberInformation: this.fullNameWithAlias.transform(member)
    };
  }

  toSelectWalksMember(member: Member): MemberFilterSelection {
    let memberGrouping;
    let order;
    if (member.groupMember && member.mailchimpLists.walks.subscribed) {
      memberGrouping = "Subscribed to walks emails";
      order = 0;
    } else if (member.groupMember && !member.mailchimpLists.walks.subscribed) {
      memberGrouping = "Not subscribed to walks emails";
      order = 1;
    } else if (!member.groupMember) {
      memberGrouping = "Not a group member";
      order = 2;
    } else {
      memberGrouping = "Unexpected state";
      order = 3;
    }
    return {
      id: this.memberService.extractMemberId(member),
      order,
      memberGrouping,
      text: this.fullNameWithAlias.transform(member)
    };
  }

  toSelectSocialMember(member: Member): MemberFilterSelection {
    let memberGrouping;
    let order;
    if (member.groupMember && member.mailchimpLists.socialEvents.subscribed) {
      memberGrouping = "Subscribed to social emails";
      order = 0;
    } else if (member.groupMember && !member.mailchimpLists.socialEvents.subscribed) {
      memberGrouping = "Not subscribed to social emails";
      order = 1;
    } else if (!member.groupMember) {
      memberGrouping = "Not a group member";
      order = 2;
    } else {
      memberGrouping = "Unexpected state";
      order = 3;
    }
    return {
      id: this.memberService.extractMemberId(member),
      order,
      memberGrouping,
      text: this.fullNameWithAlias.transform(member)
    };
  }

  editAllEKWGRecipients() {
    this.notification.content.destinationType = "custom";
    this.notification.content.campaignId = this.campaignIdFor("general");
    this.notification.content.list = "general";
    this.notification.content.recipients = this.allGeneralSubscribedList();
    this.showSelectedMemberIds();

  }

  private showSelectedMemberIds() {
    this.notification.content.selectedMemberIds = this.notification.content.recipients.map(item => item.id);
    this.onChange();
    this.campaignIdChanged();
    this.logger.debug("notification.content.destinationType", this.notification.content.destinationType, "notification.content.addresseeType", this.notification.content.addresseeType);
  }

  editAllWalksRecipients() {
    this.logger.debug("editAllWalksRecipients");
    this.notification.content.destinationType = "custom";
    this.notification.content.campaignId = this.campaignIdFor("walks");
    this.notification.content.list = "walks";
    this.notification.content.recipients = this.allWalksSubscribedList();
    this.showSelectedMemberIds();
  }

  editAllSocialRecipients() {
    this.logger.debug("editAllSocialRecipients");
    this.notification.content.destinationType = "custom";
    this.notification.content.campaignId = this.campaignIdFor("socialEvents");
    this.notification.content.list = "socialEvents";
    this.notification.content.recipients = this.allSocialSubscribedList();
    this.showSelectedMemberIds();
  }

  editCommitteeRecipients() {
    this.logger.debug("editCommitteeRecipients");
    this.notification.content.destinationType = "custom";
    this.notification.content.campaignId = this.campaignIdFor("committee");
    this.notification.content.list = "general";
    this.notification.content.recipients = this.allCommitteeList();
    this.showSelectedMemberIds();
  }

  clearRecipientsForCampaignOfType(campaignType?: string) {
    this.notification.content.customCampaignType = campaignType;
    this.notification.content.campaignId = this.campaignIdFor(campaignType);
    this.notification.content.list = "general";
    this.notification.content.recipients = [];
    this.showSelectedMemberIds();
  }

  campaignIdFor(campaignType: string): string {
    switch (campaignType) {
      case "committee":
        return this.config.mailchimp.campaigns.committee.campaignId;
      case "general":
        return this.config.mailchimp.campaigns.newsletter.campaignId;
      case "socialEvents":
        return this.config.mailchimp.campaigns.socialEvents.campaignId;
      case "walks":
        return this.config.mailchimp.campaigns.walkNotification.campaignId;
      default:
        return this.config.mailchimp.campaigns.committee.campaignId;
    }
  }

  campaignInfoForCampaign(campaignId: string) {
    return chain(this.config.mailchimp.campaigns)
      .map((data, campaignType) => {
        const campaignData = extend({campaignType}, data);
        this.logger.off("campaignData for", campaignType, "->", campaignData);
        return campaignData;
      }).find({campaignId})
      .value();
  }

  campaignIdChanged() {
    const infoForCampaign = this.campaignInfoForCampaign(this.notification.content.campaignId);
    this.logger.debug("for campaignId", this.notification.content.campaignId, "infoForCampaign", infoForCampaign);
    if (infoForCampaign) {
      this.notification.content.title = infoForCampaign.name;
    }
  }

  handleNotificationError(errorResponse) {
    this.notify.clearBusy();
    this.notify.error({
      title: "Your notification could not be sent",
      message: (errorResponse.message || errorResponse) + (errorResponse.error ? (". Error was: " + JSON.stringify(errorResponse.error)) : "")
    });
  }

  populateContentSections(notificationText: string) {
    this.logger.debug("populateContentSections -> notificationText", notificationText);
    return {
      sections: {
        notification_text: notificationText
      }
    };
  }

  sendEmailCampaign(notificationText: string, campaignName: string, dontSend: boolean) {
    const contentSections = this.populateContentSections(notificationText);
    this.notify.progress(dontSend ? ("Preparing to complete " + campaignName + " in Mailchimp") : ("Sending " + campaignName));

    const validateExistenceOf = (list: string, fieldName: string) => {
      return Promise.reject("Cannot send email from " + list + " list as there is no mailchimp " + fieldName + " configured. Check Committee Notification settings and make sure all fields are complete.");
      this.logger.debug("all good with fieldName", fieldName);
    };

    return this.mailchimpConfig.getConfig()
      .then((config) => {
        const replyToRole = this.notification.content.signoffAs.value || "secretary";
        this.logger.debug("replyToRole", replyToRole);

        let members: MemberFilterSelection[];
        const list = this.notification.content.list;
        const otherOptions = {
          from_name: this.committeeReferenceData.contactUsField(replyToRole, "fullName"),
          from_email: this.committeeReferenceData.contactUsField(replyToRole, "email"),
          list_id: config.mailchimp.lists[list]
        };
        this.logger.debug("Sending " + campaignName, "with otherOptions", otherOptions, "config", config);
        const segmentId = config?.mailchimp?.segments?.general?.committeeSegmentId;
        const campaignId = this.notification.content?.campaignId;

        if (!campaignId) {
          return validateExistenceOf(list, "campaign id");
        }
        if (!segmentId) {
          return validateExistenceOf(list, "segment id");
        }

        this.logger.debug("Sending Sending" + campaignId, "segmentId", segmentId);

        switch (this.notification.content.destinationType) {
          case "custom":
            members = this.notification.content.recipients.filter(item => this.notification.content.selectedMemberIds.includes(item.id));
            break;
          case "committee":
            members = this.allCommitteeList();
            break;
          default:
            members = [];
            break;
        }

        this.logger.debug("sendCommitteeNotification:notification->", this.notification);

        if (members.length === 0) {
          this.logger.debug("about to replicateAndSendWithOptions to", list, "list with campaignName", campaignName, "campaign Id", campaignId, "dontSend", dontSend);
          return this.mailchimpCampaignService.replicateAndSendWithOptions({
            campaignId,
            campaignName,
            contentSections,
            otherSegmentOptions: otherOptions,
            dontSend
          }).then((replicateCampaignResponse) => this.openInMailchimpIf(replicateCampaignResponse, dontSend));
        } else {
          const segmentPrefix = "Committee Notification Recipients";
          return this.mailchimpSegmentService.saveSegment(list, {segmentId}, members, segmentPrefix, this.members)
            .then(segmentResponse => {
              this.logger.debug("segmentResponse following save segment of segmentPrefix:", segmentPrefix, "->", segmentResponse);
              this.logger.debug("about to replicateAndSendWithOptions to committee with campaignName", campaignName, "campaign Id", campaignId, "segmentId", segmentResponse.segment.id);
              return this.mailchimpCampaignService.replicateAndSendWithOptions({
                campaignId,
                campaignName,
                contentSections,
                segmentId: segmentResponse.segment.id,
                otherSegmentOptions: otherOptions,
                dontSend
              }).then((replicateCampaignResponse) => this.openInMailchimpIf(replicateCampaignResponse, dontSend));
            });
        }
      });
  }

  openInMailchimpIf(replicateCampaignResponse: MailchimpCampaignReplicateIdentifiersResponse, dontSend) {
    this.logger.debug("openInMailchimpIf:replicateCampaignResponse", replicateCampaignResponse, "dontSend", dontSend);
    if (dontSend) {
      return window.open(`${this.mailchimpLinkService.completeInMailchimp(replicateCampaignResponse.web_id)}`, "_blank");
    } else {
      return true;
    }
  }

  notifyEmailSendComplete(campaignName: string) {
    this.notify.clearBusy();
    if (!this.notification.cancelled) {
      this.notify.success("Sending of " + campaignName + " was successful.", false);
      this.confirm.clear();
      this.bsModalRef.hide();
    }
  }

  confirmSendNotification(dontSend?: boolean) {
    const campaignName = this.notification.content.title;
    this.notify.setBusy();
    return Promise.resolve(this.generateNotificationHTML(this.notificationDirective, this.committeeFile, this.notification, this.members))
      .then(notificationText => this.sendEmailCampaign(notificationText, campaignName, dontSend))
      .then(() => this.notifyEmailSendComplete(campaignName))
      .catch((error) => this.handleNotificationError(error));
  }

  generateNotificationHTML(notificationDirective: CommitteeNotificationDirective, committeeFile: CommitteeFile, notification: Notification, members: Member[]): string {
    const componentAndData = new CommitteeNotificationComponentAndData(CommitteeNotificationDetailsComponent);
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentAndData.component);
    const viewContainerRef = notificationDirective.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.committeeFile = committeeFile;
    componentRef.instance.notification = notification;
    componentRef.instance.members = members;
    componentRef.instance.notification = notification;
    componentRef.changeDetectorRef.detectChanges();
    const html = componentRef.location.nativeElement.innerHTML;
    this.logger.debug("notification html ->", html);
    return html;
  }

  completeInMailchimp() {
    this.notify.warning({
      title: "Complete in Mailchimp",
      message: "You can close this dialog now as the message was presumably completed and sent in Mailchimp"
    });
    this.confirmSendNotification(true);
  }

  cancelSendNotification() {
    if (this.notifyTarget.busy) {
      this.notification.cancelled = true;
      this.notify.error({
        title: "Cancelling during send",
        message: "Because notification sending was already in progress when you cancelled, campaign may have already been sent - check in Mailchimp if in doubt."
      });
    } else {
      this.logger.debug("calling cancelSendNotification");
      this.confirm.clear();
      this.bsModalRef.hide();
    }
  }

  onFromDateChange(dateValue: DateValue) {
    this.notification.groupEventsFilter.fromDate = dateValue;
    this.populateGroupEvents();
  }

  onToDateChange(dateValue: DateValue) {
    this.notification.groupEventsFilter.toDate = dateValue;
    this.populateGroupEvents();
  }

  helpMembers() {
    return `Click below and select`;
  }

  multiSelectLabel() {
    return `TBD?`;
  }

  onChange() {
    if (this.notification.content.selectedMemberIds.length > 0) {
      this.notify.warning({
        title: "Member selection",
        message: `${this.notification.content.selectedMemberIds.length} members manually selected`
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

  selectAllGroupEvents() {
    this.notification.groupEventsFilter.selectAll = !this.notification.groupEventsFilter.selectAll;
    this.logger.debug("select all=", this.notification.groupEventsFilter.selectAll);
    this.notification.groupEvents.forEach(event => event.selected = this.notification.groupEventsFilter.selectAll);
  }
}
