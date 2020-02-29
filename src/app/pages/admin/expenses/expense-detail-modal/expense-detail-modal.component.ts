import { Component, Input, OnInit, ViewChild } from "@angular/core";
import cloneDeep from "lodash-es/cloneDeep";
import { BsModalRef } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../../models/alert-target.model";
import { ExpenseClaim } from "../../../../models/expense.model";
import { NotificationDirective } from "../../../../notifications/walks/notification.directive";
import { Logger, LoggerFactory } from "../../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../../services/notifier.service";

@Component({
  selector: "app-expense-detail-modal",
  templateUrl: "./expense-detail-modal.component.html",
  styleUrls: ["./expense-detail-modal.component.sass"]
})
export class ExpenseDetailModalComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  private expense: ExpenseClaim;

  @Input("expense")
  set cloneWalk(expense: ExpenseClaim) {
    this.logger.debug("cloning expense for edit");
    this.expense = cloneDeep(expense);
  }

  @ViewChild(NotificationDirective, {static: false}) notificationDirective: NotificationDirective;

  constructor(public bsModalRef: BsModalRef,
              private notifierService: NotifierService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ExpenseDetailModalComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.debug("constructed");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
  }
}
