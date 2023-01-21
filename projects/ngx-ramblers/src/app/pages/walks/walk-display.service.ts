import { Injectable } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import find from "lodash-es/find";
import { TooltipDirective } from "ngx-bootstrap/tooltip";
import { NgxLoggerLevel } from "ngx-logger";
import { Member } from "../../models/member.model";
import { WalkAccessMode } from "../../models/walk-edit-mode.model";
import { WalkEventType } from "../../models/walk-event-type.model";
import { ExpandedWalk } from "../../models/walk-expanded-view.model";
import { DisplayedWalk, EventType, GoogleMapsConfig, Walk, WalkViewMode } from "../../models/walk.model";
import { uniq } from "../../services/arrays";
import { ClipboardService } from "../../services/clipboard.service";
import { DateUtilsService } from "../../services/date-utils.service";
import { GoogleMapsService } from "../../services/google-maps.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { MemberLoginService } from "../../services/member/member-login.service";
import { MemberService } from "../../services/member/member.service";
import { UrlService } from "../../services/url.service";
import { RamblersWalksAndEventsService } from "../../services/walks/ramblers-walks-and-events.service";
import { WalkEventService } from "../../services/walks/walk-event.service";
import { WalksQueryService } from "../../services/walks/walks-query.service";
import { WalksReferenceService } from "../../services/walks/walks-reference-data.service";
import { WalksService } from "../../services/walks/walks.service";

@Injectable({
  providedIn: "root"
})

export class WalkDisplayService {

  expandedWalks: ExpandedWalk [] = [];
  private logger: Logger;
  public grades = ["Easy access", "Easy", "Leisurely", "Moderate", "Strenuous", "Technical"];
  public walkTypes = ["Circular", "Linear"];
  private nextWalkId: string;
  public members: Member[] = [];
  public ramblersWalkBaseUrl: string;
  public googleMapsConfig: GoogleMapsConfig;
  loggedIn: boolean;
  public previousWalkLeaderIds: string[];

  constructor(
    private ramblersWalksAndEventsService: RamblersWalksAndEventsService,
    private googleMapsService: GoogleMapsService,
    private walksService: WalksService,
    private memberService: MemberService,
    private memberLoginService: MemberLoginService,
    public clipboardService: ClipboardService,
    private router: Router,
    private urlService: UrlService,
    private route: ActivatedRoute,
    private sanitiser: DomSanitizer,
    private dateUtils: DateUtilsService,
    private walkEventService: WalkEventService,
    private walksReferenceService: WalksReferenceService,
    private walksQueryService: WalksQueryService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkDisplayService, NgxLoggerLevel.OFF);
    this.refreshGoogleMapsService();
    this.refreshRamblersConfig();
    this.refreshCachedData();
    this.logger.debug("this.memberLoginService", this.memberLoginService.loggedInMember());
    this.loggedIn = memberLoginService.memberLoggedIn();
  }

  private queryPreviousWalkLeaderIds(): Promise<string[]> {
    return this.walksService.all().then(walks => uniq(walks.filter(item => item.walkLeaderMemberId).map(item => item.walkLeaderMemberId)));
  }

  findWalk(walk: Walk): ExpandedWalk {
    return find(this.expandedWalks, {walkId: walk.id}) as ExpandedWalk;
  }

  walkMode(walk: Walk): WalkViewMode {
    const expandedWalk = find(this.expandedWalks, {walkId: walk.id}) as ExpandedWalk;
    const walkViewMode = expandedWalk ? expandedWalk.mode : this.urlService.pathContains("edit") ? WalkViewMode.EDIT_FULL_SCREEN : WalkViewMode.LIST;
    this.logger.debug("walkMode:", walkViewMode, "expandedWalk:", expandedWalk);
    return walkViewMode;
  }

  isExpanded(walk: Walk): boolean {
    return !!this.findWalk(walk);
  }

  isEdit(walk: Walk) {
    const expandedWalk = this.findWalk(walk);
    return expandedWalk && expandedWalk.mode === WalkViewMode.EDIT;
  }

  refreshGoogleMapsService() {
    this.googleMapsService.getConfig().then(config => {
      this.googleMapsConfig = {zoomLevel: 12, apiKey: config.apiKey};
    });
  }

  googleMapsUrl(walk: Walk, showDrivingDirections: boolean, fromPostcode: string): SafeResourceUrl {
    const googleMapsUrl = this.sanitiser.bypassSecurityTrustResourceUrl(showDrivingDirections ?
      `https://www.google.com/maps/embed/v1/directions?origin=${fromPostcode}&destination=${walk.postcode}&key=${this.googleMapsConfig?.apiKey}` :
      `https://www.google.com/maps/embed/v1/place?q=${walk.postcode}&zoom=${this.googleMapsConfig?.zoomLevel}&key=${this.googleMapsConfig?.apiKey}`);
    this.logger.debug("this.googleMapsUrl", googleMapsUrl);
    return googleMapsUrl;
  }

  loggedInMemberIsLeadingWalk(walk: Walk) {
    return this.memberLoginService.memberLoggedIn() && walk && walk.walkLeaderMemberId === this.memberLoginService.loggedInMember().memberId;
  }

  refreshRamblersConfig() {
    this.ramblersWalksAndEventsService.walkBaseUrl().then((walkBaseUrl) => {
      this.ramblersWalkBaseUrl = walkBaseUrl.response.toString();
    });
  }

  async refreshCachedData() {
    if (this.memberLoginService.memberLoggedIn() && this.members.length === 0) {
      this.members = await this.memberService.publicFields(this.memberService.filterFor.GROUP_MEMBERS);
      this.previousWalkLeaderIds = (await this.queryPreviousWalkLeaderIds() || []);
      this.logger.debug("previousWalkLeaderIds:", this.previousWalkLeaderIds);
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
    const walkEvent = this.walkEventService.latestEventWithStatusChange(walk);
    return walkEvent && walkEvent.eventType;
  }

  editFullscreen(walk: Walk): Promise<ExpandedWalk> {
    this.logger.debug("editing walk fullscreen:", walk);
    return this.router.navigate(["walks/edit/" + walk.id], {relativeTo: this.route}).then(() => {
      this.logger.debug("area is now", this.urlService.area());
      return this.toggleExpandedViewFor(walk, WalkViewMode.EDIT_FULL_SCREEN);
    });
  }

  toggleExpandedViewFor(walk: Walk, toggleTo: WalkViewMode): ExpandedWalk {
    const walkId = walk.id;
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

  copyWalkToClipboard(walk: Walk, pop: TooltipDirective) {
    // this.clipboardService.copyToClipboardWithTooltip(this.walkLink(walk), pop);
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
    return walk?.id ? this.urlService.linkUrl({area: "walks", id: walk.id}) : null;
  }

  ramblersLink(walk: Walk): string {
    return walk.ramblersWalkId && (this.ramblersWalkBaseUrl + walk.ramblersWalkId);
  }

  gridReferenceLink(walk: Walk): string {
    return `https://gridreferencefinder.com/?gr=${walk.gridReference}`;
  }

  toWalkAccessMode(walk: Walk): WalkAccessMode {
    let returnValue = WalksReferenceService.walkAccessModes.view;
    if (this.memberLoginService.memberLoggedIn()) {
      if (this.loggedInMemberIsLeadingWalk(walk) ||
        this.memberLoginService.allowWalkAdminEdits()) {
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
    return walk && walk.id === this.nextWalkId;
  }

  setNextWalkId(walks: Walk[]) {
    this.nextWalkId = this.walksQueryService.nextWalkId(walks);
  }

  setExpandedWalks(expandedWalks: ExpandedWalk[]) {
    this.expandedWalks = expandedWalks;
  }

  closeEditView(walk: Walk) {
    if (this.urlService.pathContains("edit")) {
      this.urlService.navigateTo("walks");
    }
    this.toggleExpandedViewFor(walk, WalkViewMode.VIEW);
  }

}
