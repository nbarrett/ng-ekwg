import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { LoginService } from "../../../login/login.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { DisplayedWalk } from "../../../models/walk-displayed.model";
import { Walk } from "../../../models/walk.model";
import { DisplayDateAndTimePipe } from "../../../pipes/display-date-and-time.pipe";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";
import { DisplayDayPipe } from "../../../pipes/display-day.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService, GlobalEvent } from "../../../services/broadcast-service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { WalksQueryService } from "../../../services/walks-query.service";
import { WalksReferenceService } from "../../../services/walks-reference-data.service";
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
  private searchChangeObservable: Subject<string>;
  private todayValue: number;
  private walks: Walk[];
  public filteredWalks: DisplayedWalk[] = [];
  public filterParameters = {quickSearch: "", selectType: "1", ascending: "true"};
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};

  constructor(
    @Inject("WalksService") private walksService,
    @Inject("WalkNotificationService") private walkNotificationService,
    @Inject("MemberService") private memberService,
    @Inject("LoggedInMemberService") private loggedInMemberService,
    private display: WalkDisplayService,
    private loginService: LoginService,
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
    private cdr: ChangeDetectorRef,
    private siteEditService: SiteEditService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkListComponent, NgxLoggerLevel.INFO);
    this.searchChangeObservable = new Subject<string>();
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.todayValue = this.dateUtils.momentNowNoTime().valueOf();
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.currentWalkId = paramMap.get("walk-id");
      this.logger.debug("walk-id from route params:", this.currentWalkId);
    });
    this.display.refreshMembers();
    this.refreshWalks();
    this.broadcastService.on("memberLoginComplete", () => this.refreshWalks());
    this.broadcastService.on("walkSlotsCreated", () => this.refreshWalks());
    this.siteEditService.events.subscribe(item => this.logAndDetectChanges(item));
    this.searchChangeObservable.pipe(debounceTime(1000))
      .pipe(distinctUntilChanged())
      .subscribe(searchTerm => this.applyFilterToWalks(searchTerm));
  }

  walkTracker(index: number, walk: DisplayedWalk) {
    return walk.walk.$id();
  }

  onSearchChange(searchEntry: string) {
    this.logger.debug("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);
  }

  applyFilterToWalks(searchTerm?: string) {
    this.logger.debug("applyFilterToWalks:searchTerm:", searchTerm, "filterParameters.quickSearch:", this.filterParameters.quickSearch);
    this.notify.setBusy();
    this.filteredWalks = this.searchFilterPipe.transform(this.walks, this.filterParameters.quickSearch)
      .map(walk => this.display.toDisplayedWalk(walk));
    const walksCount = (this.filteredWalks && this.filteredWalks.length) || 0;
    this.notify.progress("Showing " + walksCount + " walk(s)");
    if (this.filteredWalks.length > 0 && this.display.expandedWalks.length === 0) {
      this.display.view(this.filteredWalks[0].walk);
    }
    this.notify.clearBusy();
  }

  allowAdminEdits() {
    return this.loggedInMemberService.allowWalkAdminEdits();
  }

  allowDetailView() {
    return this.loggedInMemberService.memberLoggedIn();
  }

  selectWalksForExport() {
    this.urlService.navigateTo("walks", "export");
  }

  viewWalkField(walk: DisplayedWalk, field) {
    if (walk.latestEventType.showDetails) {
      return walk.walk[field] || "";
    } else if (field === "briefDescriptionAndStartPoint") {
      return walk.latestEventType.description;
    } else {
      return "";
    }
  }

  addWalk() {
    this.urlService.navigateTo("walks", "add");
  }

  addWalkSlots() {
    this.urlService.navigateTo("walks", "add-walk-slots");
  }

  allowShowAll(): boolean {
    return !!this.currentWalkId;
  }

  showAllWalks() {
    this.urlService.navigateTo("walks");
  }

  walksCriteriaObject() {
    switch (this.filterParameters.selectType) {
      case "1":
        return {walkDate: {$gte: this.todayValue}};
      case "2":
        return {walkDate: {$lt: this.todayValue}};
      case "3":
        return {};
      case "4":
        return {displayName: {$exists: false}};
      case "5":
        return {briefDescriptionAndStartPoint: {$exists: false}};
    }
  }

  walksSortObject() {
    switch (this.filterParameters.ascending) {
      case "true":
        return {sort: {walkDate: 1}};
      case "false":
        return {sort: {walkDate: -1}};
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
      return this.walksService.query(this.walksCriteriaObject(), this.walksSortObject());
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

  refreshWalks(notificationSent?: any) {
    this.notify.progress("Refreshing walks...", true);
    return this.query()
      .then(walks => {
        this.display.setNextWalkId(walks);
        this.logger.debug("refreshWalks", "hasWalksId", this.currentWalkId, "walks:", walks);
        this.walks = this.currentWalkId ? walks : this.walksQueryService.activeWalks(walks);
        this.applyFilterToWalks();
        this.notify.clearBusy();
        this.display.saveInProgress = false;
        this.logAndDetectChanges(GlobalEvent.named("walks query"));
      });
  }

  private logAndDetectChanges(event: GlobalEvent) {
    setTimeout(() => {
      this.logger.debug("detecting changes following", event);
      this.cdr.detectChanges();
    }, 0);
  }

  loginOrLogout() {

  }

  allowEdits() {
    return false;
  }

  toggle($event) {
    this.logAndDetectChanges(GlobalEvent.named(event));
  }
}
