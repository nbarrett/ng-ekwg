import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import difference from "lodash-es/difference";
import map from "lodash-es/map";
import times from "lodash-es/times";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertMessage, AlertTarget } from "../../../models/alert-target.model";
import { NamedEventType } from "../../../models/broadcast.model";
import { DateValue } from "../../../models/date.model";
import { Walk } from "../../../models/walk.model";
import { DisplayDateAndTimePipe } from "../../../pipes/display-date-and-time.pipe";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";
import { DisplayDatesPipe } from "../../../pipes/display-dates.pipe";
import { DisplayDayPipe } from "../../../pipes/display-day.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { WalkEventService } from "../../../services/walks/walk-event.service";
import { WalkNotificationService } from "../../../services/walks/walk-notification.service";
import { WalksQueryService } from "../../../services/walks/walks-query.service";
import { WalksReferenceService } from "../../../services/walks/walks-reference-data.service";
import { WalksService } from "../../../services/walks/walks.service";
import { WalkDisplayService } from "../walk-display.service";

@Component({
  selector: "app-walk-add-slots",
  templateUrl: "./walk-add-slots.component.html",
  styleUrls: ["./walk-add-slots.component.sass"]
})
export class WalkAddSlotsComponent implements OnInit {
  public confirmAction = false;
  private logger: Logger;
  private notify: AlertInstance;
  private requiredWalkSlots: Walk[] = [];
  public singleDate: DateValue;
  public untilDate: DateValue;
  private todayValue: number;
  public bulk: true;
  public notifyTarget: AlertTarget = {};
  public selectionMade: string;

  faCalendar = faCalendar;

  constructor(
    private walksService: WalksService,
    private memberLoginService: MemberLoginService,
    private walksNotificationService: WalkNotificationService,
    private display: WalkDisplayService,
    private displayDay: DisplayDayPipe,
    private displayDate: DisplayDatePipe,
    private displayDates: DisplayDatesPipe,
    private searchFilterPipe: SearchFilterPipe,
    private displayDateAndTime: DisplayDateAndTimePipe,
    private route: ActivatedRoute,
    private walksQueryService: WalksQueryService,
    private dateUtils: DateUtilsService,
    private notifierService: NotifierService,
    private broadcastService: BroadcastService<void>,
    private urlService: UrlService,
    private walkEventService: WalkEventService,
    private walksReferenceService: WalksReferenceService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkAddSlotsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.todayValue = this.dateUtils.momentNowNoTime().valueOf();
    const momentUntil = this.dateUtils.momentNowNoTime().day(7 * 12);
    this.untilDate = this.dateUtils.asDateValue(momentUntil.valueOf());
    this.singleDate = this.dateUtils.asDateValue(this.todayValue);
    this.bulk = true;
  }

  validDate(date: DateValue) {
    return this.dateUtils.isDate(date?.value);
  }

  createSlots(requiredSlots: number[], message: AlertMessage) {
    this.requiredWalkSlots = requiredSlots.map(date => {
      const walk: Walk = {
        walkDate: date,
        ramblersPublish: true,
        events: []
      };
      walk.events = [this.walkEventService.createEventIfRequired(walk,
        this.walksReferenceService.walkEventTypeMappings.awaitingLeader.eventType, "Walk slot created")];
      return walk;
    });
    this.logger.debug("requiredWalkSlots", this.requiredWalkSlots);
    this.notify.clearBusy();
    if (this.requiredWalkSlots.length > 0) {
      this.confirmAction = true;
      this.notify.warning(message);
    } else {
      this.notify.warning({
        title: "Nothing to do!",
        message: "All slots are already created between today and " + this.displayDate.transform(this.untilDate)
      });
      delete this.confirmAction;
    }

  }

  addWalkSlots() {
    this.notify.setBusy();
    this.notify.hide();
    this.walksService.all({criteria: {walkDate: {$gte: this.todayValue}}, select: {events: 1, walkDate: 1}, sort: {walkDate: 1}})
      .then((walks: Walk[]) => this.walksQueryService.activeWalks(walks))
      .then((walks: Walk[]) => {
        this.notify.clearBusy();
        const sunday = this.dateUtils.momentNowNoTime().day(7);
        const until = this.dateUtils.asMoment(this.untilDate).startOf("day");
        const weeks = until.clone().diff(sunday, "weeks");
        const allGeneratedSlots = times(weeks, (index) => {
          return this.dateUtils.asValueNoTime(sunday.clone().add(index, "week"));
        }).filter((date) => {
          return this.dateUtils.asString(date, undefined, "DD-MMM") !== "25-Dec";
        });
        const existingDates = map(this.walksQueryService.activeWalks(walks), "walkDate");
        this.logger.debug("sunday", sunday, "until", until, "weeks", weeks);
        this.logger.debug("existingDatesAsDates", existingDates.map(date => this.displayDateAndTime.transform(date)));
        this.logger.debug("allGeneratedSlotsAsDates", allGeneratedSlots.map(date => this.displayDateAndTime.transform(date)));
        const requiredSlots = difference(allGeneratedSlots, existingDates);
        const requiredDates = this.displayDates.transform(requiredSlots);
        this.createSlots(requiredSlots, {
          title: "Add walk slots",
          message: " - You are about to add " + requiredSlots.length + " walk slots up to "
            + this.displayDate.transform(this.untilDate) + ". Slots are: " + requiredDates
        });
      });
  }

  addWalkSlot() {
    this.notify.setBusy();
    this.notify.hide();
    this.walksService.all({
      criteria: {walkDate: {$eq: this.dateUtils.asValueNoTime(this.singleDate.value)}},
      select: {events: 1, walkDate: 1},
      sort: {walkDate: 1}
    })
      .then(walks => this.walksQueryService.activeWalks(walks))
      .then(walks => {
        this.notify.clearBusy();
        if (walks.length === 0) {
          this.createSlots([this.dateUtils.asValueNoTime(this.singleDate.value)], {
            title: "Add walk slots",
            message: " - You are about to add a walk slot for " + this.displayDate.transform(this.singleDate)
          });
        } else {
          this.notify.warning({
            title: "Nothing to do!",
            message: walks.length + " slot(s) are already created for " + this.displayDate.transform(this.singleDate)
          });
        }
      });

  }

  selectBulk(bulk) {
    this.bulk = bulk;
    this.selectionMade = bulk.toString();
    delete this.confirmAction;
    this.notify.hide();
  }

  allowAddSlot() {
    return !this.confirmAction && !this.bulk && this.memberLoginService.allowWalkAdminEdits();
  }

  allowAddSlots() {
    return !this.confirmAction && this.bulk && this.memberLoginService.allowWalkAdminEdits();
  }

  allowClose() {
    return !this.confirmAction;
  }

  cancelConfirmableAction() {
    delete this.confirmAction;
    this.notify.hide();
  }

  confirmAddWalkSlots() {
    this.notify.success({
      title: "Add walk slots - ", message: "now creating " + this.requiredWalkSlots.length
        + " empty walk slots up to " + this.displayDate.transform(this.untilDate)
    });
    Promise.all(this.requiredWalkSlots.map((slot: Walk) => {
      return this.walksService.createOrUpdate(slot);
    })).then(() => {
      this.notify.success({title: "Done!", message: "Choose Back to walks to see your newly created slots"});
      delete this.confirmAction;
      this.broadcastService.broadcast(NamedEventType.WALK_SLOTS_CREATED);
    });
  }

  backToWalks() {
    this.urlService.navigateTo("walks");
  }

  onUntilDateChange(date: DateValue) {
    this.logger.info("onUntilDateChange:date", date);
    this.untilDate = date;
  }

  onSingleDateChange(date: DateValue) {
    this.logger.info("onSingleDateChange:date", date);
    this.singleDate = date;
  }

}