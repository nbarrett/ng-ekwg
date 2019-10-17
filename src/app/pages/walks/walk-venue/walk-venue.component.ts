import { Component, Inject, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { DisplayedWalk } from "../../../models/walk-displayed.model";
import { VenueType } from "../../../models/walk-venue.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { WalksReferenceService } from "../../../services/walks/walks-reference-data.service";
import { WalkDisplayService } from "../walk-display.service";

@Component({
  selector: "app-walk-venue",
  templateUrl: "./walk-venue.component.html",
  styleUrls: ["./walk-venue.component.sass"]
})
export class WalkVenueComponent implements OnInit {

  @Input()
  public displayedWalk: DisplayedWalk;
  public venueTypes: VenueType[];
  private logger: Logger;

  constructor(@Inject("LoggedInMemberService") private loggedInMemberService,
              public display: WalkDisplayService,
              private walksReferenceService: WalksReferenceService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkVenueComponent, NgxLoggerLevel.OFF);
  }

  venueTracker(index: number, venueType: VenueType) {
    return venueType.type;
  }

  ngOnInit() {
    this.logger.debug("venue is", this.displayedWalk.walk.venue);
    this.venueTypes = this.walksReferenceService.venueTypes();
  }

  allowEdits() {
    return this.display.loggedInMemberIsLeadingWalk(this.displayedWalk.walk) || this.loggedInMemberService.allowWalkAdminEdits();
  }

}
