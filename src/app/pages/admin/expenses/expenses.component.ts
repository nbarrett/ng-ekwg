import { Component, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { cloneDeep, first } from "lodash-es";
import clone from "lodash-es/clone";
import filter from "lodash-es/filter";
import find from "lodash-es/find";
import isArray from "lodash-es/isArray";
import isEqual from "lodash-es/isEqual";
import last from "lodash-es/last";
import { BsModalService, ModalOptions } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { chain } from "../../../functions/chain";
import { AlertTarget } from "../../../models/alert-target.model";
import { ApiResponse } from "../../../models/api-response.model";
import { ExpenseClaim, ExpenseEvent, ExpenseFilter, ExpenseItem } from "../../../models/expense.model";
import { Member } from "../../../models/member.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { ExpenseNotificationDirective } from "../../../notifications/expenses/expense-notification.directive";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { ExpenseClaimService } from "../../../services/expenses/expense-claim.service";
import { ExpenseNotificationService } from "../../../services/expenses/expense-notification.service";
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
import { ExpenseDisplayService } from "./expense-display.service";
import { ExpenseDetailModalComponent } from "./modals/expense-detail-modal.component";

const SELECTED_EXPENSE = "Expense from last email link";

@Component({
  selector: "app-expenses",
  templateUrl: "./expenses.component.html",
  styleUrls: ["./expenses.component.sass"]
})
export class ExpensesComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private expenseId: string;
  private dataError: boolean;
  private members: Member[];
  private expenseClaims: ExpenseClaim[];
  private unfilteredExpenseClaims: ExpenseClaim[];

  private selected: {
    expenseClaim: ExpenseClaim,
    expenseItem: ExpenseItem,
    filter: ExpenseFilter,
    showOnlyMine: boolean,
    saveInProgress: boolean
  };
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private resubmit: boolean;
  private uploadedFile: string;
  public confirm = new Confirm();
  private authSubscription: Subscription;
  private expenseClaimSubscription: Subscription;
  public filters: ExpenseFilter[];
  @ViewChild(ExpenseNotificationDirective, {static: false}) notificationDirective: ExpenseNotificationDirective;

  constructor(@Inject("MailchimpListService") private mailchimpListService,
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
              public notifications: ExpenseNotificationService,
              public display: ExpenseDisplayService,
              loggerFactory: LoggerFactory) {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logger = loggerFactory.createLogger(ExpensesComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.notify.setBusy();
    this.authSubscription = this.authService.authResponse().subscribe((loginResponse) => {
      this.urlService.navigateTo("admin");
    });
    this.expenseClaimSubscription = this.expenseClaimService.notifications().subscribe(apiResponse => {
      if (apiResponse.error) {
        this.notifyError(apiResponse);
      } else {
        this.applyExpensesToView(apiResponse);
      }
    });
    this.dataError = false;
    this.members = [];
    this.expenseClaims = [];
    this.unfilteredExpenseClaims = [];
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.expenseId = paramMap.get("expense-id");
      this.filters = [{
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
        filter: expenseClaim => !this.display.expenseClaimStatus(expenseClaim).atEndpoint
      }, {
        description: "Paid expenses",
        filter: expenseClaim => this.display.expenseClaimStatus(expenseClaim).atEndpoint
      }, {
        description: "Expenses awaiting action from me",
        filter: expenseClaim => this.memberLoginService.allowFinanceAdmin() ? this.display.editable(expenseClaim) : this.display.editableAndOwned(expenseClaim)
      }, {
        description: "All expenses",
        filter: () => true
      }];

      this.selected = {
        expenseClaim: undefined,
        expenseItem: undefined,
        showOnlyMine: !this.display.allowAdminFunctions(),
        saveInProgress: false,
        filter: this.filters[!!this.expenseId ? 0 : 1]
      };
      this.logger.info("ngOnInit - expense-id:", this.expenseId, "this.filters:", this.filters, "this.selected:", this.selected);
      this.refreshMembers()
        .then(() => this.refreshExpenses())
        .then(() => this.notify.setReady())
        .catch((error) => {
          this.notifyError(error);
        });
    });

    this.memberLoginService.showLoginPromptWithRouteParameter("expenseId");

  }

  private applyExpensesToView(apiResponse: ApiResponse) {
    const expenseClaims: ExpenseClaim[] = isArray(apiResponse.response) ? apiResponse.response : [apiResponse.response];
    this.logger.info("Received", expenseClaims.length, "expense", apiResponse.action, "notification(s)");
    if (apiResponse.action === "query") {
      this.unfilteredExpenseClaims = expenseClaims;
    } else {
      this.logger.debug("unfilteredExpenseClaims size before", this.unfilteredExpenseClaims.length);
      expenseClaims.forEach(notifiedClaim => {
        this.logger.debug("adding/replacing item", notifiedClaim);
        this.unfilteredExpenseClaims = this.unfilteredExpenseClaims.filter(claim => claim.id !== notifiedClaim.id);
        this.unfilteredExpenseClaims.push(notifiedClaim);
      });
      this.logger.debug("unfilteredExpenseClaims size after", this.unfilteredExpenseClaims.length);
    }
    this.applyFilter();
  }

  applyFilter() {
    this.expenseClaims = chain(this.unfilteredExpenseClaims)
      .filter(expenseClaim => this.display.allowAdminFunctions() ? (this.selected.showOnlyMine ? this.display.memberOwnsClaim(expenseClaim) : true) : this.display.memberCanEditClaim(expenseClaim))
      .filter(expenseClaim => {
        return this.selected.filter.filter(expenseClaim);
      }).sortBy(expenseClaim => {
        const expenseClaimLatestEvent = this.display.expenseClaimLatestEvent(expenseClaim);
        return expenseClaimLatestEvent ? expenseClaimLatestEvent.date : true;
      }).value().reverse();
    const outcome = `found ${this.expenseClaims.length} expense claim(s)`;
    this.notify.progress({title: this.selected.filter.description, message: outcome});
    this.logger.debug("query finished", outcome);
    this.notify.clearBusy();
  }

  private notifyError(error) {
    this.logger.error(typeof error);
    if (error.error && error.error.includes("CastError")) {
      this.noExpenseFound();
    } else {
      this.notify.error({title: "Expenses error", message: error});
    }
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.expenseClaimSubscription.unsubscribe();
  }

  defaultExpenseClaim(): ExpenseClaim {
    return clone({
      cost: 0,
      expenseItems: [],
      expenseEvents: []
    });
  }

  showArea(area) {
    this.urlService.navigateTo("admin", area);
  }

  activeEvents(optionalEvents?: ExpenseEvent[]) {
    const events = optionalEvents || this.selected.expenseClaim.expenseEvents;
    const latestReturnedEvent = find(events.reverse(), event => isEqual(event.eventType, this.display.expenseClaimStatus(this.selected.expenseClaim).returned));
    return latestReturnedEvent ? events.slice(events.indexOf(latestReturnedEvent) + 1) : events;
  }

  allowApproveExpenseClaim() {
    return false;
  }

  lastApprovedByMe() {
    const approvalEvents = this.approvalEvents();
    return approvalEvents.length > 0 && last(approvalEvents).memberId === this.memberLoginService.loggedInMember().memberId;
  }

  approvalEvents() {
    if (!this.selected.expenseClaim) {
      return [];
    }
    return filter(this.selected.expenseClaim.expenseEvents, event => isEqual(event.eventType, this.display.eventTypes["first-approval"]) || isEqual(event.eventType, this.display.eventTypes["second-approval"]));
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
      this.notifications.createEventAndSendNotifications(this.notify, this.notificationDirective, this.selected.expenseClaim, this.members, this.display.eventTypes["first-approval"]);
    } else if (approvals.length === 1) {
      this.notifications.createEventAndSendNotifications(this.notify, this.notificationDirective, this.selected.expenseClaim, this.members, this.display.eventTypes["second-approval"]);
    } else {
      this.notifyError("This expense claim already has " + approvals.length + " approvals!");
    }
  }

  showAllExpenseClaims() {
    this.dataError = false;
    this.urlService.navigateTo("/admin", "expenses");
  }

  addExpenseClaim() {
    this.selectExpenseClaim(this.defaultExpenseClaim());
    this.display.createEvent(this.selected.expenseClaim, this.display.eventTypes.created);
    this.addExpenseItem();
  }

  doNothing(value?: any) {
    // this.logger.debug("doing nothing ->", value.id);
  }

  selectFirstItem(expenseClaim: ExpenseClaim) {
    this.selectExpenseClaim(expenseClaim);
    if (!this.expenseItemSelected()) {
      this.selectExpenseItem(first(this.selected.expenseClaim.expenseItems));
    }
  }

  selectExpenseItem(expenseItem: ExpenseItem) {
    if (!this.notifyTarget.busy && this.confirm.noneOutstanding()) {
      this.logger.debug("selectExpenseItem:", expenseItem);
      this.selected.expenseItem = expenseItem;
    }
  }

  selectExpenseClaim(expenseClaim: ExpenseClaim) {
    this.logger.debug("selectExpenseClaim:", expenseClaim);
    if (!this.notifyTarget.busy && this.confirm.noneOutstanding()) {
      this.selected.expenseClaim = expenseClaim;
    }
  }

  confirmOutstanding() {
    return this.confirm.type !== ConfirmType.NONE;
  }

  private removeConfirm() {
    this.confirm.type = ConfirmType.NONE;
  }

  editExpenseItem() {
    this.removeConfirm();
    delete this.uploadedFile;
    const expenseItemIndex = this.selected.expenseClaim.expenseItems.indexOf(this.selected.expenseItem);
    const config: ModalOptions = {
      class: "modal-lg",
      animated: false,
      show: true,
      initialState: {
        expenseItemIndex,
        editable: this.display.editable(this.selected.expenseClaim),
        expenseItem: cloneDeep(this.selected.expenseItem),
        expenseClaim: cloneDeep(this.selected.expenseClaim),
      }
    };
    this.modalService.show(ExpenseDetailModalComponent, config);
  }

  hideExpenseClaim() {
    this.removeConfirm();
    // $("#expense-detail-dialog").modal("hide");
  }

  ekwgFileUpload() {
    return {onFileSelect: (...anything) => Promise.resolve(this.defaultExpenseClaim())};
  }

  onFileSelect(file, receipt) {
    if (file) {
      this.uploadedFile = file;
      this.ekwgFileUpload().onFileSelect(file, this.notify, "expenseClaims")
        .then(fileNameData => {
          const expenseItem = this.selected.expenseClaim;
          // const oldTitle = (expenseItem.receipt && expenseItem.receipt.title) ? receipt.title : undefined;
          // expenseItem.receipt = {fileNameData, title: oldTitle};
        });
    }
  }

  addExpenseItem() {
    this.removeConfirm();
    const newExpenseItem = this.display.defaultExpenseItem();
    this.selectExpenseItem(newExpenseItem);
    this.editExpenseItem();
  }

  allowClearError() {
    return this.expenseId && this.dataError;
  }

  allowReturnExpenseClaim() {
    return this.display.allowAdminFunctions()
      && this.selected.expenseClaim
      && this.display.expenseClaimHasEventType(this.selected.expenseClaim, this.display.eventTypes.submitted)
      && !this.display.expenseClaimHasEventType(this.selected.expenseClaim, this.display.eventTypes.returned)
      && this.display.expenseClaimStatus(this.selected.expenseClaim).actionable;
  }

  showExpenseSuccessAlert(message?: string, busy?: boolean) {
    this.notify.success(message, busy);
  }

  approveExpenseClaim() {
    this.confirm.type = ConfirmType.APPROVE;
    if (this.lastApprovedByMe()) {
      this.notify.warning({
        title: "Duplicate approval warning",
        message: `You were the previous approver, therefore ${this.nextApprovalStage()} ought to be carried out by someone else. Are you sure you want to do this?`
      });
    }
  }

  allowResubmitExpenseClaim() {
    return this.display.editable(this.selected.expenseClaim) && this.display.expenseClaimHasEventType(this.selected.expenseClaim, this.display.eventTypes.returned);
  }

  allowPaidExpenseClaim() {
    return this.memberLoginService.allowTreasuryAdmin() && [this.display.eventTypes.submitted.description, this.display.eventTypes["second-approval"].description, this.display.eventTypes["first-approval"].description]
      .includes(this.display.expenseClaimLatestEvent(this.selected.expenseClaim).eventType.description);
  }

  deleteExpenseClaim() {
    this.confirm.type = ConfirmType.DELETE;
  }

  eventTracker(index: number, event: ExpenseEvent) {
    return event.date && event.eventType;
  }

  itemTracker(index: number, item: ExpenseItem) {
    return item.expenseDate && item.expenseType;
  }

  claimTracker(index: number, item: ExpenseClaim) {
    return item.id;
  }

  showExpenseDeleted() {
    return this.display.showExpenseSuccessAlert(this.notify, "Expense was deleted successfully");
  }

  confirmDeleteExpenseClaim() {
    this.display.showExpenseProgressAlert(this.notify, "Deleting expense claim", true);

    this.expenseClaimService.delete(this.selected.expenseClaim)
      .then(() => this.removeConfirm())
      .then(() => this.showExpenseDeleted())
      .then(() => this.notify.clearBusy());
  }

  submitExpenseClaim(state: boolean) {
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

  allowSubmitExpenseClaim(expenseClaim: ExpenseClaim) {
    return this.display.allowEditExpenseItem(expenseClaim) && !this.allowResubmitExpenseClaim();
  }

  confirmReturnExpenseClaim(reason) {
    this.hideReturnDialog();
    return this.notifications.createEventAndSendNotifications(this.notify, this.notificationDirective, this.selected.expenseClaim, this.members, this.display.eventTypes.returned, reason);
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
    this.notifications.createEventAndSendNotifications(this.notify, this.notificationDirective, this.selected.expenseClaim, this.members, this.display.eventTypes.paid)
      .then(() => this.hidePaidDialog());
  }

  hidePaidDialog() {
    // $("#paid-dialog").modal("hide");
  }

  cancelPaidExpenseClaim() {
    this.hidePaidDialog();
  }

  resubmitExpenseClaim() {
    this.submitExpenseClaim(true);
  }

  refreshMembers() {
    if (this.memberLoginService.memberLoggedIn()) {
      this.notify.progress({title: "Expenses", message: "Refreshing member data..."});
      return this.memberService.allLimitedFields(this.memberService.filterFor.GROUP_MEMBERS).then(members => {
        this.logger.debug("refreshMembers: found", members.length, "members");
        return this.members = members;
      });
    }
  }

  changeFilter($event?: ExpenseFilter) {
    this.logger.info("changeFilter fired with", $event);
    this.selected.filter = $event;
    this.refreshExpenses();
  }

  query(): void {
    this.logger.info("expenseFilter.description", this.selected.filter.description, "expenseId", this.expenseId);
    try {
      if (this.selected.filter.description === SELECTED_EXPENSE && this.expenseId) {
        this.expenseClaimService.getById(this.expenseId);
      } else {
        this.expenseClaimService.all();
      }
    } catch (error) {
      this.notifyError(error);
    }
  }

  noExpenseFound() {
    this.dataError = true;
    this.notify.warning({
      title: "Expense claim could not be found",
      message: "Try opening again from the link in the notification email, or click Show All Expense Claims"
    });
  }

  refreshExpenses() {
    this.dataError = false;
    this.notify.setBusy();
    this.notify.progress({title: this.selected.filter.description, message: "searching..."});
    this.logger.debug("refreshing expenseFilter", this.selected.filter);
    this.query();
  }

  allowAddExpenseClaim() {
    return !this.dataError && !this.unfilteredExpenseClaims.find(claim => this.display.editableAndOwned(claim));
  }

  cancelDeleteExpenseClaim() {

  }

  isInactive(expenseClaim: ExpenseClaim) {
    return expenseClaim !== this.selected.expenseClaim;
  }

  isActive(expenseClaim: ExpenseClaim) {
    return expenseClaim === this.selected.expenseClaim;
  }

  expenseItemSelected(): boolean {
    return this.selected.expenseClaim.expenseItems.includes(this.selected.expenseItem);
  }
}