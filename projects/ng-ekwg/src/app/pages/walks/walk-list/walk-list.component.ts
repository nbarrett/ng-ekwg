import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import range from "lodash-es/range";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEventType } from "../../../models/broadcast.model";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { LoginResponse } from "../../../models/member.model";
import { DisplayedWalk, EventType, FilterParameters, Walk } from "../../../models/walk.model";
import { DisplayDateAndTimePipe } from "../../../pipes/display-date-and-time.pipe";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";
import { DisplayDayPipe } from "../../../pipes/display-day.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { GoogleMapsService } from "../../../services/google-maps.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { NumberUtilsService } from "../../../services/number-utils.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { WalkNotificationService } from "../../../services/walks/walk-notification.service";
import { WalksQueryService } from "../../../services/walks/walks-query.service";
import { WalksReferenceService } from "../../../services/walks/walks-reference-data.service";
import { WalksService } from "../../../services/walks/walks.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";
import { WalkDisplayService } from "../walk-display.service";

@Component({
  selector: "app-walk-list",
  templateUrl: "./walk-list.component.html",
  styleUrls: ["./walk-list.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalkListComponent implements OnInit {
  public currentWalkId: string;
  private logger: Logger;
  private todayValue: number;
  public walks: Walk[];
  public filteredWalks: DisplayedWalk[] = [];
  public filterParameters: FilterParameters = {quickSearch: "", selectType: 1, ascending: true};
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private pageSize: number;
  public pageNumber: number;
  public pageCount: number;
  public pages: number[] = [];

  constructor(
    public googleMapsService: GoogleMapsService,
    private walksService: WalksService,
    private memberService: MemberService,
    private numberUtils: NumberUtilsService,
    private authService: AuthService,
    public memberLoginService: MemberLoginService,
    private walksNotificationService: WalkNotificationService,
    public display: WalkDisplayService,
    private stringUtils: StringUtilsService,
    private displayDay: DisplayDayPipe,
    private displayDate: DisplayDatePipe,
    private searchFilterPipe: SearchFilterPipe,
    private displayDateAndTime: DisplayDateAndTimePipe,
    private route: ActivatedRoute,
    private walksQueryService: WalksQueryService,
    private dateUtils: DateUtilsService,
    private notifierService: NotifierService,
    private broadcastService: BroadcastService,
    private urlService: UrlService,
    private walksReferenceService: WalksReferenceService,
    private changeDetectorRef: ChangeDetectorRef,
    private siteEditService: SiteEditService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkListComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.todayValue = this.dateUtils.momentNowNoTime().valueOf();
    this.pageSize = 10;
    this.pageNumber = 1;
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.currentWalkId = paramMap.get("walk-id");
      this.logger.debug("walk-id from route params:", this.currentWalkId);
    });
    this.display.refreshMembers();
    this.refreshWalks("ngOnInit");
    this.authService.authResponse().subscribe((loginResponse: LoginResponse) => this.refreshWalks(loginResponse));
    this.broadcastService.on(NamedEventType.WALK_SLOTS_CREATED, () => this.refreshWalks(NamedEventType.WALK_SLOTS_CREATED));
    this.broadcastService.on(NamedEventType.REFRESH, () => this.refreshWalks(NamedEventType.REFRESH));
    this.broadcastService.on(NamedEventType.APPLY_FILTER, (searchTerm?: string) => this.applyFilterToWalks(searchTerm));
    this.broadcastService.on(NamedEventType.WALK_SAVED, (event) => this.replaceWalkInList(event.data));
    this.siteEditService.events.subscribe(item => this.logAndDetectChanges(item));
  }

  walkTracker(index: number, walk: DisplayedWalk) {
    return walk.walk.id;
  }

  paginate(walks: Walk[], pageSize, pageNumber): Walk[] {
    return walks.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  applyFilterToWalks(searchTerm?: string): void {
    this.notify.setBusy();
    this.logger.info("applyFilterToWalks:searchTerm:", searchTerm, "filterParameters.quickSearch:", this.filterParameters.quickSearch);
    this.pageNumber = 1;
    this.pageCount = this.numberUtils.asNumber((this.walks.length / this.pageSize), 0);
    this.pages = range(1, this.pageCount + 1);
    this.applyPagination();
    const walksCount = this.filteredWalks?.length || 0;
    this.notify.progress(`Showing ${walksCount} of ${this.stringUtils.pluraliseWithCount(this.walks.length, "walk")}`);
    if (this.filteredWalks.length > 0 && this.display.expandedWalks.length === 0) {
      this.display.view(this.filteredWalks[0].walk);
    }
    this.notify.clearBusy();
  }

  private applyPagination() {
    this.filteredWalks = this.paginate(this.searchFilterPipe.transform(this.walks, this.filterParameters.quickSearch), this.pageSize, this.pageNumber)
      .map(walk => this.display.toDisplayedWalk(walk));
    this.logger.info("walks count", this.walks.length, "pageSize:", this.pageSize, "pageCount", this.pageCount, "pages", this.pages);
  }

  allowAdminEdits() {
    return this.memberLoginService.allowWalkAdminEdits();
  }

  allowDetailView() {
    return this.memberLoginService.memberLoggedIn();
  }

  viewWalkField(displayedWalk: DisplayedWalk, field) {
    if (displayedWalk.latestEventType.showDetails) {
      return displayedWalk.walk[field] || "";
    } else if (field === "briefDescriptionAndStartPoint") {
      return displayedWalk.latestEventType.description;
    } else {
      return "";
    }
  }

  addWalk() {
    this.urlService.navigateTo("walks", "add");
  }

  allowShowAll(): boolean {
    return !!this.currentWalkId;
  }

  showAllWalks() {
    this.urlService.navigateTo("walks");
  }

  walksCriteriaObject() {
    switch (this.filterParameters.selectType) {
      case 1:
        return {walkDate: {$gte: this.todayValue}};
      case 2:
        return {walkDate: {$lt: this.todayValue}};
      case 3:
        return {};
      case 4:
        return {displayName: {$exists: false}};
      case 5:
        return {briefDescriptionAndStartPoint: {$exists: false}};
      case 6:
        return {"events.eventType": {$eq: EventType.DELETED.toString()}};
    }
  }

  walksSortObject() {
    this.logger.info("walksSortObject:", this.filterParameters);
    switch (Boolean(this.filterParameters.ascending)) {
      case true:
        return {walkDate: 1};
      case false:
        return {walkDate: -1};
    }
  }

  query() {
    if (this.currentWalkId) {
      return this.walksService.getById(this.currentWalkId)
        .then((walk: Walk) => {
          if (!walk) {
            this.notify.error("Walk could not be found. Try opening again from the link in the notification email, " +
              "or choose the Show All Walks button");
          }
          return [walk];
        });
    } else {
      const criteria = this.walksCriteriaObject();
      const sort = this.walksSortObject();
      this.logger.info("walksCriteriaObject:this.filterParameters.criteria", criteria, "sort:", sort);
      return this.walksService.all({criteria, sort});
    }
  }

  showTableHeader(walk: DisplayedWalk) {
    return this.filteredWalks.indexOf(walk) === 0 ||
      this.display.isExpanded(this.filteredWalks[this.filteredWalks.indexOf(walk) - 1].walk);
  }

  tableRowOdd(walk: DisplayedWalk) {
    return this.filteredWalks.indexOf(walk) % 2 === 0;
  }

  tableRowEven(walk: DisplayedWalk) {
    return !this.tableRowOdd(walk);
  }

  private replaceWalkInList(walk: Walk) {
    this.logger.debug("Received updated walk", walk);
    const existingWalk: Walk = this.walks.find(listedWalk => listedWalk.id === walk.id);
    if (existingWalk) {
      this.walks[(this.walks.indexOf(existingWalk))] = walk;
      this.applyFilterToWalks();
    }
    this.logAndDetectChanges("updated walk");
  }

  refreshWalks(event?: any): Promise<void> {
    this.logger.info("Refreshing walks due to", event);
    this.notify.progress("Refreshing walks...", true);
    return this.query()
      .then(walks => {
        this.display.setNextWalkId(walks);
        this.logger.debug("refreshWalks", "hasWalksId", this.currentWalkId, "walks:", walks);
        this.walks = this.currentWalkId || this.filterParameters.selectType === 6 ? walks : this.walksQueryService.activeWalks(walks);
        this.applyFilterToWalks();
        this.notify.clearBusy();
        this.logAndDetectChanges("walks query");
      });
  }

  private logAndDetectChanges(event: any) {
    setTimeout(() => {
      this.logger.debug("detecting changes following", event);
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  loginOrLogout() {

  }

  allowEdits() {
    return false;
  }

  toggle($event) {
    // this.logAndDetectChanges(GlobalEvent.named($event + "ooi!?"));
  }

  pageChanged(event: PageChangedEvent): void {
    this.goToPage(event.page)
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.goToPage(this.pageNumber - 1);
    }
  }

  nextPage() {
    if (this.pageNumber < this.pageCount) {
      this.goToPage(this.pageNumber + 1);
    }
  }

  goToPage(pageNumber) {
    this.pageNumber = pageNumber;
    this.applyPagination();
  }
}
