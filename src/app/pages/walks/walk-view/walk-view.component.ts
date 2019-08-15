import { Component, Inject, Input, OnInit } from "@angular/core";
import { Walk } from "../../../models/walk.model";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { WalkDisplayService } from "../walk-display.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { UrlService } from "../../../services/url.service";
import { BroadcastService } from "../../../services/broadcast-service";
import { SafeResourceUrl } from "@angular/platform-browser";

const SHOW_START_POINT = "show-start-point";
const SHOW_DRIVING_DIRECTIONS = "show-driving-directions";

@Component({
  selector: "app-walk-view",
  templateUrl: "./walk-view.component.html",
  styleUrls: ["./walk-view.component.sass"]
})

export class WalkViewComponent implements OnInit {
  @Input()
  walk: Walk;
  private logger: Logger;
  mapDisplay = SHOW_START_POINT;
  fromPostcode = "";
  public googleMapsUrl: SafeResourceUrl;

  constructor(
    @Inject("LoggedInMemberService") private loggedInMemberService,
    public display: WalkDisplayService,
    private dateUtils: DateUtilsService,
    private urlService: UrlService,
    private broadcastService: BroadcastService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkViewComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.logger.info("initialised with walk", this.walk);
    this.refreshHomePostcode();
    this.broadcastService.on("memberLoginComplete", () => {
      this.logger.info("memberLoginComplete");
      this.display.refreshMembers();
      this.refreshHomePostcode();
    });
    if (this.display.eventTypeFor(this.walk).showDetails) {
      this.googleMapsUrl = this.display.googleMapsUrl(this.walk, this.mapDisplay === SHOW_DRIVING_DIRECTIONS, this.fromPostcode);
    }
  }

  refreshHomePostcode() {
    this.fromPostcode = this.loggedInMemberService.memberLoggedIn() ? this.loggedInMemberService.loggedInMember().postcode : "";
    this.logger.debug("set from postcode to", this.fromPostcode);
    this.autoSelectMapDisplay();
  }

  autoSelectMapDisplay() {
    const switchToShowStartPoint = this.drivingDirectionsDisabled() && this.mapDisplay === SHOW_DRIVING_DIRECTIONS;
    const switchToShowDrivingDirections = !this.drivingDirectionsDisabled() && this.mapDisplay === SHOW_START_POINT;
    if (switchToShowStartPoint) {
      this.mapDisplay = SHOW_START_POINT;
    } else if (switchToShowDrivingDirections) {
      this.mapDisplay = SHOW_DRIVING_DIRECTIONS;
    }
  }

  showDrivingDirections(): boolean {
    return this.mapDisplay === SHOW_DRIVING_DIRECTIONS;
  }

  drivingDirectionsDisabled() {
    return this.fromPostcode.length < 3;
  }

  durationInFutureFor(walk: Walk) {
    return walk && walk.walkDate === this.dateUtils.momentNowNoTime().valueOf() ? "today"
      : (this.dateUtils.asMoment(walk.walkDate).fromNow());
  }

}
