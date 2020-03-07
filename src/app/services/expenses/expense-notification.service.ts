import { ComponentFactoryResolver, Inject, Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import {
  ExpenseClaim,
  ExpenseEvent,
  ExpenseEventType,
  ExpenseNotificationConfiguration,
  ExpenseNotificationContentSections,
  ExpenseNotificationMapping
} from "../../models/expense.model";
import { Member } from "../../models/member.model";
import { ExpenseNotificationComponentAndData, ExpenseNotificationDirective } from "../../notifications/expenses/expense-notification.directive";
import { ExpenseNotificationApproverFirstApprovalComponent } from "../../notifications/expenses/templates/approver/expense-notification-approver-first-approval.component";
import { ExpenseNotificationApproverPaidComponent } from "../../notifications/expenses/templates/approver/expense-notification-approver-paid.component";
import { ExpenseNotificationApproverReturnedComponent } from "../../notifications/expenses/templates/approver/expense-notification-approver-returned.component";
import { ExpenseNotificationApproverSubmittedComponent } from "../../notifications/expenses/templates/approver/expense-notification-approver-submitted.component";
import { ExpenseNotificationCreatorPaidComponent } from "../../notifications/expenses/templates/creator/expense-notification-creator-paid.component";
import { ExpenseNotificationCreatorReturnedComponent } from "../../notifications/expenses/templates/creator/expense-notification-creator-returned.component";
import { ExpenseNotificationCreatorSecondApprovalComponent } from "../../notifications/expenses/templates/creator/expense-notification-creator-second-approval.component";
import { ExpenseNotificationCreatorSubmittedComponent } from "../../notifications/expenses/templates/creator/expense-notification-creator-submitted.component";
import { ExpenseNotificationTreasurerPaidComponent } from "../../notifications/expenses/templates/treasurer/expense-notification-treasurer-paid.component";
import { ExpenseNotificationTreasurerSecondApprovalComponent } from "../../notifications/expenses/templates/treasurer/expense-notification-treasurer-second-approval.component";
import { ExpenseDisplayService } from "../../pages/admin/expenses/expense-display.service";
import { AuditDeltaValuePipe } from "../../pipes/audit-delta-value.pipe";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { FullNameWithAliasPipe } from "../../pipes/full-name-with-alias.pipe";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MailchimpConfigService } from "../mailchimp-config.service";
import { MemberLoginService } from "../member/member-login.service";
import { MemberService } from "../member/member.service";
import { AlertInstance, NotifierService } from "../notifier.service";
import { UrlService } from "../url.service";
import { ExpenseClaimService } from "./expense-claim.service";

@Injectable({
  providedIn: "root"
})

export class ExpenseNotificationService {
  private logger: Logger;

  constructor(
    @Inject("MailchimpSegmentService") private mailchimpSegmentService,
    @Inject("MailchimpCampaignService") private mailchimpCampaignService,
    @Inject("RamblersWalksAndEventsService") private ramblersWalksAndEventsService,
    private mailchimpConfig: MailchimpConfigService,
    protected memberService: MemberService,
    private urlService: UrlService,
    private expenseClaimService: ExpenseClaimService,
    private memberLoginService: MemberLoginService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private notifierService: NotifierService,
    private fullNameWithAliasPipe: FullNameWithAliasPipe,
    private auditDeltaValuePipe: AuditDeltaValuePipe,
    private displayDatePipe: DisplayDatePipe,
    public display: ExpenseDisplayService,
    private dateUtils: DateUtilsService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ExpenseNotificationService, NgxLoggerLevel.OFF);
  }

  private expenseEventNotificationMappingsFor(eventType: ExpenseEventType) {
    const mappings: ExpenseNotificationMapping[] = [
      {
        expenseEventType: this.display.eventTypes.submitted,
        notifyCreator: ExpenseNotificationCreatorSubmittedComponent,
        notifyApprover: ExpenseNotificationApproverSubmittedComponent
      },
      {
        expenseEventType: this.display.eventTypes["first-approval"],
        notifyApprover: ExpenseNotificationApproverFirstApprovalComponent,
      },
      {
        expenseEventType: this.display.eventTypes["second-approval"],
        notifyCreator: ExpenseNotificationCreatorSecondApprovalComponent,
        notifyApprover: ExpenseNotificationApproverFirstApprovalComponent,
        notifyTreasurer: ExpenseNotificationTreasurerSecondApprovalComponent
      },
      {
        expenseEventType: this.display.eventTypes.returned,
        notifyCreator: ExpenseNotificationCreatorReturnedComponent,
        notifyApprover: ExpenseNotificationApproverReturnedComponent,
      },
      {
        expenseEventType: this.display.eventTypes.paid,
        notifyCreator: ExpenseNotificationCreatorPaidComponent,
        notifyApprover: ExpenseNotificationApproverPaidComponent,
        notifyTreasurer: ExpenseNotificationTreasurerPaidComponent
      },
    ];
    return mappings.find(mapping => mapping.expenseEventType === eventType);
  }

  public generateNotificationHTML(expenseClaim: ExpenseClaim, notificationDirective: ExpenseNotificationDirective, component): string {
    const componentAndData = new ExpenseNotificationComponentAndData(component, expenseClaim);
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentAndData.component);
    const viewContainerRef = notificationDirective.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    componentRef.instance.expenseClaim = componentAndData.data;
    componentRef.changeDetectorRef.detectChanges();
    const html = componentRef.location.nativeElement.innerHTML;
    this.logger.debug("notification html ->", html);
    return html;
  }

  sendCreatorNotifications(notify: AlertInstance, expenseNotificationDirective: ExpenseNotificationDirective, eventType: ExpenseEventType, expenseClaim: ExpenseClaim, members: Member[], member: Member, memberFullName: string, expenseClaimCreatedEvent: ExpenseEvent) {
    if (eventType.notifyCreator) {
      return this.sendNotificationsTo(notify, expenseNotificationDirective, eventType, expenseClaim, member, memberFullName, {
        component: this.expenseEventNotificationMappingsFor(eventType).notifyCreator,
        memberIds: [expenseClaimCreatedEvent.memberId],
        segmentType: "directMail",
        segmentNameSuffix: "",
        destination: "creator"
      }, members);
    }
    return false;
  }

  sendApproverNotifications(notify: AlertInstance, expenseNotificationDirective: ExpenseNotificationDirective, eventType: ExpenseEventType, expenseClaim: ExpenseClaim, members: Member[], member: Member, memberFullName: string) {
    if (eventType.notifyApprover) {
      return this.sendNotificationsTo(notify, expenseNotificationDirective, eventType, expenseClaim, member, memberFullName, {
        component: this.expenseEventNotificationMappingsFor(eventType).notifyApprover,
        memberIds: this.memberService.allMemberIdsWithPrivilege("financeAdmin", members),
        segmentType: "expenseApprover",
        segmentNameSuffix: "approval ",
        destination: "approvers"
      }, members);
    }
    return Promise.resolve(false);
  }

  sendTreasurerNotifications(notify: AlertInstance, expenseNotificationDirective: ExpenseNotificationDirective, eventType: ExpenseEventType, expenseClaim: ExpenseClaim, members: Member[], member: Member, memberFullName: string) {
    if (eventType.notifyTreasurer) {
      return this.sendNotificationsTo(notify, expenseNotificationDirective, eventType, expenseClaim, member, memberFullName, {
        component: this.expenseEventNotificationMappingsFor(eventType).notifyTreasurer,
        memberIds: this.memberService.allMemberIdsWithPrivilege("treasuryAdmin", members),
        segmentType: "expenseTreasurer",
        segmentNameSuffix: "payment ",
        destination: "treasurer"
      }, members);
    }
    return false;
  }

  createOrSaveMailchimpSegment(templateAndNotificationMembers, member: Member, segmentName: string, members: Member[]) {
    return this.mailchimpSegmentService.saveSegment("general", {segmentId: this.mailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType)}, templateAndNotificationMembers.memberIds, segmentName, members);
  }

  saveSegmentDataToMember(segmentResponse, templateAndNotificationMembers, member) {
    this.mailchimpSegmentService.setMemberSegmentId(member, templateAndNotificationMembers.segmentType, segmentResponse.segment.id);
    return this.memberService.update(member);
  }

  sendEmailCampaign(notify: AlertInstance, campaignName: string, campaignNameAndMember: string, templateAndNotificationMembers, member, contentSections: ExpenseNotificationContentSections) {
    this.display.showExpenseProgressAlert(notify, "Sending " + campaignNameAndMember);
    return this.mailchimpConfig.getConfig()
      .then(config => {
        const campaignId = config.mailchimp.campaigns.expenseNotification.campaignId;
        const segmentId = this.mailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType);
        this.logger.debug("about to replicateAndSendWithOptions with campaignName", campaignNameAndMember, "campaign Id", campaignId, "segmentId", segmentId);
        return this.mailchimpCampaignService.replicateAndSendWithOptions({
          campaignId,
          campaignName: campaignNameAndMember,
          contentSections,
          segmentId
        });
      })
      .then(() => {
        this.display.showExpenseProgressAlert(notify, `Sending of ${campaignNameAndMember} was successful`, true);
      });
  }

  notifyEmailSendComplete(notify: AlertInstance, campaignName: string) {
    this.display.showExpenseSuccessAlert(notify, `Sending of ${campaignName} was successful. Check your inbox for progress.`);
  }

  sendNotification(notify: AlertInstance, contentSections: ExpenseNotificationContentSections, templateAndNotificationMembers, member, campaignName: string, campaignNameAndMember: string, segmentName: string, members: Member[]) {
    return this.createOrSaveMailchimpSegment(templateAndNotificationMembers, member, segmentName, members)
      .then((segmentResponse) => this.saveSegmentDataToMember(segmentResponse, templateAndNotificationMembers, member))
      .then(() => this.sendEmailCampaign(notify, campaignName, campaignNameAndMember, templateAndNotificationMembers, member, contentSections))
      .then(() => this.notifyEmailSendComplete(notify, campaignName));

  }

  sendNotificationsTo(notify: AlertInstance, expenseNotificationDirective: ExpenseNotificationDirective, eventType: ExpenseEventType, expenseClaim: ExpenseClaim, member: Member, memberFullName: string, templateAndNotificationMembers: ExpenseNotificationConfiguration, members: Member[]) {
    this.logger.debug("sendNotificationsTo:", templateAndNotificationMembers);
    const campaignName: string = "Expense " + eventType.description + " notification (to " + templateAndNotificationMembers.destination + ")";
    const campaignNameAndMember: string = campaignName + " (" + memberFullName + ")";
    const segmentName = "Expense notification " + templateAndNotificationMembers.segmentNameSuffix + "(" + memberFullName + ")";
    if (templateAndNotificationMembers.memberIds.length === 0) {
      throw new Error("No members have been configured as " + templateAndNotificationMembers.destination + " therefore notifications for this step will fail!!");
    }
    const contentSections = {
      sections: {
        expense_id_url: `Please click <a href="${this.urlService.baseUrl()}/admin/expenseId/${expenseClaim.id}" target="_blank">this link</a> to see the details of the above expense claim, or to make changes to it.`,
        expense_notification_text: this.generateNotificationHTML(expenseClaim, expenseNotificationDirective, templateAndNotificationMembers.component)
      }
    };
    return this.sendNotification(notify, contentSections, templateAndNotificationMembers, member, campaignName, campaignNameAndMember, segmentName, members)
      .catch((error) => this.display.showExpenseEmailErrorAlert(notify, error));
  }

  sendNotificationsToAllRoles(notify: AlertInstance, expenseNotificationDirective: ExpenseNotificationDirective, expenseClaim: ExpenseClaim, expenseClaimCreatedEvent: ExpenseEvent, eventType: ExpenseEventType, members: Member[]) {
    return this.memberService.getById(expenseClaimCreatedEvent.memberId)
      .then(member => {
        this.logger.debug("sendNotification:", "memberId", expenseClaimCreatedEvent.memberId, "member", member);
        const memberFullName = this.fullNameWithAliasPipe.transform(member);
        return Promise.resolve(this.display.showExpenseProgressAlert(notify, `Preparing to email ${memberFullName}`))
          .then(() => this.sendCreatorNotifications(notify, expenseNotificationDirective, eventType, expenseClaim, members, member, memberFullName, expenseClaimCreatedEvent))
          .then(() => this.sendApproverNotifications(notify, expenseNotificationDirective, eventType, expenseClaim, members, member, memberFullName))
          .then(() => this.sendTreasurerNotifications(notify, expenseNotificationDirective, eventType, expenseClaim, members, member, memberFullName));
      });
  }

  createEventAndSendNotifications(notify: AlertInstance, expenseNotificationDirective: ExpenseNotificationDirective, expenseClaim: ExpenseClaim, members: Member[], eventType: ExpenseEventType, reason?: string) {
    notify.setBusy();
    const expenseClaimCreatedEvent = this.display.expenseClaimCreatedEvent(expenseClaim);
    return Promise.resolve(this.display.createEvent(expenseClaim, eventType, reason))
      .then(() => this.sendNotificationsToAllRoles(notify, expenseNotificationDirective, expenseClaim, expenseClaimCreatedEvent, eventType, members))
      .then(() => (() => this.expenseClaimService.createOrUpdate(expenseClaim)));
  }

}
