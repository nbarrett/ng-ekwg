import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { CommitteeFile, NotificationConfig, UserEdits } from "../../../models/committee.model";
import { Member } from "../../../models/member.model";
import { CommitteeDisplayService } from "../../../pages/committee/committee-display.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-committee-notification-details",
  templateUrl: "./committee-notification-details.component.html"
})
export class CommitteeNotificationDetailsComponent implements OnInit, OnChanges {

  @Input()
  public committeeFile: CommitteeFile;
  @Input()
  public notification: NotificationConfig;
  @Input()
  public userEdits: UserEdits;
  @Input()
  public members: Member[];
  protected logger: Logger;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    public display: CommitteeDisplayService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeNotificationDetailsComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit:data ->", this.notification);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.debug("changes were", changes);
    const textChange = changes?.text?.currentValue;
    if (textChange) {
      // this.content.text = textChange;
      // this.text = textChange;
      // this.logger.debug("text is now", this.text);
      this.changeDetectorRef.detectChanges();
    }
  }
}
