import { Component, OnInit, ViewChild } from "@angular/core";
import { bool } from "aws-sdk/clients/signer";
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
  selector: "app-expense-submit-modal",
  templateUrl: "./expense-submit-modal.component.html",
})
export class ExpenseSubmitModalComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public expenseItem: ExpenseItem;
  public editable: boolean;
  public saveInProgress: boolean;
  private logger: Logger;
  public expenseClaim: ExpenseClaim;
  public editMode: EditMode;
  public confirm = new Confirm();

  @ViewChild(ExpenseNotificationDirective, {static: false}) notificationDirective: ExpenseNotificationDirective;
  private resubmit: boolean;

  constructor(public bsModalRef: BsModalRef,
              private notifierService: NotifierService,
              private expenseClaimService: ExpenseClaimService,
              private stringUtils: StringUtilsService,
              private modalService: BsModalService,
              public display: ExpenseDisplayService,
              protected dateUtils: DateUtilsService,
              private numberUtils: NumberUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ExpenseSubmitModalComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.debug("constructed:editMode", this.editMode, "expenseItem:", this.expenseItem, "expenseClaim:", this.expenseClaim);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
  }

  cancelExpenseChange() {
    this.bsModalRef.hide();
  }

  confirmSubmitExpenseClaim() {
    if (this.resubmit) {
      this.expenseClaim.expenseEvents = [this.display.eventForEventType(this.expenseClaim, this.display.eventTypes.created)];
    }
    this.createEventAndSendNotifications(this.display.eventTypes.submitted);
  }
}
