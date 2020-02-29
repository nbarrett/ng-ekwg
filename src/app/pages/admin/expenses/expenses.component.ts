import { DOCUMENT } from "@angular/common";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { clone, filter, find, isEqual, last } from "lodash-es";
import { BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { chain } from "../../../functions/chain";
import { AlertTarget } from "../../../models/alert-target.model";
import { ExpenseClaim, ExpenseEvent, ExpenseEventType, ExpenseItem, ExpenseType } from "../../../models/expense.model";
import { Member } from "../../../models/member.model";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { ExpenseClaimService } from "../../../services/expenses/expense-claim.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpConfigService } from "../../../services/mailchimp-config.service";
import { MailchimpListUpdaterService } from "../../../services/mailchimp/mailchimp-list-updater.service";
import { MemberBulkLoadService } from "../../../services/member/member-bulk-load.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { NumberUtilsService } from "../../../services/number-utils.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { ExpenseDetailModalComponent } from "./expense-detail-modal/expense-detail-modal.component";

const SELECTED_EXPENSE = "Expense from last email link";

@Component({
  selector: "app-expenses",
  templateUrl: "./expenses.component.html",
  styleUrls: ["./expenses.component.sass"]
})
export class ExpensesComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private receiptBaseUrl: string;
  private dataError: boolean;
  private members: Member[];
  private expenseClaims: ExpenseClaim[];
  private unfilteredExpenseClaims: any[];
  private alertMessages: any[];
  private filterTypes: (
    { filter: (expenseClaim) => (boolean); description: string; disabled: boolean } |
    { filter: (expenseClaim) => boolean; description: string } |
    { filter: (expenseClaim) => any; description: string } |
    { filter: () => boolean; description: string })[];
  private notificationsBaseUrl: string;

  public expenseTypes: ExpenseType[] = [
    {value: "travel-reccie", name: "Travel (walk reccie)", travel: true},
    {value: "travel-committee", name: "Travel (attend committee meeting)", travel: true},
    {value: "other", name: "Other"}];

  public eventTypes = {
    created: {description: "Created", editable: true} as ExpenseEventType,
    submitted: {description: "Submitted", actionable: true, notifyCreator: true, notifyApprover: true} as ExpenseEventType,
    "first-approval": {description: "First Approval", actionable: true, notifyApprover: true} as ExpenseEventType,
    "second-approval": {
      description: "Second Approval",
      actionable: true,
      notifyCreator: true,
      notifyApprover: true,
      notifyTreasurer: true
    } as ExpenseEventType,
    returned: {description: "Returned", atEndpoint: false, editable: true, notifyCreator: true, notifyApprover: true} as ExpenseEventType,
    paid: {description: "Paid", atEndpoint: true, notifyCreator: true, notifyApprover: true, notifyTreasurer: true} as ExpenseEventType
  };

  private selected: { expenseFilter: { filter: (expenseClaim) => (boolean); description: string; disabled: boolean } | { filter: (expenseClaim) => boolean; description: string } | { filter: (expenseClaim) => any; description: string } | { filter: () => boolean; description: string }; expenseItemIndex: number; saveInProgress: boolean; expenseClaimIndex: number; showOnlyMine: boolean };
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private selectedExpenseClaimIndex: 0;
  private selectedExpenseItemIndex: 0;
  private resubmit: boolean;
  private uploadedFile: string;
  private confirmAction: { approve?: boolean; delete?: boolean };
  private expenseId: string;
  private subscription: Subscription;

  constructor(@Inject(DOCUMENT) private document: Document,
              @Inject("MailchimpListService") private mailchimpListService,
              @Inject("MailchimpSegmentService") private mailchimpSegmentService,
              @Inject("MailchimpCampaignService") private mailchimpCampaignService,
              private contentMetadata: ContentMetadataService,
              private memberBulkUploadService: MemberBulkLoadService,
              private memberService: MemberService,
              private searchFilterPipe: SearchFilterPipe,
              private mailchimpConfig: MailchimpConfigService,
              private expenseClaimService: ExpenseClaimService,
              private fullNameWithAliasPipe: FullNameWithAliasPipe,
              private notifierService: NotifierService,
              private modalService: BsModalService,
              private dateUtils: DateUtilsService,
              private mailchimpListUpdaterService: MailchimpListUpdaterService,
              private urlService: UrlService,
              private emailSubscriptionService: EmailSubscriptionService,
              private numberUtils: NumberUtilsService,
              private stringUtils: StringUtilsService,
              private authService: AuthService,
              private broadcastService: BroadcastService,
              private memberLoginService: MemberLoginService,
              private route: ActivatedRoute,
              loggerFactory: LoggerFactory) {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logger = loggerFactory.createLogger(ExpensesComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.receiptBaseUrl = this.contentMetadata.baseUrl("expenseClaims");
    this.subscription = this.authService.authResponse().subscribe((loginResponse) => {
    });
    this.dataError = false;
    this.members = [];
    this.expenseClaims = [];
    this.unfilteredExpenseClaims = [];
    this.alertMessages = [];

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.expenseId = paramMap.get("expense-id");
      this.logger.info("expense-id:", this.expenseId);
      this.filterTypes = [{
        disabled: !this.expenseId,
        description: SELECTED_EXPENSE,
        filter: expenseClaim => {
          if (this.expenseId) {
            return expenseClaim && expenseClaim.id === this.expenseId;
          } else {
            return false;
          }
        }
      }, {
        description: "Unpaid expenses",
        filter: expenseClaim => !this.expenseClaimStatus(expenseClaim).atEndpoint
      }, {
        description: "Paid expenses",
        filter: expenseClaim => this.expenseClaimStatus(expenseClaim).atEndpoint
      }, {
        description: "Expenses awaiting action from me",
        filter: expenseClaim => this.memberLoginService.allowFinanceAdmin() ? this.editable(expenseClaim) : this.editableAndOwned(expenseClaim)
      }, {
        description: "All expenses",
        filter: () => true
      }];
      this.selected = {
        showOnlyMine: !this.allowAdminFunctions(),
        saveInProgress: false,
        expenseClaimIndex: 0,
        expenseItemIndex: 0,
        expenseFilter: this.filterTypes[this.expenseId ? 0 : 1]
      };
    });

    this.notificationsBaseUrl = "partials/expenses/notifications";

    this.memberLoginService.showLoginPromptWithRouteParameter("expenseId");
    this.refreshMembers()
      .then(() => this.refreshExpenses())
      .then(() => this.notify.setReady())
      .catch((error) => this.notify.error(error));

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  defaultExpenseClaim(): ExpenseClaim {
    return clone({
      cost: 0,
      expenseItems: [],
      expenseEvents: []
    });
  }

  defaultExpenseItem(): ExpenseItem {
    return clone({
      expenseType: this.expenseTypes[0],
      expenseDate: this.dateUtils.asValueNoTime(),
      cost: 0,
      travel: {
        costPerMile: 0.28,
        miles: 0,
        from: "",
        to: "",
        returnJourney: true
      }
    });
  }

  showArea(area) {
    this.urlService.navigateTo("admin", area);
  }

  selectedExpenseClaim(): ExpenseClaim {
    try {
      return this.expenseClaims[this.selectedExpenseClaimIndex];
    } catch (e) {
      this.logger.error("selectedExpenseClaim", e);
    }
  }

  selectedExpenseClaimItem(): ExpenseItem {
    try {
      return this.selectedExpenseClaim().expenseItems[this.selectedExpenseItemIndex];
    } catch (e) {
      this.logger.error("selectedExpenseClaimItem:", e);
    }
  }

  editable(expenseClaim?: ExpenseClaim) {
    return this.memberCanEditClaim(expenseClaim) && this.expenseClaimStatus(expenseClaim).editable;
  }

  editableAndOwned(expenseClaim) {
    return this.memberOwnsClaim(expenseClaim) && this.expenseClaimStatus(expenseClaim).editable;
  }

  editable2() {
    return this.editable(this.selectedExpenseClaim());
  }

  allowClearError() {
    return this.urlService.hasRouteParameter("expenseId") && this.dataError;
  }

  allowAddExpenseClaim() {
    return !this.dataError && !find(this.unfilteredExpenseClaims, this.editableAndOwned);
  }

  allowFinanceAdmin() {
    return this.memberLoginService.allowFinanceAdmin();
  }

  allowEditExpenseItem() {
    return this.allowAddExpenseItem() && this.selectedExpenseClaim() && this.selectedExpenseClaim().id;
  }

  allowAddExpenseItem() {
    return this.editable();
  }

  allowDeleteExpenseItem() {
    return this.allowEditExpenseItem();
  }

  allowDeleteExpenseClaim() {
    return !this.allowDeleteExpenseItem() && this.allowAddExpenseItem();
  }

  allowSubmitExpenseClaim() {
    return this.allowEditExpenseItem() && !this.allowResubmitExpenseClaim();
  }

  allowAdminFunctions() {
    return this.memberLoginService.allowTreasuryAdmin() || this.memberLoginService.allowFinanceAdmin();
  }

  allowReturnExpenseClaim() {
    return this.allowAdminFunctions()
      && this.selectedExpenseClaim()
      && this.expenseClaimHasEventType(this.selectedExpenseClaim(), this.eventTypes.submitted)
      && !this.expenseClaimHasEventType(this.selectedExpenseClaim(), this.eventTypes.returned)
      && this.expenseClaimStatus(this.selectedExpenseClaim()).actionable;
  }

  allowResubmitExpenseClaim() {
    return this.editable() && this.expenseClaimHasEventType(this.selectedExpenseClaim(), this.eventTypes.returned);
  }

  allowPaidExpenseClaim() {
    return this.memberLoginService.allowTreasuryAdmin() && [this.eventTypes.submitted.description, this.eventTypes["second-approval"].description, this.eventTypes["first-approval"].description]
      .includes(this.expenseClaimLatestEvent().eventType.description);
  }

  activeEvents(optionalEvents?: ExpenseEvent[]) {
    const events = optionalEvents || this.selectedExpenseClaim().expenseEvents;
    const latestReturnedEvent = find(events.reverse(), event => isEqual(event.eventType, this.expenseClaimStatus().returned));
    return latestReturnedEvent ? events.slice(events.indexOf(latestReturnedEvent) + 1) : events;
  }

  expenseClaimHasEventType(expenseClaim, eventType) {
    if (!expenseClaim) {
      return false;
    }
    return this.eventForEventType(expenseClaim, eventType);
  }

  eventForEventType(expenseClaim: ExpenseClaim, eventType) {
    if (expenseClaim) {
      return find(expenseClaim.expenseEvents, event => isEqual(event.eventType, eventType));
    }
  }

  allowApproveExpenseClaim() {
    return false;
  }

  lastApprovedByMe() {
    const approvalEvents = this.approvalEvents();
    return approvalEvents.length > 0 && last(approvalEvents).memberId === this.memberLoginService.loggedInMember().memberId;
  }

  approvalEvents() {
    if (!this.selectedExpenseClaim()) {
      return [];
    }
    return filter(this.selectedExpenseClaim().expenseEvents, event => isEqual(event.eventType, this.eventTypes["first-approval"]) || isEqual(event.eventType, this.eventTypes["second-approval"]));
  }

  expenseClaimStatus(optionalExpenseClaim?: ExpenseClaim): ExpenseEventType {
    const expenseClaim = optionalExpenseClaim || this.selectedExpenseClaim();
    return this.expenseClaimLatestEvent(expenseClaim).eventType;
  }

  expenseClaimLatestEvent(optionalExpenseClaim?: ExpenseClaim): ExpenseEvent {
    const expenseClaim = optionalExpenseClaim || this.selectedExpenseClaim();
    return expenseClaim ? last(expenseClaim.expenseEvents) : {};
  }

  nextApprovalStage() {
    const approvals = this.approvalEvents();
    if (approvals.length === 0) {
      return "First Approval";
    } else if (approvals.length === 1) {
      return "Second Approval";
    } else {
      return "Already has " + approvals.length + " approvals!";
    }
  }

  confirmApproveExpenseClaim() {
    const approvals = this.approvalEvents();
    this.notify.hide();
    if (approvals.length === 0) {
      this.createEventAndSendNotifications(this.eventTypes["first-approval"]);
    } else if (approvals.length === 1) {
      this.createEventAndSendNotifications(this.eventTypes["second-approval"]);
    } else {
      this.notify.error("This expense claim already has " + approvals.length + " approvals!");
    }
  }

  showAllExpenseClaims() {
    this.dataError = false;
    this.urlService.navigateTo("/admin/expenses");
  }

  addExpenseClaim() {
    this.expenseClaims.unshift(this.defaultExpenseClaim());
    this.selectExpenseClaim(0);
    this.createEvent(this.eventTypes.created);
    this.addExpenseItem();
  }

  selectExpenseItem(index) {
    if (this.selected.saveInProgress) {
    } else {
      this.selectedExpenseClaimIndex = index;
    }
  }

  selectExpenseClaim(index) {
    if (this.selected.saveInProgress) {
    } else {
      this.selectedExpenseClaimIndex = index;
      const expenseClaim = this.selectedExpenseClaim();
    }
  }

  editExpenseItem() {
    this.removeConfirm();
    delete this.uploadedFile;
    this.modalService.show(ExpenseDetailModalComponent);
  }

  hideExpenseClaim() {
    this.removeConfirm();
    // $("#expense-detail-dialog").modal("hide");
  }

  addReceipt() {
    // $("#hidden-input").click();
  }

  removeReceipt() {
    delete this.selectedExpenseClaim().receipt;
    delete this.uploadedFile;
  }

  receiptTitle(expenseItem) {
    return expenseItem && expenseItem.receipt ? (expenseItem.receipt.title || expenseItem.receipt.originalFileName) : "";
  }

  receiptUrl(expenseItem) {
    return expenseItem && expenseItem.receipt ? this.urlService.baseUrl() + this.receiptBaseUrl + "/" + expenseItem.receipt.awsFileName : "";
  }

  ekwgFileUpload() {
    return {onFileSelect: (...anything) => Promise.resolve(this.defaultExpenseClaim())};
  }

  onFileSelect(file, receipt) {
    if (file) {
      this.uploadedFile = file;
      this.ekwgFileUpload().onFileSelect(file, this.notify, "expenseClaims")
        .then(fileNameData => {
          const expenseItem = this.selectedExpenseClaim();
          const oldTitle = (expenseItem.receipt && expenseItem.receipt.title) ? receipt.title : undefined;
          expenseItem.receipt = {fileNameData, title: oldTitle};
        });
    }
  }

  createEvent(eventType, reason?: string) {
    const expenseClaim = this.selectedExpenseClaim();
    if (!expenseClaim.expenseEvents) {
      expenseClaim.expenseEvents = [];
    }
    const event: ExpenseEvent = {
      date: this.dateUtils.nowAsValue(),
      memberId: this.memberLoginService.loggedInMember().memberId,
      eventType
    };
    if (reason) {
      event.reason = reason;
    }
    expenseClaim.expenseEvents.push(event);
  }

  addExpenseItem() {
    this.removeConfirm();
    const newExpenseItem = this.defaultExpenseItem();
    this.selectedExpenseClaim().expenseItems.push(newExpenseItem);
    const index = this.selectedExpenseClaim().expenseItems.indexOf(newExpenseItem);
    if (index > -1) {
      this.selectExpenseItem(index);
      this.editExpenseItem();
    } else {
      this.showExpenseErrorAlert("Could not display new expense item");
    }
  }

  expenseTypeChange() {
    const item = this.selectedExpenseClaimItem();
    this.logger.debug("this.selectedExpenseClaim().expenseType", item.expenseType);
    if (item.expenseType.travel) {
      if (!item.travel) {
        item.travel = this.defaultExpenseItem().travel;
      }
    } else {
      delete item.travel;
    }
    this.setExpenseItemFields();
  }

  recalculateClaimCost() {
    this.selectedExpenseClaim().cost = this.numberUtils.sumValues(this.selectedExpenseClaim().expenseItems, "cost");
  }

  cancelExpenseChange() {
    this.refreshExpenses().then(() => this.hideExpenseClaim()).then(() => this.notify.clearBusy());
  }

  showExpenseErrorAlert(message) {
    const messageDefaulted = message || "Please try this again.";
    this.notify.error("Your expense claim could not be saved. " + messageDefaulted);
    this.selected.saveInProgress = false;
  }

  showExpenseEmailErrorAlert(message) {
    this.selected.saveInProgress = false;
    this.notify.error("Your expense claim email processing failed. " + message);
  }

  showExpenseProgressAlert(message, busy?) {
    this.notify.progress(message, busy);
  }

  showExpenseSuccessAlert(message?: string, busy?: boolean) {
    this.notify.success(message, busy);
  }

  showExpenseSaved(data) {
    this.expenseClaims[this.selectedExpenseClaimIndex] = data;
    this.selected.saveInProgress = false;
    return this.notify.success("Expense was saved successfully");
  }

  saveExpenseClaim(optionalExpenseClaim?: ExpenseClaim) {
    this.selected.saveInProgress = true;
    this.showExpenseProgressAlert("Saving expense claim", true);
    this.setExpenseItemFields();
    return (this.expenseClaimService.createOrUpdate(optionalExpenseClaim || this.selectedExpenseClaim()))
      .then(() => this.hideExpenseClaim())
      .then(() => this.notify.clearBusy());
  }

  approveExpenseClaim() {
    this.confirmAction = {approve: true};
    if (this.lastApprovedByMe()) {
      this.notify.warning({
        title: "Duplicate approval warning",
        message: "You were the previous approver, therefore " + this.nextApprovalStage() + " ought to be carried out by someone else. Are you sure you want to do this?"
      });
    }
  }

  deleteExpenseClaim() {
    this.confirmAction = {delete: true};
  }

  deleteExpenseItem() {
    this.confirmAction = {delete: true};
  }

  confirmDeleteExpenseItem() {
    this.selected.saveInProgress = true;
    this.showExpenseProgressAlert("Deleting expense item", true);
    const expenseItem = this.selectedExpenseClaimItem();
    this.logger.debug("removing", expenseItem);
    const index = this.selectedExpenseClaim().expenseItems.indexOf(expenseItem);
    if (index > -1) {
      this.selectedExpenseClaim().expenseItems.splice(index, 1);
    } else {
      this.showExpenseErrorAlert("Could not delete expense item");
    }
    this.selectExpenseItem(0);
    this.recalculateClaimCost();
    this.saveExpenseClaim()
      .then(() => this.removeConfirm())
      .then(() => this.notify.clearBusy());
  }

  removeConfirm() {
    delete this.confirmAction;
    this.showExpenseSuccessAlert();
  }

  showExpenseDeleted() {
    return this.showExpenseSuccessAlert("Expense was deleted successfully");
  }

  confirmDeleteExpenseClaim() {
    this.showExpenseProgressAlert("Deleting expense claim", true);

    this.expenseClaimService.delete(this.selectedExpenseClaim())
      .then(() => this.hideExpenseClaim())
      .then(() => this.showExpenseDeleted())
      .then(() => this.refreshExpenses())
      .then(() => this.removeConfirm())
      .then(() => this.notify.clearBusy());
  }

  submitExpenseClaim(state) {
    this.resubmit = state;
    // $("#submit-dialog").modal("show");
  }

  hideSubmitDialog() {
    // $("#submit-dialog").modal("hide");
    this.resubmit = false;
  }

  cancelSubmitExpenseClaim() {
    this.hideSubmitDialog();
  }

  returnExpenseClaim() {
    // $("#return-dialog").modal("show");
  }

  confirmReturnExpenseClaim(reason) {
    this.hideReturnDialog();
    return this.createEventAndSendNotifications(this.eventTypes.returned, reason);
  }

  hideReturnDialog() {
    // $("#return-dialog").modal("hide");
  }

  cancelReturnExpenseClaim() {
    this.hideReturnDialog();
  }

  paidExpenseClaim() {
    // $("#paid-dialog").modal("show");
  }

  confirmPaidExpenseClaim() {
    this.createEventAndSendNotifications(this.eventTypes.paid)
      .then(() => this.hidePaidDialog());
  }

  hidePaidDialog() {
    // $("#paid-dialog").modal("hide");
  }

  cancelPaidExpenseClaim() {
    this.hidePaidDialog();
  }

  confirmSubmitExpenseClaim() {
    if (this.resubmit) {
      this.selectedExpenseClaim().expenseEvents = [this.eventForEventType(this.selectedExpenseClaim(), this.eventTypes.created)];
    }
    this.createEventAndSendNotifications(this.eventTypes.submitted);
  }

  resubmitExpenseClaim() {
    this.submitExpenseClaim(true);
  }

  expenseClaimCreatedEvent(optionalExpenseClaim?: ExpenseClaim): ExpenseEvent {
    return this.eventForEventType(optionalExpenseClaim || this.selectedExpenseClaim(), this.eventTypes.created);
  }

  createEventAndSendNotifications(eventType, reason?: string) {
    this.notify.setBusy();
    this.selected.saveInProgress = true;
    const expenseClaim = this.selectedExpenseClaim();
    const expenseClaimCreatedEvent = this.expenseClaimCreatedEvent(expenseClaim);
    const sendNotificationsToAllRoles = () => {
      return this.memberService.getById(expenseClaimCreatedEvent.memberId)
        .then(member => {
          this.logger.debug("sendNotification:", "memberId", expenseClaimCreatedEvent.memberId, "member", member);
          const memberFullName = this.fullNameWithAliasPipe.transform(member);
          return Promise.resolve(this.showExpenseProgressAlert("Preparing to email " + memberFullName))
            .then(() => this.hideSubmitDialog())
            .then(() => sendCreatorNotifications())
            .then(() => sendApproverNotifications())
            .then(() => sendTreasurerNotifications());

          const sendCreatorNotifications = () => {
            if (eventType.notifyCreator) {
              return sendNotificationsTo({
                templateUrl: templateForEvent("creator", eventType),
                memberIds: [expenseClaimCreatedEvent.memberId],
                segmentType: "directMail",
                segmentNameSuffix: "",
                destination: "creator"
              });
            }
            return false;
          };

          const sendApproverNotifications = () => {
            if (eventType.notifyApprover) {
              return sendNotificationsTo({
                templateUrl: templateForEvent("approver", eventType),
                memberIds: this.memberService.allMemberIdsWithPrivilege("financeAdmin", this.members),
                segmentType: "expenseApprover",
                segmentNameSuffix: "approval ",
                destination: "approvers"
              });
            }
            return Promise.resolve(false);
          };

          const sendTreasurerNotifications = () => {
            if (eventType.notifyTreasurer) {
              return sendNotificationsTo({
                templateUrl: templateForEvent("treasurer", eventType),
                memberIds: this.memberService.allMemberIdsWithPrivilege("treasuryAdmin", this.members),
                segmentType: "expenseTreasurer",
                segmentNameSuffix: "payment ",
                destination: "treasurer"
              });
            }
            return false;
          };

          const templateForEvent = (role, eventType) => {
            return this.notificationsBaseUrl + "/" + role + "/" + eventType.description.toLowerCase().replace(" ", "-") + "-notification.html";
          };

          const sendNotificationsTo = (templateAndNotificationMembers) => {
            this.logger.debug("sendNotificationsTo:", templateAndNotificationMembers);
            const campaignName = "Expense " + eventType.description + " notification (to " + templateAndNotificationMembers.destination + ")";
            const campaignNameAndMember = campaignName + " (" + memberFullName + ")";
            const segmentName = "Expense notification " + templateAndNotificationMembers.segmentNameSuffix + "(" + memberFullName + ")";
            if (templateAndNotificationMembers.memberIds.length === 0) {
              throw new Error("No members have been configured as " + templateAndNotificationMembers.destination + " therefore notifications for this step will fail!!");
            }
            return Promise.resolve(templateAndNotificationMembers.templateUrl)
              .then((templateData) => renderTemplateContent(templateData))
              .then((expenseNotificationText) => populateContentSections(expenseNotificationText))
              .then((contentSections) => sendNotification(contentSections, templateAndNotificationMembers))
              .catch((error) => this.showExpenseEmailErrorAlert(error));

            const populateContentSections = (expenseNotificationText) => {
              return {
                sections: {
                  expense_id_url: `Please click <a href="${this.urlService.baseUrl()}/admin/expenseId/${expenseClaim.id}" target="_blank">this link</a> to see the details of the above expense claim, or to make changes to it.`,
                  expense_notification_text: expenseNotificationText
                }
              };
            };

            const sendNotification = (contentSections, templateAndNotificationMembers) => {
              const createOrSaveMailchimpSegment = () => {
                return this.mailchimpSegmentService.saveSegment("general", {segmentId: this.mailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType)}, templateAndNotificationMembers.memberIds, segmentName, this.members);
              };

              const saveSegmentDataToMember = (segmentResponse) => {
                this.mailchimpSegmentService.setMemberSegmentId(member, templateAndNotificationMembers.segmentType, segmentResponse.segment.id);
                return this.memberService.update(member);
              };

              const sendEmailCampaign = () => {
                this.showExpenseProgressAlert("Sending " + campaignNameAndMember);
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
                    this.showExpenseProgressAlert("Sending of " + campaignNameAndMember + " was successful", true);
                  });
              };

              return createOrSaveMailchimpSegment()
                .then((segmentResponse) => saveSegmentDataToMember(segmentResponse))
                .then(() => sendEmailCampaign())
                .then(() => notifyEmailSendComplete());

              const notifyEmailSendComplete = () => {
                this.showExpenseSuccessAlert("Sending of " + campaignName + " was successful. Check your inbox for progress.");
              };
            };
          };
        });
    };

    return Promise.resolve(this.createEvent(eventType, reason))
      .then(() => sendNotificationsToAllRoles())
      .then(() => this.saveExpenseClaim());

    const renderTemplateContent = (templateData) => {
      // const task = new Promise();
      // const templateFunction = $compile(templateData);
      // const templateElement = templateFunction($scope);
      // $timeout(() => {
      //   this.$digest();
      //   task.resolve();
      // });
      return Promise.resolve("templateElement.html()");
    };

  }

  setExpenseItemFields() {
    const expenseItem = this.selectedExpenseClaimItem();
    if (expenseItem) {
      expenseItem.expenseDate = this.dateUtils.asValueNoTime(expenseItem.expenseDate);
      if (expenseItem.travel) {
        expenseItem.travel.miles = this.numberUtils.asNumber(expenseItem.travel.miles);
      }
      expenseItem.description = this.expenseItemDescription(expenseItem);
      expenseItem.cost = this.expenseItemCost(expenseItem);
    }
    this.recalculateClaimCost();
  }

  prefixedExpenseItemDescription(expenseItem) {
    if (!expenseItem) {
      return "";
    }
    const prefix = expenseItem.expenseType && expenseItem.expenseType.travel ? expenseItem.expenseType.name + " - " : "";
    return prefix + expenseItem.description;
  }

  expenseItemDescription(expenseItem) {
    let description;
    if (!expenseItem) {
      return "";
    }
    if (expenseItem.travel && expenseItem.expenseType.travel) {
      description = [
        expenseItem.travel.from,
        "to",
        expenseItem.travel.to,
        expenseItem.travel.returnJourney ? "return trip" : "single trip",
        "(" + expenseItem.travel.miles,
        "miles",
        expenseItem.travel.returnJourney ? "x 2" : "",
        "x",
        expenseItem.travel.costPerMile * 100 + "p per mile)"
      ].join(" ");
    } else {
      description = expenseItem.description;
    }
    return description;
  }

  expenseItemCost(expenseItem) {
    let cost;
    if (!expenseItem) {
      return 0;
    }
    if (expenseItem.travel && expenseItem.expenseType.travel) {
      cost = (this.numberUtils.asNumber(expenseItem.travel.miles) *
        (expenseItem.travel.returnJourney ? 2 : 1) *
        this.numberUtils.asNumber(expenseItem.travel.costPerMile));
    } else {
      cost = expenseItem.cost;
    }
    return this.numberUtils.asNumber(cost, 2);
  }

  refreshMembers() {
    if (this.memberLoginService.memberLoggedIn()) {
      this.notify.progress("Refreshing member data...");
      return this.memberService.allLimitedFields(this.memberService.filterFor.GROUP_MEMBERS).then(members => {
        this.logger.debug("refreshMembers: found", members.length, "members");
        return this.members = members;
      });
    }
  }

  memberCanEditClaim(expenseClaim?: ExpenseClaim) {
    if (!expenseClaim) {
      return false;
    }
    return this.memberOwnsClaim(expenseClaim) || this.memberLoginService.allowFinanceAdmin();
  }

  memberOwnsClaim(expenseClaim?: ExpenseClaim) {
    if (!expenseClaim) {
      return false;
    }
    return (this.memberLoginService.loggedInMember().memberId === this.expenseClaimCreatedEvent(expenseClaim).memberId);
  }

  refreshExpenses() {
    this.dataError = false;
    this.notify.setBusy();
    this.logger.debug("refreshExpenses started");
    this.notify.progress("Filtering for " + this.selected.expenseFilter.description + "...");
    this.logger.debug("refreshing expenseFilter", this.selected.expenseFilter);

    const noExpenseFound = () => {
      this.dataError = true;
      return this.notify.warning({
        title: "Expense claim could not be found",
        message: "Try opening again from the link in the notification email, or click Show All Expense Claims"
      });
    };

    const query = () => {
      this.logger.info("expenseFilter.description", this.selected.expenseFilter.description, "expenseId", this.expenseId);
      if (this.selected.expenseFilter.description === SELECTED_EXPENSE && this.expenseId) {
        return this.expenseClaimService.getById(this.expenseId)
          .then(expense => {
            if (!expense) {
              return noExpenseFound();
            } else {
              return [expense];
            }
          })
          .catch(noExpenseFound);
      } else {
        return this.expenseClaimService.all();
      }
    };

    return query()
      .then(expenseClaims => {
        this.unfilteredExpenseClaims = [];
        this.expenseClaims = chain(expenseClaims).filter(expenseClaim => this.allowAdminFunctions() ? (this.selected.showOnlyMine ? this.memberOwnsClaim(expenseClaim) : true) : this.memberCanEditClaim(expenseClaim)).filter(expenseClaim => {
          this.unfilteredExpenseClaims.push(expenseClaim);
          return this.selected.expenseFilter.filter(expenseClaim);
        }).sortBy(expenseClaim => {
          const expenseClaimLatestEvent = this.expenseClaimLatestEvent(expenseClaim);
          return expenseClaimLatestEvent ? expenseClaimLatestEvent.date : true;
        }).value().reverse().value();
        const outcome = "Found " + this.expenseClaims.length + " expense claim(s)";
        this.notify.progress(outcome);
        this.logger.debug("refreshExpenses finished", outcome);
        this.notify.clearBusy();
        return this.expenseClaims;
      }, (error) => this.notify.error(error))
      .catch((error) => this.notify.error(error));
  }

}
