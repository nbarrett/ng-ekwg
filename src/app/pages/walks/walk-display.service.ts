import { Inject, Injectable } from "@angular/core";
import { EventType, WalksReferenceService } from "../../services/walks-reference-data.service";
import { Walk } from "../../models/walk.model";
import { WalkEditMode } from "../../models/walk-edit-mode.model";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { WalksQueryService } from "../../services/walks-query.service";
import { WalkEventType } from "../../models/walk-event-type.model";
import { ActivatedRoute, Router } from "@angular/router";
import { UrlService } from "../../services/url.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { find, isEmpty, sortBy } from "lodash-es";
import { Member } from "../../models/member.model";
import { DateUtilsService } from "../../services/date-utils.service";
import { PopoverDirective } from "ngx-bootstrap";

interface ExpandedWalk {
  walkId: string;
  edit?: boolean;
}

@Injectable({
  providedIn: "root"
})
export class WalkDisplayService {

  expandedWalks: ExpandedWalk [] = [];
  longerDescriptionPreview = true;
  walkExportTab0Active = true;
  walkExportTab1Active = false;
  walkExportTabActive = 0;
  saveInProgress = false;

  private logger: Logger;
  public grades = ["Easy access", "Easy", "Leisurely", "Moderate", "Strenuous", "Technical"];
  public walkTypes = ["Circular", "Linear"];
  private nextWalkId: string;
  private sendNotifications: boolean;
  public members: Member [] = [];
  private meetupConfig: any;
  public meetupEvents: any[];
  public ramblersWalkBaseUrl: string;
  public googleMapsConfig: {
    apiKey: string;
    zoomLevel: number;
  };
  loggedIn: boolean;

  constructor(
    @Inject("ClipboardService") private clipboardService,
    @Inject("RamblersWalksAndEventsService") private ramblersWalksAndEventsService,
    @Inject("LoggedInMemberService") private loggedInMemberService,
    @Inject("WalkNotificationService") private walkNotificationService,
    @Inject("MemberService") private memberService,
    @Inject("GoogleMapsConfig") private googleMapsConfigService,
    @Inject("MeetupService") private meetupService,
    private router: Router,
    private urlService: UrlService,
    private route: ActivatedRoute,
    private sanitiser: DomSanitizer,
    private dateUtils: DateUtilsService,
    private walksReferenceService: WalksReferenceService,
    private walksQueryService: WalksQueryService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkDisplayService, NgxLoggerLevel.INFO);
    this.refreshGoogleMapsConfig();
    this.refreshRamblersConfig();
    this.refreshMembers();
    this.refreshMeetupData();
    this.logger.info("this.loggedInMemberService", this.loggedInMemberService.loggedInMember());
    this.loggedIn = loggedInMemberService.memberLoggedIn();
  }

  refreshMeetupData() {
    this.meetupService.config().then(meetupConfig => {
      this.meetupConfig = meetupConfig;
      this.logger.info("refreshMeetupData:meetupConfig", meetupConfig);
    });
    this.logger.info("refreshMeetupData");
    this.meetupService.eventsForStatus("past")
      .then(pastEvents => {
        this.meetupService.eventsForStatus("upcoming")
          .then(futureEvents => {
            this.meetupEvents = sortBy(pastEvents.concat(futureEvents), "date,").reverse();
            this.logger.info("refreshMeetupData:meetupEvents", this.meetupEvents);
          });
      });
  }

  findWalk(walk: Walk): ExpandedWalk {
    return find(this.expandedWalks, {walkId: walk.$id()}) as ExpandedWalk;
  }

  isExpanded(walk: Walk): boolean {
    return !!this.findWalk(walk);
  }

  isEdit(walk: Walk) {
    const expandedWalk = this.findWalk(walk);
    return expandedWalk && expandedWalk.edit;
  }

  refreshGoogleMapsConfig() {
    this.googleMapsConfigService.getConfig().then(googleMapsConfig => {
      this.googleMapsConfig = googleMapsConfig;
      this.googleMapsConfig.zoomLevel = 12;
    });
  }

  googleMapsUrl(walk: Walk, showDrivingDirections: boolean, fromPostcode: string): SafeResourceUrl {
    const googleMapsUrl = this.sanitiser.bypassSecurityTrustResourceUrl(showDrivingDirections ?
      "https://www.google.com/maps/embed/v1/directions?origin=" + fromPostcode + "&destination=" +
      walk.postcode + "&key=" + this.googleMapsConfig.apiKey :
      "https://www.google.com/maps/embed/v1/place?q=" + walk.postcode + "&zoom=" +
      this.googleMapsConfig.zoomLevel + "&key=" + this.googleMapsConfig.apiKey);
    this.logger.info("this.googleMapsUrl", googleMapsUrl);
    return googleMapsUrl;
  }

  toWalkEditMode(walk: Walk): WalkEditMode {
    if (this.loggedInMemberService.memberLoggedIn()) {
      if (this.loggedInMemberIsLeadingWalk(walk) ||
        this.loggedInMemberService.allowWalkAdminEdits()) {
        return this.walksReferenceService.walkEditModes.edit;
      } else if (!walk.walkLeaderMemberId) {
        return this.walksReferenceService.walkEditModes.lead;
      }
    }
  }

  loggedInMemberIsLeadingWalk(walk: Walk) {
    return walk && walk.walkLeaderMemberId === this.loggedInMemberService.loggedInMember().memberId;
  }

  refreshRamblersConfig() {
    this.ramblersWalksAndEventsService.walkBaseUrl().then((walkBaseUrl) => {
      this.ramblersWalkBaseUrl = walkBaseUrl;
    });
  }

  refreshMembers() {
    if (this.loggedInMemberService.memberLoggedIn()) {
      this.memberService.allLimitedFields(this.memberService.filterFor.GROUP_MEMBERS)
        .then((members) => {
          this.members = members;
        });
    }
  }

  editWalk(walk: Walk) {
    this.logger.info("editing walk:", walk);
    this.toggleEditModeFor(walk);
  }

  statusFor(walk: Walk): EventType {
    return this.walkNotificationService.latestEventWithStatusChange(walk).eventType;
  }

  editWalkFullscreen(walk: Walk) {
    this.logger.info("editing walk fullscreen:", walk);
    this.router.navigate(["walks/edit/" + walk.$id()], {relativeTo: this.route}).then(() => {
      this.logger.info("area is now", this.urlService.area());
      this.toggleEditModeFor(walk);
    });

  }

  toggleEditModeFor(walk: Walk) {
    const expandedWalk = this.findWalk(walk);
    if (expandedWalk) {
      expandedWalk.edit = !expandedWalk.edit;
      this.logger.info("toggleEditModeFor:expandedWalk", expandedWalk);
    } else {
      this.logger.info("toggleEditModeFor:walk", walk.$id(), "expandedWalk not found");
    }
  }

  toggleExpandedViewFor(walk: Walk): ExpandedWalk {
    let expandedWalk: ExpandedWalk;
    const walkId = walk.$id();
    if (this.findWalk(walk)) {
      this.expandedWalks = this.expandedWalks.filter(ele => ele.walkId !== walkId);
      this.logger.info("display.toggleViewFor:", walkId, "-> collapsing");
    } else {
      expandedWalk = {walkId, edit: false};
      this.expandedWalks.push(expandedWalk);
      this.logger.info("display.toggleViewFor:", walkId, "-> expanding");
    }
    this.logger.info("display.toggleViewFor:", walkId, "-> expandedWalks contains", this.expandedWalks);
    return expandedWalk;
  }

  copyWalkToClipboard(walk: Walk, pop: PopoverDirective) {
    this.clipboardService.copyToClipboard(this.walkLink(walk));
    pop.show();
  }

  eventTypeFor(walk: Walk): WalkEventType {
    const latestEventWithStatusChange = this.walkNotificationService.latestEventWithStatusChange(walk);
    let lookupType: EventType;
    if (!isEmpty(latestEventWithStatusChange)) {
      lookupType = latestEventWithStatusChange.eventType;
    } else if (walk.status) {
      lookupType = walk.status;
    } else {
      lookupType = EventType.AWAITING_WALK_DETAILS;
    }
    const eventType = this.walksReferenceService.toEventType(lookupType) as WalkEventType;
    if (!eventType) {
      this.logger.info("given lookupType", lookupType, "-> latestEventWithStatusChange",
        latestEventWithStatusChange, "eventType", eventType, "walk.events", walk.events);
    }
    return eventType;
  }

  nextWalk(walk: Walk): boolean {
    return walk && walk.$id() === this.nextWalkId;
  }

  setNextWalkId(walks: Walk[]) {
    this.nextWalkId = this.walksQueryService.nextWalkId(walks);
  }

  setExpandedWalks(expandedWalks: ExpandedWalk[]) {
    this.expandedWalks = expandedWalks;
  }

  walkLink(walk: Walk): string {
    return walk && walk.$id() ? this.urlService.notificationHref({
      type: "walk",
      area: "walks",
      id: walk.$id()
    }) : undefined;
  }

  ramblersLink(walk: Walk): string {
    return this.ramblersWalkBaseUrl + walk.ramblersWalkId;
  }
}

export enum ConfirmType {
  DELETE = "delete",
  REQUEST_APPROVAL = "requestApproval",
  CANCEL = "cancel",
  CONTACT_OTHER = "contactOther",
  NONE = "none"
}

