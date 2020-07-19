import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { CommitteeFile, NotificationConfig, UserEdits } from "../../../models/committee.model";
import { ExpenseClaim } from "../../../models/expense.model";
import { Member } from "../../../models/member.model";
import { CommitteeDisplayService } from "../../../pages/committee/committee-display.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-committee-notification-details",
  templateUrl: "./committee-notification-details.component.html"
})
export class CommitteeNotificationDetailsComponent implements OnInit, AfterViewInit {

  @Input()
  public committeeFile: CommitteeFile;
  public notification: NotificationConfig;
  public userEdits: UserEdits;
  protected logger: Logger;
  public members: Member[];

  constructor(
    public display: CommitteeDisplayService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeNotificationDetailsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit:data ->", this.notification);
  }

  ngAfterViewInit(): void {
    this.logger.debug("ngAfterViewInit:data ->", this.notification);
  }

}
