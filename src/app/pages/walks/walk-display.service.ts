import { Inject, Injectable } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { find } from "lodash-es";
import { PopoverDirective } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Member } from "../../models/member.model";
import { DisplayedWalk } from "../../models/walk-displayed.model";
import { WalkAccessMode } from "../../models/walk-edit-mode.model";
import { WalkEventType } from "../../models/walk-event-type.model";
import { ExpandedWalk } from "../../models/walk-expanded-view.model";
import { Walk } from "../../models/walk.model";
import { BroadcastService } from "../../services/broadcast-service";
import { DateUtilsService } from "../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { UrlService } from "../../services/url.service";
import { WalkEventService } from "../../services/walks/walk-event.service";
import { WalksQueryService } from "../../services/walks/walks-query.service";
import { EventType, WalksReferenceService } from "../../services/walks/walks-reference-data.service";

@Injectable({
  providedIn: "root"
})
export class WalkDisplayService {

  expandedWalks: ExpandedWalk [] = [];
  longerDescriptionPreview = true;
  saveInProgress = false;

  private logger: Logger;
  public grades = ["Easy access", "Easy", "Leisurely", "Moderate", "Strenuous", "Technical"];
  public walkTypes = ["Circular", "Linear"];
  private nextWalkId: string;
  public members: Member [] = [];
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
    @Inject("MemberService") private memberService,
    @Inject("GoogleMapsConfig") private googleMapsConfigService,
    private router: Router,
    private urlService: UrlService,
    private route: ActivatedRoute,
    private sanitiser: DomSanitizer,
    private dateUtils: DateUtilsService,
    private walkEventService: WalkEventService,
    private walksReferenceService: WalksReferenceService,
    private walksQueryService: WalksQueryService,
    private broadcastService: BroadcastService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkDisplayService, NgxLoggerLevel.INFO);
    this.refreshGoogleMapsConfig();
    this.refreshRamblersConfig();
    this.refreshMembers();
    this.logger.debug("this.loggedInMemberService", this.loggedInMemberService.loggedInMember());
    this.loggedIn = loggedInMemberService.memberLoggedIn();
  }

  findWalk(walk: Walk): ExpandedWalk {
    return find(this.expandedWalks, {walkId: walk.$id()}) as ExpandedWalk;
  }

  walkMode(walk: Walk): WalkViewMode {
    const expandedWalk = find(this.expandedWalks, {walkId: walk.$id()}) as ExpandedWalk;
    return expandedWalk ? expandedWalk.mode : WalkViewMode.LIST;
  }

  isExpanded(walk: Walk): boolean {
    return !!this.findWalk(walk);
  }

  isEdit(walk: Walk) {
    const expandedWalk = this.findWalk(walk);
    return expandedWalk && expandedWalk.mode === WalkViewMode.EDIT;
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
    this.logger.debug("this.googleMapsUrl", googleMapsUrl);
    return googleMapsUrl;
  }

  loggedInMemberIsLeadingWalk(walk: Walk) {
    return this.loggedInMemberService.memberLoggedIn() && walk && walk.walkLeaderMemberId === this.loggedInMemberService.loggedInMember().memberId;
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

  edit(walkDisplay: DisplayedWalk): ExpandedWalk {
    return this.toggleExpandedViewFor(walkDisplay.walk, WalkViewMode.EDIT);
  }

  list(walk: Walk): ExpandedWalk {
    this.logger.debug("listing walk:", walk);
    return this.toggleExpandedViewFor(walk, WalkViewMode.LIST);
  }

  view(walk: Walk): ExpandedWalk {
    return this.toggleExpandedViewFor(walk, WalkViewMode.VIEW);
  }

  statusFor(walk: Walk): EventType {
    return this.walkEventService.latestEventWithStatusChange(walk).eventType;
  }

  editFullscreen(walk: Walk): Promise<ExpandedWalk> {
    this.logger.debug("editing walk fullscreen:", walk);
    return this.router.navigate(["walks/edit/" + walk.$id()], {relativeTo: this.route}).then(() => {
      this.logger.debug("area is now", this.urlService.area());
      return this.toggleExpandedViewFor(walk, WalkViewMode.EDIT_FULL_SCREEN);
    });
  }

  toggleExpandedViewFor(walk: Walk, toggleTo: WalkViewMode): ExpandedWalk {
    const walkId = walk.$id();
    const existingWalk: ExpandedWalk = this.findWalk(walk);
    if (existingWalk && toggleTo === WalkViewMode.LIST) {
      this.expandedWalks = this.expandedWalks.filter(ele => ele.walkId !== walkId);
      this.logger.debug("display.toggleViewFor", toggleTo, "removed", walkId);
    } else if (existingWalk) {
      existingWalk.mode = toggleTo;
      this.logger.debug("display.toggleViewFor", toggleTo, "updated", existingWalk);
    } else {
      const newWalk = {walkId, mode: toggleTo};
      this.expandedWalks.push(newWalk);
      this.logger.debug("display.toggleViewFor", toggleTo, "added", newWalk);
    }
    return existingWalk;
  }

  copyWalkToClipboard(walk: Walk, pop: PopoverDirective) {
    this.clipboardService.copyToClipboard(this.walkLink(walk));
    pop.show();
  }

  latestEventTypeFor(walk: Walk): WalkEventType {
    const latestEventWithStatusChange = this.walkEventService.latestEventWithStatusChange(walk);
    let lookupType: EventType;
    if (latestEventWithStatusChange) {
      lookupType = latestEventWithStatusChange.eventType;
    } else {
      lookupType = EventType.AWAITING_WALK_DETAILS;
    }
    const eventType = this.walksReferenceService.toWalkEventType(lookupType) as WalkEventType;
    if (!eventType) {
      this.logger.error("given lookupType", lookupType, "-> latestEventWithStatusChange",
        latestEventWithStatusChange, "eventType", eventType, "walk.events", walk.events);
    }
    return eventType;
  }

  walkLink(walk: Walk): string {
    return walk && walk.$id() ? this.urlService.notificationHref({
      type: "walk",
      area: "walks",
      id: walk.$id()
    }) : undefined;
  }

  ramblersLink(walk: Walk): string {
    return walk.ramblersWalkId && (this.ramblersWalkBaseUrl + walk.ramblersWalkId);
  }

  toWalkAccessMode(walk: Walk): WalkAccessMode {
    let returnValue = WalksReferenceService.walkAccessModes.view;
    if (this.loggedInMemberService.memberLoggedIn()) {
      if (this.loggedInMemberIsLeadingWalk(walk) ||
        this.loggedInMemberService.allowWalkAdminEdits()) {
        returnValue = WalksReferenceService.walkAccessModes.edit;
      } else if (!walk.walkLeaderMemberId) {
        returnValue = WalksReferenceService.walkAccessModes.lead;
      }
    }
    return returnValue;
  }

  toDisplayedWalk(walk: Walk): DisplayedWalk {
    return {
      walk,
      walkAccessMode: this.toWalkAccessMode(walk),
      status: this.statusFor(walk),
      latestEventType: this.latestEventTypeFor(walk),
      walkLink: this.walkLink(walk),
      ramblersLink: this.ramblersLink(walk),
    };
  }

  refreshDisplayedWalk(displayedWalk: DisplayedWalk): void {
    displayedWalk.walkAccessMode = this.toWalkAccessMode(displayedWalk.walk);
    displayedWalk.status = this.statusFor(displayedWalk.walk);
    displayedWalk.latestEventType = this.latestEventTypeFor(displayedWalk.walk);
    displayedWalk.walkLink = this.walkLink(displayedWalk.walk);
    displayedWalk.ramblersLink = this.ramblersLink(displayedWalk.walk);
  }

  isNextWalk(walk: Walk): boolean {
    return walk && walk.$id() === this.nextWalkId;
  }

  setNextWalkId(walks: Walk[]) {
    this.nextWalkId = this.walksQueryService.nextWalkId(walks);
  }

  setExpandedWalks(expandedWalks: ExpandedWalk[]) {
    this.expandedWalks = expandedWalks;
  }

  closeEditView(walk: Walk) {
    if (this.urlService.hasRouteParameter("edit")) {
      this.urlService.navigateTo("walks");
    }
    this.toggleExpandedViewFor(walk, WalkViewMode.VIEW);
  }

}

export enum ConfirmType {
  DELETE = "delete",
  REQUEST_APPROVAL = "requestApproval",
  CANCEL = "cancel",
  CONTACT_OTHER = "contactOther",
  PUBLISH_MEETUP = "publishMeetup",
  NONE = "none"
}

export enum WalkViewMode {
  VIEW = "view",
  EDIT = "edit",
  EDIT_FULL_SCREEN = "edit-full-screen",
  LIST = "list"
}

