import { Component, Input, OnInit, ViewChild } from "@angular/core";
import cloneDeep from "lodash-es/cloneDeep";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../../models/alert-target.model";
import { ExpenseClaim, ExpenseItem } from "../../../../models/expense.model";
import { Confirm } from "../../../../models/ui-actions";
import { WalkNotificationDirective } from "../../../../notifications/walks/walk-notification.directive";
import { DateUtilsService } from "../../../../services/date-utils.service";
import { ExpenseClaimService } from "../../../../services/expenses/expense-claim.service";
import { Logger, LoggerFactory } from "../../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../../services/notifier.service";
import { NumberUtilsService } from "../../../../services/number-utils.service";
import { StringUtilsService } from "../../../../services/string-utils.service";
import { ExpenseDisplayService } from "../expense-display.service";

@Component({
  selector: "app-expense-detail-modal",
  templateUrl: "./expense-detail-modal.component.html",
  styleUrls: ["./expense-detail-modal.component.sass"]
})
export class ExpenseDetailModalComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public expenseItem: ExpenseItem;
  public expenseClaim: ExpenseClaim;
  editable: boolean;
  public saveInProgress: boolean;
  private logger: Logger;
  private expense: ExpenseClaim;
  public confirm = new Confirm();

  // @Input("expense")
  // set cloneWalk(expense: ExpenseClaim) {
  //   this.logger.debug("cloning expense for edit");
  //   this.expense = cloneDeep(expense);
  // }

  @ViewChild(WalkNotificationDirective, {static: false}) notificationDirective: WalkNotificationDirective;
  uploadedFile: any;

  constructor(public bsModalRef: BsModalRef,
              private notifierService: NotifierService,
              private expenseClaimService: ExpenseClaimService,
              private stringUtils: StringUtilsService,
              private modalService: BsModalService,
              public display: ExpenseDisplayService,
              protected dateUtils: DateUtilsService,
              private numberUtils: NumberUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ExpenseDetailModalComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.debug("constructed:", this.expenseItem, this.expenseClaim);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
  }

  cancelExpenseChange() {
    this.bsModalRef.hide();
  }

  expenseTypeChange() {
    const item = this.expenseItem;
    this.logger.debug("this.expenseClaim.expenseType", item.expenseType);
    if (item.expenseType.travel) {
      if (!item.travel) {
        item.travel = this.display.defaultExpenseItem().travel;
      }
    } else {
      delete item.travel;
    }
    this.setExpenseItemFields();
  }

  showExpenseProgressAlert(message, busy?) {
    this.notify.progress({title: "Expenses", message}, busy);
  }

  saveExpenseClaim(expenseClaim: ExpenseClaim) {
    this.saveInProgress = true;
    this.showExpenseProgressAlert("Saving expense claim", true);
    this.setExpenseItemFields();
    return (this.expenseClaimService.createOrUpdate(expenseClaim))
      .then(() => this.bsModalRef.hide())
      .then(() => this.notify.clearBusy());
  }

  setExpenseItemFields() {
    if (this.expenseItem) {
      this.expenseItem.expenseDate = this.dateUtils.asValueNoTime(this.expenseItem.expenseDate);
      if (this.expenseItem.travel) {
        this.expenseItem.travel.miles = this.numberUtils.asNumber(this.expenseItem.travel.miles);
      }
      this.expenseItem.description = this.display.expenseItemDescription(this.expenseItem);
      this.expenseItem.cost = this.display.expenseItemCost(this.expenseItem);
    }
    this.display.recalculateClaimCost(this.expenseClaim);
  }

  onExpenseDateChange(date: Date) {
    this.expenseItem.expenseDate = this.dateUtils.asValueNoTime(date);
  }

  addReceipt() {
    // $("#hidden-input").click();
  }

  removeReceipt() {
    delete this.expenseItem.receipt;
  }

}
