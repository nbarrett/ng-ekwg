import { Component, Inject, OnInit } from "@angular/core";
import { find, map } from "lodash-es";
import { BsModalRef, BsModalService, TooltipDirective } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { chain } from "../../../functions/chain";
import { AlertTarget } from "../../../models/alert-target.model";
import { Member } from "../../../models/member.model";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { DateUtilsService } from "../../../services/date-utils.service";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpConfigService } from "../../../services/mailchimp-config.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";

const CAMPAIGN_TYPE_WELCOME = "welcome";
const CAMPAIGN_TYPE_PASSWORD_RESET = "passwordReset";
const CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING = "expiredMembersWarning";
const CAMPAIGN_TYPE_EXPIRED_MEMBERS = "expiredMembers";

@Component({
  selector: "app-member-admin-send-emails-modal",
  templateUrl: "./send-emails-modal.component.html",
  styleUrls: ["./send-emails-modal.component.sass"]
})
export class SendEmailsModalComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  public display: any = {};
  members: Member[] = [];
  today = this.dateUtils.momentNowNoTime().valueOf();
  private alertTypeResetPassword: boolean;
  memberFilterDate: Date;

  constructor(@Inject("MailchimpSegmentService") private mailchimpSegmentService,
              @Inject("MailchimpCampaignService") private mailchimpCampaignService,
              private mailchimpConfig: MailchimpConfigService,
              private notifierService: NotifierService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private fullNameWithAliasPipe: FullNameWithAliasPipe,
              private modalService: BsModalService,
              private mailchimpConfigService: MailchimpConfigService,
              private emailSubscriptionService: EmailSubscriptionService,
              protected dateUtils: DateUtilsService,
              public bsModalRef: BsModalRef,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SendEmailsModalComponent, NgxLoggerLevel.DEBUG);
  }

  selectedAccounts = ["Michael"];
  accounts = [
    {name: "Jill", email: "jill@email.com", age: 15, country: undefined, child: {state: "Active"}},
    {name: "Henry", email: "henry@email.com", age: 10, country: undefined, child: {state: "Active"}},
    {name: "Meg", email: "meg@email.com", age: 7, country: null, child: {state: "Active"}},
    {name: "Adam", email: "adam@email.com", age: 12, country: "United States", child: {state: "Active"}},
    {name: "Homer", email: "homer@email.com", age: 47, country: "", child: {state: "Active"}},
    {name: "Samantha", email: "samantha@email.com", age: 30, country: "United States", child: {state: "Active"}},
    {name: "Amalie", email: "amalie@email.com", age: 12, country: "Argentina", child: {state: "Active"}},
    {name: "Estefanía", email: "estefania@email.com", age: 21, country: "Argentina", child: {state: "Active"}},
    {name: "Adrian", email: "adrian@email.com", age: 21, country: "Ecuador", child: {state: "Active"}},
    {name: "Wladimir", email: "wladimir@email.com", age: 30, country: "Ecuador", child: {state: "Inactive"}},
    {name: "Natasha", email: "natasha@email.com", age: 54, country: "Ecuador", child: {state: "Inactive"}},
    {name: "Nicole", email: "nicole@email.com", age: 43, country: "Colombia", child: {state: "Inactive"}},
    {name: "Michael", email: "michael@email.com", age: 15, country: "Colombia", child: {state: "Inactive"}},
    {name: "Nicolás", email: "nicole@email.com", age: 43, country: "Colombia", child: {state: "Inactive"}}
  ];

  groupByFn1 = (item) => item.child.state;
  groupByFn = (item) => item.memberGrouping;

  groupValueFn = (_: string, children: any[]) => ({name: children[0].memberGrouping, total: children.length});

  ngOnInit() {
    this.logger.debug("constructed with members", this.members.length, "members");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.display = {
      showHelp: false,
      selectableMembers: [],
      emailMembers: [],
      saveInProgress: false,
      monthsInPast: 1,
      memberFilterDate: undefined,
      emailType: {name: "(loading)"},
      passwordResetCaption: () => "About to send a " + this.display.emailType.name + " to " + this.display.emailMembers.length + " member" + (this.display.emailMembers.length === 1 ? "" : "s"),
      expiryEmailsSelected: () => this.display.emailType.type === CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING || this.display.emailType.type === CAMPAIGN_TYPE_EXPIRED_MEMBERS,
      recentMemberEmailsSelected: () => this.display.emailType.type === CAMPAIGN_TYPE_WELCOME || this.display.emailType.type === CAMPAIGN_TYPE_PASSWORD_RESET
    };

    this.mailchimpConfig.getConfig()
      .then(config => {
        this.display.emailTypes = [
          {
            preSend: () => this.addPasswordResetIdToMembers(),
            type: CAMPAIGN_TYPE_WELCOME,
            name: config.mailchimp.campaigns.welcome.name,
            monthsInPast: config.mailchimp.campaigns.welcome.monthsInPast,
            campaignId: config.mailchimp.campaigns.welcome.campaignId,
            segmentId: config.mailchimp.segments.general.welcomeSegmentId,
            memberSelection: "recently-added",
            postSend: () => this.noAction(),
            dateTooltip: "All members created in the last " + config.mailchimp.campaigns.welcome.monthsInPast + " month are displayed as a default, as these are most likely to need a welcome email sent"
          },
          {
            preSend: () => this.addPasswordResetIdToMembers(),
            type: CAMPAIGN_TYPE_PASSWORD_RESET,
            name: config.mailchimp.campaigns.passwordReset.name,
            monthsInPast: config.mailchimp.campaigns.passwordReset.monthsInPast,
            campaignId: config.mailchimp.campaigns.passwordReset.campaignId,
            segmentId: config.mailchimp.segments.general.passwordResetSegmentId,
            memberSelection: "recently-added",
            postSend: () => this.noAction(),
            dateTooltip: "All members created in the last " + config.mailchimp.campaigns.passwordReset.monthsInPast + " month are displayed as a default"
          },
          {
            preSend: () => this.includeInNextMailchimpListUpdate(),
            type: CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING,
            name: config.mailchimp.campaigns.expiredMembersWarning.name,
            monthsInPast: config.mailchimp.campaigns.expiredMembersWarning.monthsInPast,
            campaignId: config.mailchimp.campaigns.expiredMembersWarning.campaignId,
            segmentId: config.mailchimp.segments.general.expiredMembersWarningSegmentId,
            memberSelection: "expired-members",
            postSend: () => this.noAction(),
            dateTooltip: "Using the expiry date field, you can choose which members will automatically be included. " +
              "A date " + config.mailchimp.campaigns.expiredMembersWarning.monthsInPast + " months in the past has been pre-selected, to avoid including members whose membership renewal is still progress"
          },
          {
            preSend: () => this.includeInNextMailchimpListUpdate(),
            type: CAMPAIGN_TYPE_EXPIRED_MEMBERS,
            name: config.mailchimp.campaigns.expiredMembers.name,
            monthsInPast: config.mailchimp.campaigns.expiredMembers.monthsInPast,
            campaignId: config.mailchimp.campaigns.expiredMembers.campaignId,
            segmentId: config.mailchimp.segments.general.expiredMembersSegmentId,
            memberSelection: "expired-members",
            postSend: () => this.removeExpiredMembersFromGroup(),
            dateTooltip: "Using the expiry date field, you can choose which members will automatically be included. " +
              "A date 3 months in the past has been pre-selected, to avoid including members whose membership renewal is still progress"
          }
        ];
        this.display.emailType = this.display.emailTypes[0];
        this.populateMembers(true);
        this.populateSelectableMembers();
      });
  }

  helpMembers() {
    return `Click below and select from the dropdown the members that you want to send a ${this.display.emailType.name} email to. You can type in  part of their name to find them more quickly. Repeat this step as many times as required to build up an list of members`;
  }

  showHelp(show: boolean, tooltips: TooltipDirective[]) {
    this.logger.debug("tooltip:", show, "tooltips:", tooltips);
    tooltips.forEach(tooltip => show ? tooltip.show() : tooltip.hide());
    this.display.showHelp = show;
  }

  cancel() {
    this.bsModalRef.hide();
  }

  populateSelectableMembers() {
    this.display.selectableMembers = chain(this.members)
      .filter(member => this.emailSubscriptionService.includeMemberInEmailList("general", member))
      .map(member => this.renderSelectableMembers(member))
      .value();
    this.logger.debug("populateSelectableMembers:found", this.display.selectableMembers.length, "members");
  }

  calculateMemberFilterDate() {
    const dateFilter = this.dateUtils.momentNowNoTime().subtract(this.display && this.display.emailType.monthsInPast, "months");
    this.memberFilterDate = dateFilter.toDate();
    this.display.memberFilterDate = dateFilter.valueOf();
    this.logger.info("calculateMemberFilterDate:", this.display.memberFilterDate, this.memberFilterDate);
  }

  clearDisplayEmailMembers() {
    this.display.emailMembers = [];
    this.notify.warning({
      title: "Member selection",
      message: "current member selection was cleared"
    });
  }

  renderSelectableMembers(member) {
    return this.display.expiryEmailsSelected() ? this.renderExpiryInformation(member) : this.renderCreatedInformation(member);
  }

  renderExpiryInformation(member) {
    const expiredActive = member.membershipExpiryDate < this.today ? "expired" : "active";
    const memberGrouping = member.receivedInLastBulkLoad ? expiredActive : "missing from last bulk load";
    const datePrefix = memberGrouping === "expired" ? ": " : ", " + (member.membershipExpiryDate < this.today ? "expired" : "expiry") + ": ";
    const memberInformation = this.fullNameWithAliasPipe.transform(member) + " (" + memberGrouping + datePrefix + (this.dateUtils.displayDate(member.membershipExpiryDate) || "not known") + ")";
    return {id: member.id, memberInformation, memberGrouping};
  }

  renderCreatedInformation(member) {
    const memberGrouping = member.membershipExpiryDate < this.today ? "expired" : "active";
    const memberInformation = this.fullNameWithAliasPipe.transform(member) + " (created " + (this.dateUtils.displayDate(member.createdDate) || "not known") + ")";
    return {id: member.id, memberInformation, memberGrouping};
  }

  memberGrouping = member => member.memberGrouping;

  onMemberFilterDateChange(date: Date) {
    this.logger.debug("date", date);
    this.display.memberFilterDate = this.dateUtils.asValueNoTime(date);
  }

  populateMembersBasedOnFilter(filter) {
    this.logger.debug("populateExpiredMembers: display.emailType ->", this.display.emailType);
    this.notify.setBusy();
    this.notify.warning({
      title: "Automatically adding expired members",
      message: " - please wait for list to be populated"
    });

    this.display.memberFilterDate = this.dateUtils.convertDateField(this.display.memberFilterDate);

    this.display.emailMembers = chain(this.display.selectableMembers)
      .filter(filter);
    this.notify.warning({
      title: "Members added to email selection",
      message: "automatically added " + this.display.emailMembers.length + " members"
    });
    this.notify.clearBusy();
  }

  populateMembers(recalcMemberFilterDate) {
    this.logger.debug("this.display.memberSelection", this.display.emailType.memberSelection);
    this.populateSelectableMembers();
    switch (this.display.emailType.memberSelection) {
      case "recently-added":
        this.populateRecentlyAddedMembers(recalcMemberFilterDate);
        break;
      case "expired-members":
        this.populateExpiredMembers(recalcMemberFilterDate);
        break;
    }
  }

  populateRecentlyAddedMembers(recalcMemberFilterDate) {
    if (recalcMemberFilterDate) {
      this.calculateMemberFilterDate();
    }
    this.populateMembersBasedOnFilter(member => {
      this.logger.debug("populateMembersBasedOnFilter:member", member);
      return member.groupMember && (member.createdDate >= this.display.memberFilterDate);
    });
  }

  populateExpiredMembers(recalcMemberFilterDate?: any) {
    this.logger.debug("populateExpiredMembers:recalcMemberFilterDate", recalcMemberFilterDate);
    if (recalcMemberFilterDate) {
      this.calculateMemberFilterDate();
    }
    this.populateMembersBasedOnFilter(member => {
      const expirationExceeded = member.membershipExpiryDate < this.display.memberFilterDate;
      this.logger.debug("populateMembersBasedOnFilter:expirationExceeded", expirationExceeded, member);
      return member.groupMember && member.membershipExpiryDate && expirationExceeded;
    });
  }

  populateMembersMissingFromBulkLoad(recalcMemberFilterDate?: any) {
    if (recalcMemberFilterDate) {
      this.calculateMemberFilterDate();
    }
    this.populateMembersBasedOnFilter(member => {
      this.logger.debug("populateMembersBasedOnFilter:member", member);
      return member.groupMember && member.membershipExpiryDate && !member.receivedInLastBulkLoad;
    });
  }

  displayEmailMembersToMembers() {
    return chain(this.display.emailMembers)
      .map(memberId => find(this.members, member => this.memberService.extractMemberId(member) === memberId.id))
      .filter(member => member && member.email).value();
  }

  addPasswordResetIdToMembers() {

    const saveMemberPromises = [];

    map(this.displayEmailMembersToMembers(), member => {
      this.memberService.setPasswordResetId(member);
      this.emailSubscriptionService.resetUpdateStatusForMember(member);
      saveMemberPromises.push(this.memberService.createOrUpdate(member));
    });

    return Promise.all(saveMemberPromises).then(() => this.notify.success("Password reset prepared for " + saveMemberPromises.length + " member(s)"));

  }

  includeInNextMailchimpListUpdate() {

    const saveMemberPromises = [];

    map(this.displayEmailMembersToMembers(), member => {
      this.emailSubscriptionService.resetUpdateStatusForMember(member);
      saveMemberPromises.push(this.memberService.createOrUpdate(member));
    });

    return Promise.all(saveMemberPromises).then(() => this.notify.success("Member expiration prepared for " + saveMemberPromises.length + " member(s)"));

  }

  noAction() {
  }

  removeExpiredMembersFromGroup() {
    this.logger.debug("removing ", this.display.emailMembers.length, "members from group");
    const saveMemberPromises = [];

    chain(this.display.emailMembers)
      .map(memberId => find(this.members, member => this.memberService.extractMemberId(member) === memberId.id)).map(member => {
      member.groupMember = false;
      this.emailSubscriptionService.resetUpdateStatusForMember(member);
      saveMemberPromises.push(this.memberService.createOrUpdate(member));
    });

    return Promise.all(saveMemberPromises)
      .then(() => this.notify.success("EKWG group membership removed for " + saveMemberPromises.length + " member(s)"));
  }

  cancelSendEmails() {
    this.cancel();
  }

  sendEmailsDisabled() {
    return this.display.emailMembers.length === 0;
  }

  sendEmails() {
    this.alertTypeResetPassword = true;
    this.display.saveInProgress = true;
    this.display.duplicate = false;
    Promise.resolve(this.notify.success("Preparing to email " + this.display.emailMembers.length + " member" + (this.display.emailMembers.length === 1 ? "" : "s"), true))
      .then(() => this.display.emailType.preSend())
      .then(() => this.updateGeneralList())
      .then(() => this.createOrSaveMailchimpSegment())
      .then((segmentResponse) => this.saveSegmentDataToMailchimpConfig(segmentResponse))
      .then((segmentId) => this.sendEmailCampaign(segmentId))
      .then(() => this.display.emailType.postSend())
      .then(() => this.notify.clearBusy())
      .then(() => this.cancel())
      .then(() => this.resetSendFlags())
      .catch((error) => this.handleSendError(error));
  }

  resetSendFlags() {
    this.logger.debug("resetSendFlags");
    this.notify.clearBusy();
  }

  updateGeneralList() {
    return this.emailSubscriptionService.createBatchSubscriptionForList("general", this.members).then(updatedMembers => {
      this.members = updatedMembers;
    });
  }

  createOrSaveMailchimpSegment() {
    return this.mailchimpSegmentService.saveSegment("general", {segmentId: this.display.emailType.segmentId}, this.display.emailMembers, this.display.emailType.name, this.members);
  }

  saveSegmentDataToMailchimpConfig(segmentResponse) {
    this.logger.debug("saveSegmentDataToMailchimpConfig:segmentResponse", segmentResponse);
    return this.mailchimpConfig.getConfig()
      .then(config => {
        config.mailchimp.segments.general[this.display.emailType.type + "SegmentId"] = segmentResponse.segment.id;
        return this.mailchimpConfig.saveConfig(config)
          .then(() => {
            this.logger.debug("saveSegmentDataToMailchimpConfig:returning segment id", segmentResponse.segment.id);
            return segmentResponse.segment.id;
          });
      });
  }

  sendEmailCampaign(segmentId) {
    const members = this.display.emailMembers.length + " member(s)";
    this.notify.success("Sending " + this.display.emailType.name + " email to " + members);
    this.logger.debug("about to sendEmailCampaign:", this.display.emailType.type, "campaign Id", this.display.emailType.campaignId, "segmentId", segmentId, "campaignName", this.display.emailType.name);
    return this.mailchimpCampaignService.replicateAndSendWithOptions({
      campaignId: this.display.emailType.campaignId,
      campaignName: this.display.emailType.name,
      segmentId
    }).then(() => {
      this.notify.success("Sending of " + this.display.emailType.name + " to " + members + " was successful");
    });
  }

  emailMemberList() {
    return chain(this.display.emailMembers)
      .sortBy(emailMember => emailMember.text).map(emailMember => emailMember.text)
      .value().join(", ");
  }

  handleSendError(errorResponse) {
    this.notify.clearBusy();
    this.logger.error(errorResponse);
    this.notify.error({
      title: "Your notification could not be sent",
      message: (errorResponse.message || errorResponse) + (errorResponse.error ? (". Error was: " + this.stringUtils.stringify(errorResponse.error)) : "")
    });
    this.notify.clearBusy();
  }

}
