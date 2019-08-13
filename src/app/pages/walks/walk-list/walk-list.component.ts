import { ActivatedRoute, ParamMap } from "@angular/router";
import { BroadcastService } from "../../../services/broadcast-service";
import { Component, Inject, OnInit } from "@angular/core";
import { DateUtilsService } from "../../../services/date-utils.service";
import { WalksReferenceService } from "../../../services/walks-reference-data.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { LoginService } from "../../../login/login.service";
import { NgxLoggerLevel } from "ngx-logger";
import { UrlService } from "../../../services/url.service";
import { Walk } from "../../../models/walk.model";
import { WalksQueryService } from "../../../services/walks-query.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { Subject } from "rxjs";
import { WalkDisplayService } from "../walk-display.service";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";
import { DisplayDayPipe } from "../../../pipes/display-day.pipe";
import { DisplayDateAndTimePipe } from "../../../pipes/display-date-and-time.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";

@Component({
  selector: "app-walk-list",
  templateUrl: "./walk-list.component.html"
})
export class WalkListComponent implements OnInit {
  public currentWalkId: string;
  private logger: Logger;
  private notify: AlertInstance;
  private searchChangeObservable: Subject<string>;
  private todayValue: any;
  private walks: Walk[];
  public filteredWalks: Walk[] = [];
  public filterParameters = {quickSearch: "", selectType: "1", ascending: "true"};
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
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkListComponent, NgxLoggerLevel.INFO);
    this.searchChangeObservable = new Subject<string>();
  }

  ngOnInit() {
    this.logger.info("ngOnInit");
    this.todayValue = this.dateUtils.momentNowNoTime().valueOf();
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.currentWalkId = paramMap.get("walk-id");
      this.logger.info("walk-id from route params:", this.currentWalkId);
    });
    this.display.refreshMembers();
    this.refreshWalks();
    this.broadcastService.on("walkSlotsCreated", () => this.refreshWalks());
    this.searchChangeObservable.pipe(debounceTime(1000))
      .pipe(distinctUntilChanged())
      .subscribe(item => {
        this.applyFilterToWalks(item);
      });
  }

  onSearchChange($event: any) {
    this.logger.info("received searchValue:" + $event);
    this.searchChangeObservable.next($event);
  }

  applyFilterToWalks(keyValue?: string) {
    this.logger.info("applyFilterToWalks:keyValue", keyValue, "this.filterParameters.quickSearch:", this.filterParameters.quickSearch);
    this.notify.setBusy();
    this.filteredWalks = this.searchFilterPipe.transform(this.walks, this.filterParameters.quickSearch);
    const walksCount = (this.filteredWalks && this.filteredWalks.length) || 0;
    this.notify.progress("Showing " + walksCount + " walk(s)");
    if (this.filteredWalks.length > 0 && this.display.expandedWalks.length === 0) {
      this.display.setExpandedWalks([{walkId: this.filteredWalks[0].$id(), edit: false}]);
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
    // this.showWalkExportDialog();
  }

  viewWalkField(walk: Walk, field) {
    const eventType = this.display.eventTypeFor(walk);
    if (eventType.showDetails) {
      return walk[field] || "";
    } else if (field === "briefDescriptionAndStartPoint") {
      return eventType.description;
    } else {
      return "";
    }
  }

  addWalk() {
    this.urlService.navigateTo("walks", "add");
  }

  addWalkSlotsDialog() {
    this.broadcastService.broadcast("addWalkSlotsDialogOpen");
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

  showTableHeader(walk: Walk) {
    return this.filteredWalks.indexOf(walk) === 0 ||
      this.display.isExpanded(this.filteredWalks[this.filteredWalks.indexOf(walk) - 1]);
  }

  tableRowOdd(walk: Walk) {
    return this.filteredWalks.indexOf(walk) % 2 === 0;
  }

  tableRowEven(walk: Walk) {
    return !this.tableRowOdd(walk);
  }

  refreshWalks(notificationSent?: any) {
    this.notify.progress("Refreshing walks...", true);
    return this.query()
      .then(walks => {
        this.display.setNextWalkId(walks);
        this.logger.info("refreshWalks", "hasWalksId", this.currentWalkId, "walks:", walks);
        this.walks = this.currentWalkId ? walks : this.walksQueryService.activeWalks(walks);
        this.applyFilterToWalks();
        this.notify.clearBusy();
        this.display.saveInProgress = false;
      });
  }

  loginOrLogout() {

  }

  allowEdits() {
    return false;
  }

  editWalk(walk: Walk) {
    this.display.toggleExpandedViewFor(walk);
    this.display.editWalk(walk);
  }
}
