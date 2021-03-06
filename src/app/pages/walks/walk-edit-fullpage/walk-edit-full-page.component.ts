import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { DisplayedWalk, EventType, Walk } from "../../../models/walk.model";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { WalksReferenceService } from "../../../services/walks/walks-reference-data.service";
import { WalksService } from "../../../services/walks/walks.service";
import { WalkDisplayService } from "../walk-display.service";

@Component({
  selector: "app-walk-edit-full-page",
  templateUrl: "./walk-edit-full-page.component.html"
})

export class WalkEditFullPageComponent implements OnInit {
  private logger: Logger;
  public displayedWalk: DisplayedWalk;
  public notifyTarget: AlertTarget = {};
  private notify: AlertInstance;

  constructor(private walksService: WalksService,
              private route: ActivatedRoute, private dateUtils: DateUtilsService,
              private display: WalkDisplayService,
              private notifierService: NotifierService,
              displayDate: DisplayDatePipe, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkEditFullPageComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("add")) {
        this.displayedWalk = {
          walkAccessMode: WalksReferenceService.walkAccessModes.add,
          walk: {
            walkType: this.display.walkTypes[0],
            walkDate: this.dateUtils.momentNowNoTime().valueOf(),
            events: []
          },
          status: EventType.AWAITING_LEADER
        };
      } else {
        const walkId = paramMap.get("walk-id");
        this.logger.debug("querying walk-id", walkId);
        this.walksService.getById(walkId)
          .then((walk: Walk) => {
            this.logger.debug("found walk", walk);
            this.displayedWalk = this.display.toDisplayedWalk(walk);
            if (this.displayedWalk.latestEventType) {
              this.setStatus(this.displayedWalk.latestEventType.eventType);
            }
          });
      }
    });
  }

  setStatus(status: EventType) {
    this.logger.debug("setting status =>", status);
    this.displayedWalk.status = status;
  }

  status(): EventType {
    return this.displayedWalk.status;
  }

}
