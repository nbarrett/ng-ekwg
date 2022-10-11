import { Component, Input, OnInit } from "@angular/core";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { SocialEvent } from "../../../models/social-events.model";
import { Actions } from "../../../models/ui-actions";
import { GoogleMapsService } from "../../../services/google-maps.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { SocialEventsService } from "../../../services/social-events/social-events.service";
import { UrlService } from "../../../services/url.service";
import { SocialDisplayService } from "../social-display.service";

@Component({
  selector: "app-social-view",
  templateUrl: "./social-view.html",
  styleUrls: ["social-view.sass"]
})
export class SocialViewComponent implements OnInit {
  @Input()
  public socialEvent: SocialEvent;
  @Input()
  public actions: Actions;
  public notifyTarget: AlertTarget = {};
  public notify: AlertInstance;
  private logger: Logger;
  faCopy = faCopy;

  constructor(
    public googleMapsService: GoogleMapsService,
    private notifierService: NotifierService,
    public display: SocialDisplayService,
    private urlService: UrlService,
    private socialEventsService: SocialEventsService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialViewComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.info("ngOnInit:socialEvent:", this.socialEvent);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    if (this.socialEvent) {
      this.logger.debug("socialEvent from input:", this.socialEvent);
    } else if (this.urlService.pathContainsMongoId()) {
      const socialEventId = this.urlService.lastPathSegment();
      this.logger.debug("finding socialEvent from socialEventId:", socialEventId);
      this.socialEventsService.getById(socialEventId).then(data => {
        this.socialEvent = data;
      });
    }
  }

  editSocialEvent(socialEvent) {
    this.display.confirm.clear();
    if (!socialEvent.attendees) {
      socialEvent.attendees = [];
    }
    const existingRecordEditEnabled = this.display.allow.edits;
    this.display.allow.copy = existingRecordEditEnabled;
    this.display.allow.delete = existingRecordEditEnabled;
    this.actions.activateEditMode();
  }
}
