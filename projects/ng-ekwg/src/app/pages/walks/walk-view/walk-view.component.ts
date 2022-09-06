import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { faCopy, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { LoginResponse } from "../../../models/member.model";
import { DisplayedWalk, Walk } from "../../../models/walk.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { GoogleMapsService } from "../../../services/google-maps.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MeetupService } from "../../../services/meetup.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { WalksService } from "../../../services/walks/walks.service";
import { LoginModalComponent } from "../../login/login-modal/login-modal.component";
import { WalkDisplayService } from "../walk-display.service";

const SHOW_START_POINT = "show-start-point";
const SHOW_DRIVING_DIRECTIONS = "show-driving-directions";

@Component({
  selector: "app-walk-view",
  templateUrl: "./walk-view.component.html",
  styleUrls: ["./walk-view.component.sass"],
  changeDetection: ChangeDetectionStrategy.Default
})

export class WalkViewComponent implements OnInit, OnDestroy {

  @Input("displayedWalk")
  set init(displayedWalk: DisplayedWalk) {
    this.applyWalk(displayedWalk);
  }

  public walkIdOrPath: string;
  public walkIdFromUrl: boolean;
  public displayedWalk: DisplayedWalk;
  public displayLinks: boolean;
  fromPostcode = "";
  mapDisplay = SHOW_START_POINT;
  private logger: Logger;
  public allowWalkAdminEdits: boolean;
  public googleMapsUrl: SafeResourceUrl;
  public loggedIn: boolean;
  private subscription: Subscription;
  faCopy = faCopy;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  config: ModalOptions = {
    animated: false,
    initialState: {}
  };
  public relatedLinksMediaWidth = 22;
  public walkDetailsMediaWidth = 70;
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};

  constructor(
    private route: ActivatedRoute,
    private walksService: WalksService,
    public googleMapsService: GoogleMapsService,
    private authService: AuthService,
    private memberLoginService: MemberLoginService,
    private modalService: BsModalService,
    public display: WalkDisplayService,
    private dateUtils: DateUtilsService,
    public meetupService: MeetupService,
    private urlService: UrlService,
    private notifierService: NotifierService,
    private broadcastService: BroadcastService,
    private changeDetectorRef: ChangeDetectorRef,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkViewComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.logger.debug("initialised with walk", this.displayedWalk);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.loggedIn = this.memberLoginService.memberLoggedIn();
    this.allowWalkAdminEdits = this.memberLoginService.allowWalkAdminEdits();
    this.refreshHomePostcode();
    this.walkIdFromUrl = this.urlService.relativeUrlIsMongoId();
    this.walkIdOrPath = this.urlService.relativeUrl()
    this.queryIfRequired();
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {
      this.logger.debug("loginResponseObservable:", loginResponse);
      this.display.refreshMembers();
      this.loggedIn = loginResponse.memberLoggedIn;
      this.allowWalkAdminEdits = this.memberLoginService.allowWalkAdminEdits();
      this.refreshHomePostcode();
    });
    this.notify.success({
      title: "Single walk showing",
      message: " - "
    });
  }

  queryIfRequired(): void {
    if (this.walkIdFromUrl) {
      this.walksService.getByIdIfPossible(this.walkIdOrPath)
        .then((walk: Walk) => {
          if (walk) {
            this.applyWalk(this.display.toDisplayedWalk(walk));
          } else {
            this.notify.warning({
              title: "Walk not found",
              message: "Content for this walk doesnt exist"
            });
          }
        });
    } else {}
  }

  private applyWalk(displayedWalk: DisplayedWalk) {
    if (displayedWalk) {
      this.displayedWalk = displayedWalk;
      this.displayLinks = !!(this.displayedWalk.walk.meetupEventUrl || this.displayedWalk.walk.osMapsRoute || this.displayedWalk.walk.osMapsRoute || this.displayedWalk.walk.ramblersWalkId || this.displayedWalk.walkLink);
      this.updateGoogleMap();
    }
  }

  login() {
    this.modalService.show(LoginModalComponent, this.config);
  }

  updateGoogleMap() {
    if (this.displayedWalk.latestEventType.showDetails) {
      this.googleMapsUrl = this.display.googleMapsUrl(this.displayedWalk.walk,
        !this.drivingDirectionsDisabled() && this.mapDisplay === SHOW_DRIVING_DIRECTIONS, this.fromPostcode);
    }
  }

  refreshHomePostcode() {
    this.fromPostcode = this.memberLoginService.memberLoggedIn() ? this.memberLoginService.loggedInMember().postcode : "";
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

  refreshView() {
    this.logger.debug("refreshing view");
    this.updateGoogleMap();
  }

  changeShowDrivingDirections(newValue: string) {
    this.mapDisplay = newValue;
    this.updateGoogleMap();
  }

  changeFromPostcode(newValue: string) {
    this.fromPostcode = newValue;
    this.autoSelectMapDisplay();
    this.updateGoogleMap();
  }

}
