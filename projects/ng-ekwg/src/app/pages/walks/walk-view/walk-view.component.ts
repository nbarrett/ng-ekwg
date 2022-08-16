import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { faCopy, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { LoginResponse } from "../../../models/member.model";
import { DisplayedWalk, Walk } from "../../../models/walk.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { GoogleMapsService } from "../../../services/google-maps.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MeetupService } from "../../../services/meetup.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { UrlService } from "../../../services/url.service";
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
    this.displayedWalk = displayedWalk;
    this.displayLinks = !!(displayedWalk.walk.meetupEventUrl || displayedWalk.walk.osMapsRoute || displayedWalk.walk.osMapsRoute || displayedWalk.walk.ramblersWalkId || displayedWalk.walkLink);
  }
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

  constructor(
    public googleMapsService: GoogleMapsService,
    private authService: AuthService,
    private memberLoginService: MemberLoginService,
    private modalService: BsModalService,
    public display: WalkDisplayService,
    private dateUtils: DateUtilsService,
    public meetupService: MeetupService,
    private urlService: UrlService,
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
    this.loggedIn = this.memberLoginService.memberLoggedIn();
    this.allowWalkAdminEdits = this.memberLoginService.allowWalkAdminEdits();
    this.refreshHomePostcode();
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {
      this.logger.debug("loginResponseObservable:", loginResponse);
      this.display.refreshMembers();
      this.loggedIn = loginResponse.memberLoggedIn;
      this.allowWalkAdminEdits = this.memberLoginService.allowWalkAdminEdits();
      this.refreshHomePostcode();
    });
    this.updateGoogleMap();
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
