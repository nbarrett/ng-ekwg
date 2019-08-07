import { ActivatedRoute, ParamMap } from "@angular/router";
import { BroadcasterService } from "../../../services/broadcast-service";
import { Component, Inject, OnInit } from "@angular/core";
import { DateUtilsService } from "../../../services/date-utils.service";
import { WalksReferenceService } from "../../../services/walks-reference-data.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { LoginService } from "../../../login/login.service";
import { NgxLoggerLevel } from "ngx-logger";
import { UrlService } from "../../../services/url.service";
import { Walk } from "../../../models/walk.model";
import { WalkEditMode } from "../../../models/walk-edit-mode.model";
import { WalksQueryService } from "../../../services/walks-query.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { Observable, Observer } from "rxjs";
import { WalkDisplayService } from "../walk-display.service";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";
import { DisplayDayPipe } from "../../../pipes/display-day.pipe";
import { DisplayDateAndTimePipe } from "../../../pipes/display-date-and-time.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";

@Component({
  selector: "app-walks",
  templateUrl: "./walk-list.component.html"
})
export class WalkListComponent implements OnInit {

  private logger: Logger;
  public currentWalk: any;
  public filterParameters = {quickSearch: "", selectType: "1", ascending: "true"};
  private members: [];
  private todayValue: any;
  private filteredWalks: Walk[] = [];
  private allow: any;
  private walkEditMode: WalkEditMode;
  private currentWalkId: string;
  private nextWalkId: string;
  private walks: Walk[];
  private notifyTarget: AlertTarget = {};
  private notify: AlertInstance;
  private notifyWalkEdit: AlertInstance;
  private searchChangeObserver: Observer<string>;
  private searchChangeObservable: Observable<string>;

  constructor(
    @Inject("ClipboardService") public clipboardService,
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
    private broadcasterService: BroadcasterService,
    private urlService: UrlService,
    private walksReferenceService: WalksReferenceService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkListComponent, NgxLoggerLevel.INFO);
    this.searchChangeObservable = Observable.create((observer: Observer<string>) => {
      this.searchChangeObserver = observer;
    }) as Observable<string>;
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
    this.broadcasterService.on("walkSlotsCreated", () => this.refreshWalks());
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
    this.broadcasterService.broadcast("addWalkSlotsDialogOpen");
  }

  allowShowAll() {
    return true;
  }

  showAllWalks() {
    this.urlService.navigateTo("walks", "programme");
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

  onSearchChange(searchValue: string) {
    this.logger.info("received searchValue:" + searchValue);
    this.searchChangeObservable.pipe(debounceTime(500))
      .pipe(distinctUntilChanged())
      .subscribe(item => {
        this.searchChangeObserver.next(item);
        this.refreshFilteredWalks(item);
      });
  }

  refreshFilteredWalks(keyValue?: string) {
    this.logger.info("refreshFilteredWalks->keyValue", keyValue);
    this.notify.setBusy();
    this.filteredWalks = this.searchFilterPipe.transform(this.walks, this.filterParameters.quickSearch);
    const walksCount = (this.filteredWalks && this.filteredWalks.length) || 0;
    this.notify.progress("Showing " + walksCount + " walk(s)");
    if (this.filteredWalks.length > 0) {
      this.display.setExpandedWalks([this.filteredWalks[0].$id()]);
    }
    this.notify.clearBusy();
  }

  showTableHeader(walk: Walk) {
    return this.filteredWalks.indexOf(walk) === 0 || this.isExpandedFor(this.filteredWalks[this.filteredWalks.indexOf(walk) - 1]);
  }

  isExpandedFor(walk: Walk) {
    return walk && this.display.expandedWalks.includes(walk.$id());
  }

  tableRowOdd(walk: Walk) {
    return this.filteredWalks.indexOf(walk) % 2 === 0;
  }

  tableRowEven(walk: Walk) {
    return !this.tableRowOdd(walk);
  }

  refreshWalks(notificationSent?: any) {
    this.logger.info("refreshWalks");
    this.notify.setBusy();
    this.notify.progress("Refreshing walks...");
    return this.query()
      .then(walks => {
        if (this.currentWalkId) {
          this.display.setNextWalkId(walks);
        }
        this.logger.info("refreshWalks", "hasWalksId", this.currentWalkId, "walks:", walks);
        this.walks = this.currentWalkId ? walks : this.walksQueryService.activeWalks(walks);
        this.refreshFilteredWalks();
        this.notify.clearBusy();
        this.display.saveInProgress = false;
      });
  }

  loginOrLogout() {

  }

  allowEdits() {
    return false;
  }
}
