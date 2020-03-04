import { Inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { clone, find, isEqual, last } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { ExpenseClaim, ExpenseEvent, ExpenseEventType, ExpenseItem, ExpenseType } from "../../../models/expense.model";
import { Member } from "../../../models/member.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { ExpenseClaimService } from "../../../services/expenses/expense-claim.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance } from "../../../services/notifier.service";
import { NumberUtilsService } from "../../../services/number-utils.service";
import { UrlService } from "../../../services/url.service";

@Injectable({
  providedIn: "root"
})

export class ExpenseDisplayService {
  public members: Member [] = [];
  loggedIn: boolean;
  private logger: Logger;

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
  private receiptBaseUrl: string;

  constructor(
    @Inject("ClipboardService") private clipboardService,
    @Inject("RamblersWalksAndEventsService") private ramblersWalksAndEventsService,
    private contentMetadata: ContentMetadataService,
    private memberService: MemberService,
    private memberLoginService: MemberLoginService,
    private expenseClaimService: ExpenseClaimService,
    private router: Router,
    private urlService: UrlService,
    private numberUtils: NumberUtilsService,
    private route: ActivatedRoute,
    private dateUtils: DateUtilsService,
    loggerFactory: LoggerFactory) {
    this.receiptBaseUrl = this.contentMetadata.baseUrl("expenseClaims");
    this.logger = loggerFactory.createLogger(ExpenseDisplayService, NgxLoggerLevel.OFF);
    this.refreshMembers();
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

  public defaultExpenseItem(): ExpenseItem {
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
    this.memberService.allLimitedFields(this.memberService.filterFor.GROUP_MEMBERS)
      .then((members) => {
        this.members = members;
      });
  }

  showExpenseEmailErrorAlert(notify: AlertInstance, message: string) {
    notify.error({title: "Expenses", message: "Your expense claim email processing failed. " + message});
  }

  showExpenseErrorAlert(notify: AlertInstance, message?: string) {
    const messageDefaulted = message || "Please try this again.";
    notify.error({title: "Expenses", message: "Your expense claim could not be saved. " + messageDefaulted});
  }

  confirmDeleteExpenseItem(confirm: Confirm, notify: AlertInstance, expenseClaim: ExpenseClaim, expenseItem: ExpenseItem) {
    this.logger.debug("removing", expenseItem);
    const index = expenseClaim.expenseItems.indexOf(expenseItem);
    if (index > -1) {
      expenseClaim.expenseItems.splice(index, 1);
    } else {
      this.showExpenseErrorAlert(notify, "Could not delete expense item");
    }
    this.recalculateClaimCost(expenseClaim);
    this.expenseClaimService.update(expenseClaim)
      .then(() => this.removeConfirm(confirm))
      .then(() => notify.clearBusy());
  }

  removeConfirm(confirm: Confirm) {
    confirm.type = ConfirmType.NONE;
  }

  recalculateClaimCost(expenseClaim: ExpenseClaim) {
    expenseClaim.cost = this.numberUtils.sumValues(expenseClaim.expenseItems, "cost");
  }

  receiptTitle(expenseItem: ExpenseItem) {
    return expenseItem && expenseItem.receipt ? (expenseItem.receipt.title || expenseItem.receipt.originalFileName) : "";
  }

  receiptUrl(expenseItem: ExpenseItem) {
    return expenseItem && expenseItem.receipt ? this.urlService.baseUrl() + this.receiptBaseUrl + "/" + expenseItem.receipt.awsFileName : "";
  }

  memberCanEditClaim(expenseClaim: ExpenseClaim) {
    if (!expenseClaim) {
      return false;
    }
    return this.memberOwnsClaim(expenseClaim) || this.memberLoginService.allowFinanceAdmin();
  }

  memberOwnsClaim(expenseClaim: ExpenseClaim) {
    if (!expenseClaim) {
      return false;
    }
    return (this.memberLoginService.loggedInMember().memberId === this.expenseClaimCreatedEvent(expenseClaim).memberId);
  }

  eventForEventType(expenseClaim: ExpenseClaim, expenseEventType: ExpenseEventType): ExpenseEvent {
    if (expenseClaim) {
      return find(expenseClaim.expenseEvents, event => event.eventType.description === expenseEventType.description ) || {};
    } else {
      return {};
    }
  }

  expenseClaimHasEventType(expenseClaim, eventType) {
    if (!expenseClaim) {
      return false;
    }
    return this.eventForEventType(expenseClaim, eventType);
  }

  expenseClaimCreatedEvent(expenseClaim: ExpenseClaim): ExpenseEvent {
    return this.eventForEventType(expenseClaim, this.eventTypes.created);
  }

  expenseClaimLatestEvent(expenseClaim: ExpenseClaim): ExpenseEvent {
    return expenseClaim ? last(expenseClaim.expenseEvents) : {};
  }

  expenseClaimStatus(expenseClaim: ExpenseClaim): ExpenseEventType {
    return this.expenseClaimLatestEvent(expenseClaim).eventType;
  }

  editable(expenseClaim: ExpenseClaim) {
    return this.memberCanEditClaim(expenseClaim) && this.expenseClaimStatus(expenseClaim).editable;
  }

  editableAndOwned(expenseClaim) {
    return this.memberOwnsClaim(expenseClaim) && this.expenseClaimStatus(expenseClaim).editable;
  }

  allowFinanceAdmin() {
    return this.memberLoginService.allowFinanceAdmin();
  }

  allowEditExpenseItem(expenseClaim: ExpenseClaim) {
    return this.allowAddExpenseItem(expenseClaim) && expenseClaim && expenseClaim.id;
  }

  allowAddExpenseItem(expenseClaim: ExpenseClaim) {
    return this.editable(expenseClaim);
  }

  allowDeleteExpenseItem(expenseClaim: ExpenseClaim) {
    return this.allowEditExpenseItem(expenseClaim);
  }

  allowDeleteExpenseClaim(expenseClaim: ExpenseClaim) {
    return !this.allowDeleteExpenseItem(expenseClaim) && this.allowAddExpenseItem(expenseClaim);
  }

  allowAdminFunctions() {
    return this.memberLoginService.allowTreasuryAdmin() || this.memberLoginService.allowFinanceAdmin();
  }

}
