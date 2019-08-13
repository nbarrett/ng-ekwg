import { Component, Inject, OnInit } from "@angular/core";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { EventType, WalksReferenceService } from "../../../services/walks-reference-data.service";
import { NotifierService } from "../../../services/notifier.service";
import { WalkDisplayService } from "../walk-display.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";
import { Walk } from "../../../models/walk.model";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { WalkEditMode } from "../../../models/walk-edit-mode.model";

@Component({
  selector: "app-walk-edit-full-page",
  templateUrl: "./walk-edit-full-page.component.html"
})

export class WalkEditFullPageComponent implements OnInit {
  private logger: Logger;
  public walk: Walk;
  public notifyTarget: AlertTarget = {};
  private currentWalkEditMode: WalkEditMode;
  private currentStatus: EventType;

  constructor(@Inject("WalksService") private walksService,
              private route: ActivatedRoute, private dateUtils: DateUtilsService,
              private display: WalkDisplayService,
              private walksReferenceService: WalksReferenceService,
              displayDate: DisplayDatePipe, notifierService: NotifierService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkEditFullPageComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.logger.info("ngOnInit");
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("add")) {
        this.setWalkEditMode(this.walksReferenceService.walkEditModes.add);
        this.walk = new this.walksService({
          status: EventType.AWAITING_LEADER,
          walkType: this.display.walkTypes[0],
          walkDate: this.dateUtils.momentNowNoTime().valueOf()
        });
      } else {
        const walkId = paramMap.get("walk-id");
        this.logger.info("querying walk-id", walkId);
        this.walksService.getById(walkId)
          .then((walk: Walk) => {
            this.setWalkEditMode(this.walksReferenceService.walkEditModes.edit);
            this.logger.info("found walk", walk);
            this.walk = walk;
            const eventTypeIfExists: EventType = this.display.statusFor(this.walk);
            if (eventTypeIfExists) {
              this.setStatus(eventTypeIfExists);
            }

          });
      }
    });
  }

  setStatus(status: EventType) {
    this.logger.info("setting status =>", status);
    this.currentStatus = status;
  }

  setWalkEditMode(walkEditMode: WalkEditMode) {
    this.currentWalkEditMode = walkEditMode;
  }

  walkEditMode(): WalkEditMode {
    return this.currentWalkEditMode;
  }

  status(): EventType {
    return this.currentStatus;
  }

}
