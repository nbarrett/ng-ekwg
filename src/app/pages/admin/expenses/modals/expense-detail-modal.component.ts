import { Component, OnInit, ViewChild } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../../models/alert-target.model";
import { ExpenseClaim, ExpenseItem, ExpenseType } from "../../../../models/expense.model";
import { Confirm, EditMode } from "../../../../models/ui-actions";
import { ExpenseNotificationDirective } from "../../../../notifications/expenses/expense-notification.directive";
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
  public editable: boolean;
  public saveInProgress: boolean;
  private logger: Logger;
  public expenseClaim: ExpenseClaim;
  public editMode: EditMode;
  public confirm = new Confirm();
  uploadedFile: any;
  expenseDate: Date;
  public expenseItemIndex: number;

  @ViewChild(ExpenseNotificationDirective, {static: false}) notificationDirective: ExpenseNotificationDirective;

  expenseTypeTracker(expenseType: ExpenseType) {
    return expenseType.value;
  }

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
    this.editMode = this.expenseItemIndex === -1 ? EditMode.ADD_NEW : EditMode.EDIT;
    this.logger.debug("constructed:editMode", this.editMode, "expenseItem:", this.expenseItem, "expenseClaim:", this.expenseClaim);
    this.expenseDate = this.dateUtils.asDate(this.expenseItem.expenseDate);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
  }

  cancelExpenseChange() {
    this.bsModalRef.hide();
  }

  expenseTypeChange(expenseType: ExpenseType) {
    this.logger.debug("this.expenseClaim.expenseType", expenseType);
    if (expenseType.travel) {
      if (!this.expenseItem.travel) {
        this.expenseItem.travel = this.display.defaultExpenseItem().travel;
      }
    } else {
      this.expenseItem.travel = undefined;
    }
    this.setExpenseItemFields();
  }

  showExpenseProgressAlert(message, busy?) {
    this.notify.progress({title: "Expenses", message}, busy);
  }

  saveExpenseClaim() {
    this.logger.debug("this.editMode", this.editMode);
    this.showExpenseProgressAlert("Saving expense claim", true);
    this.setExpenseItemFields();
    this.display.saveExpenseItem(this.editMode, this.confirm, this.notify, this.expenseClaim, this.expenseItem, this.expenseItemIndex)
      .then(() => this.bsModalRef.hide())
      .then(() => this.notify.clearBusy())
      .catch(error => this.notify.error(error));
  }

  setExpenseItemFields() {
    if (this.expenseItem) {
      if (this.expenseItem.travel) {
        this.expenseItem.travel.miles = this.numberUtils.asNumber(this.expenseItem.travel.miles);
      }
      this.expenseItem.description = this.display.expenseItemDescription(this.expenseItem);
      this.expenseItem.cost = this.display.expenseItemCost(this.expenseItem);
    }
    // this.display.recalculateClaimCost(this.expenseClaim);
  }

  onExpenseDateChange(date: Date) {
    this.logger.debug("date", date);
    this.expenseItem.expenseDate = this.dateUtils.asValueNoTime(date);
  }

  addReceipt() {
    // $("#hidden-input").click();
  }

  removeReceipt() {
    delete this.expenseItem.receipt;
  }

  onFileSelect($file: any) {

  }
}
