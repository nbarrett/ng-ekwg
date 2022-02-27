import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { ExpenseClaim } from "../../expense.model";
import { Member } from "../../../../models/member.model";
import { ExpenseDisplayService } from "../../../../services/expenses/expense-display.service";
import { Logger, LoggerFactory } from "../../../../services/logger-factory.service";

@Component({
  selector: "app-expense-notification-details",
  templateUrl: "./expense-notification-details.component.html"
})
export class ExpenseNotificationDetailsComponent implements OnInit, AfterViewInit {

  @Input()
  public expenseClaim: ExpenseClaim;
  protected logger: Logger;
  public members: Member[];

  constructor(
    public display: ExpenseDisplayService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ExpenseNotificationDetailsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit:data ->", this.expenseClaim);
    this.members = this.display.members;
  }

  ngAfterViewInit(): void {
    this.logger.debug("ngAfterViewInit:data ->", this.expenseClaim);
  }

}
