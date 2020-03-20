import { Component, Inject, OnInit } from "@angular/core";
import { omit } from "lodash-es";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { chain } from "../../../functions/chain";
import { AlertTarget } from "../../../models/alert-target.model";
import { Member, MemberUpdateAudit } from "../../../models/member.model";
import { EditMode } from "../../../models/ui-actions";
import { DateUtilsService } from "../../../services/date-utils.service";
import { DbUtilsService } from "../../../services/db-utils.service";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpConfigService } from "../../../services/mailchimp-config.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberNamingService } from "../../../services/member/member-naming.service";
import { MemberUpdateAuditService } from "../../../services/member/member-update-audit.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { ProfileConfirmationService } from "../../../services/profile-confirmation.service";
import { StringUtilsService } from "../../../services/string-utils.service";

@Component({
  selector: "app-member-admin-modal",
  templateUrl: "./member-admin-modal.component.html",
  styleUrls: ["./member-admin-modal.component.sass"]
})
export class MemberAdminModalComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  member: Member;
  editMode: EditMode;
  lastLoggedIn: number;
  private mailchimpApiUrl: string;
  membershipExpiryDate: Date;
  private logger: Logger;
  members: Member[] = [];
  memberUpdateAudits: MemberUpdateAudit[] = [];
  public allowEdits: boolean;
  public allowDelete: boolean;
  public allowCopy: boolean;
  public allowConfirmDelete = false;
  public saveInProgress: boolean;
  private duplicate: boolean;

  constructor(@Inject("MailchimpSegmentService") private mailchimpSegmentService,
              @Inject("MailchimpCampaignService") private mailchimpCampaignService,
              private notifierService: NotifierService,
              private memberUpdateAuditService: MemberUpdateAuditService,
              private memberNamingService: MemberNamingService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private modalService: BsModalService,
              private mailchimpConfigService: MailchimpConfigService,
              private memberLoginService: MemberLoginService,
              private profileConfirmationService: ProfileConfirmationService,
              private emailSubscriptionService: EmailSubscriptionService,
              private dbUtils: DbUtilsService,
              protected dateUtils: DateUtilsService,
              public bsModalRef: BsModalRef,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberAdminModalComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("constructed with member", this.member, this.members.length, "members");
    this.allowEdits = this.memberLoginService.allowMemberAdminEdits();
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.mailchimpConfigService.getConfig().then(config => {
      this.mailchimpApiUrl = config.mailchimp.apiUrl;
    });

    const existingRecordEditEnabled = this.allowEdits && this.editMode === EditMode.EDIT;
    const memberId = this.member.id;
    this.allowConfirmDelete = false;
    this.allowCopy = existingRecordEditEnabled;
    this.allowDelete = !!memberId;
    this.memberUpdateAudits = [];
    if (memberId) {
      this.logger.debug("querying MemberUpdateAuditService for memberId", memberId);
      this.memberUpdateAuditService.all({
        criteria: {
          memberId
        }, sort: {updateTime: -1}
      }).then(memberUpdateAudits => {
        this.logger.debug("MemberUpdateAuditService:", memberUpdateAudits.length, "events", memberUpdateAudits);
        this.memberUpdateAudits = memberUpdateAudits;
        this.lastLoggedIn = this.findLastLoginTimeForMember();
      });
    } else {
      this.logger.debug("new member with default values", this.member);
    }
  }

  deleteMemberDetails() {
    this.allowDelete = false;
    this.allowConfirmDelete = true;
  }

  findLastLoginTimeForMember() {
    const memberAudit = chain(this.memberUpdateAudits)
      .filter(memberAudit => memberAudit.loginTime)
      .sortBy(memberAudit => memberAudit.lastLoggedIn)
      .last()
      .value();
    return memberAudit && memberAudit.loginTime;
  }

  confirmDeleteMemberDetails() {
    this.memberService.delete(this.member).then(() => this.bsModalRef.hide());
  }

  viewMailchimpListEntry(item: string) {
    return window.open(`${this.mailchimpApiUrl}/lists/members/view?id=${item}`);
  }

  profileSettingsConfirmedChecked() {
    this.profileConfirmationService.processMember(this.member);
  }

  close() {
    this.bsModalRef.hide();
  }

  onMembershipDateChange(date: Date) {
    if (date) {
      this.logger.debug("onDateChange:date", date);
      this.membershipExpiryDate = date;
      this.member.membershipExpiryDate = this.dateUtils.asValueNoTime(this.membershipExpiryDate);
    }
  }

  saveMemberDetails() {
    const member = this.dateUtils.convertDateFieldInObject(this.member, "membershipExpiryDate");
    this.saveInProgress = true;

    if (!member.userName) {
      member.userName = this.memberNamingService.createUniqueUserName(member, this.members);
      this.logger.debug("creating username", member.userName);
    }

    if (!member.displayName) {
      member.displayName = this.memberNamingService.createUniqueDisplayName(member, this.members);
      this.logger.debug("creating displayName", member.displayName);
    }

    return Promise.resolve(this.notify.success("Saving member", true))
      .then(() => this.preProcessMemberBeforeSave())
      .then(() => this.saveAndHide())
      .then(() => this.notify.success("Member saved successfully"))
      .catch((error) => this.handleSaveError(error));
  }

  handleSaveError(errorResponse) {

    this.logger.debug("handleSaveError:errorResponse", errorResponse);
    this.saveInProgress = false;
    const message = this.stringUtils.stringify(errorResponse);
    const duplicate = message.includes("duplicate");

    this.logger.debug("errorResponse", errorResponse, "duplicate", duplicate);
    let notifyMessage;
    if (duplicate) {
      notifyMessage = `You've entered duplicate data: ${this.dbUtils.duplicateErrorFields(message)}.
       A member record must have a unique Email Address, Display Name, Ramblers Membership Number and combination of First Name,
        Last Name and Alias. Please amend the current details and try again.`;
      this.duplicate = true;
    } else {
      notifyMessage = errorResponse;
    }
    this.notify.clearBusy();
    this.notify.error({
      title: "Member could not be saved",
      message: notifyMessage
    });
  }

  preProcessMemberBeforeSave() {
    return this.emailSubscriptionService.resetUpdateStatusForMember(this.member);
  }

  saveAndHide() {
    return this.memberService.createOrUpdate(this.member)
      .then(() => this.bsModalRef.hide());
  }

  copyDetailsToNewMember() {
    const copiedMember = omit(this.member, "id");
    this.emailSubscriptionService.defaultMailchimpSettings(copiedMember, true);
    this.profileConfirmationService.unconfirmProfile(copiedMember);
    this.member = copiedMember;
    this.editMode = EditMode.COPY_EXISTING;
    this.notify.success("Existing Member copied! Make changes here and save to create new member.");
  }

}
