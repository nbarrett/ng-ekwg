import { Component, Input, OnInit } from "@angular/core";
import { cloneDeep, isNumber, isObject } from "lodash-es";
import { BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { ApiAction } from "../../../models/api-response.model";
import { MemberFilterSelection } from "../../../models/member.model";
import { FilterParameters, SocialEvent, SocialEventApiResponse, SocialEventsPermissions } from "../../../models/social-events.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { LineFeedsToBreaksPipe } from "../../../pipes/line-feeds-to-breaks.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { ApiResponseProcessor } from "../../../services/api-response-processor.service";
import { BroadcastService } from "../../../services/broadcast-service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { SocialEventsService } from "../../../services/social-events/social-events.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";
import { SocialEditModalComponent } from "../edit/social-edit-modal.component";
import { SocialDisplayService } from "../social-display.service";

@Component({
  selector: "app-social-list",
  templateUrl: "./social-list.component.html",
  styleUrls: ["./social-list.component.sass"]
})
export class SocialListComponent implements OnInit {
  private subscription: Subscription;
  private searchChangeObservable: Subject<string>;
  public filteredSocialEvents: SocialEvent[] = [];
  public socialEvents: SocialEvent[] = [];
  public notify: AlertInstance;
  private logger: Logger;
  public filterParameters: FilterParameters = {fieldSort: 1, quickSearch: "", selectType: 1};
  public memberFilterSelections: MemberFilterSelection[];

  constructor(private authService: AuthService,
              private stringUtils: StringUtilsService,
              private searchFilterPipe: SearchFilterPipe,
              private memberService: MemberService,
              private siteEditService: SiteEditService,
              private notifierService: NotifierService,
              private fullNameWithAlias: FullNameWithAliasPipe,
              private lineFeedsToBreaks: LineFeedsToBreaksPipe,
              private socialEventsService: SocialEventsService,
              private memberLoginService: MemberLoginService,
              public display: SocialDisplayService,
              private broadcastService: BroadcastService,
              private apiResponseProcessor: ApiResponseProcessor,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              private modalService: BsModalService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialListComponent, NgxLoggerLevel.OFF);
  }

  @Input()
  public allow: SocialEventsPermissions;
  @Input()
  public confirm: Confirm;
  @Input()
  public notifyTarget: AlertTarget;
  @Input()
  public socialEventId: string;

  ngOnInit() {
    this.authService.authResponse().subscribe(() => this.authChanges());
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.success({
      title: "Finding social events",
      message: "please wait..."
    });
    if (this.socialEventId) {
      this.logger.debug("socialEventId from route params:", this.socialEventId);
      this.socialEventsService.getById(this.socialEventId);
    } else {
      this.refreshSocialEvents();
    }
    this.searchChangeObservable = new Subject<string>();
    this.searchChangeObservable.pipe(debounceTime(1000))
      .pipe(distinctUntilChanged())
      .subscribe(searchTerm => this.applyFilterToSocialEvents(searchTerm));

    this.subscription = this.socialEventsService.notifications().subscribe((apiResponse: SocialEventApiResponse) => {
      if (apiResponse.error) {
        this.logger.warn("received error:", apiResponse.error);
        this.notify.error({
          title: "Problem viewing Social Events",
          message: "Refresh this page to clear this message."
        });
      } else if (this.confirm.notificationsOutstanding()) {
        this.logger.debug("Not processing subscription response due to confirm:", this.confirm.type);
      } else {
        const socialEvents: SocialEvent[] = this.apiResponseProcessor.processResponse(this.logger, this.socialEvents, apiResponse);
        if (apiResponse.action === ApiAction.QUERY && !!this.socialEventId) {
          this.notify.warning({
            title: "Single Social Event being viewed",
            message: "Refresh this page to return to normal view."
          });
        }
        this.confirm.clear();
        this.socialEvents = socialEvents;
        this.applyFilterToSocialEvents();
      }
    });
    this.authChanges();
  }

  todayValue(): number {
    return this.dateUtils.momentNowNoTime().valueOf();
  }

  private verifyReady() {
    if (this.memberFilterSelections?.length > 0 && this.socialEvents?.length > 0) {
      this.notify.clearBusy();
    }
  }

  applyFilterToSocialEvents(searchTerm?: string) {
    this.logger.debug("applyFilterToSocialEvents:searchTerm:", searchTerm, "filterParameters.quickSearch:", this.filterParameters.quickSearch);
    this.notify.setBusy();
    this.filteredSocialEvents = this.searchFilterPipe.transform(this.socialEvents, this.filterParameters.quickSearch);
    const filteredCount = (this.filteredSocialEvents?.length) || 0;
    const eventCount = (this.socialEvents?.length) || 0;
    this.notify.progress(`${filteredCount} of ${eventCount} social event${eventCount === 1 ? "" : "s"} shown`);
    this.notify.clearBusy();
    this.verifyReady();
  }

  private migrateEmptyEventDates(socialEvents: SocialEvent[]) {
    const invalidEvents: SocialEvent[] = socialEvents.filter((item) => {
      return !item.eventDate || !isNumber(item.eventDate) || isObject(item.eventDate);
    }).map((item, index) => {
      this.logger.debug(index, " - item.eventDate: ", item.eventDate);
      return item;
    });
    this.confirm.type = ConfirmType.APPROVE;
    this.logger.debug("invalidEvents", invalidEvents);
    invalidEvents.forEach(event => {
      event.eventDate = this.dateUtils.asMoment().startOf("day").subtract(1, "days").valueOf();
      this.logger.debug("fixed date is", this.dateUtils.displayDateAndTime(event.eventDate));
      this.socialEventsService.update(event);
    });
    Promise.all(socialEvents.filter(item => !item.eventDate || !isNumber(item.eventDate) || isObject(item.eventDate)).map(item => {
      this.logger.debug("old event: ", item);
      return ({...item, eventDate: this.todayValue()});
    }).map(item => {
      return item;
      // return this.socialEventsService.update(item);
    })).then(fixed => this.logger.debug("invalidEvents dates:", fixed));

  }

  private migrateAttachments(phase: string) {
    this.logger.debug("migrateAttachments: phase", phase);
    this.filteredSocialEvents.map(item => item as any).filter(item => item.attachment || item.attachmentTitle).map(event => cloneDeep(event)).forEach(event => {
      if (event.attachmentTitle && !event.attachment.title) {
        if (typeof event.attachment === "string") {
          this.logger.debug("Event needs migrating - attachment is string:", event.attachment, "attachmentTitle:", event.attachmentTitle);
          const attachment = {title: event.attachmentTitle, awsFileName: event.attachment, originalFileName: event.attachment};
          event.attachmentTitle = "";
          this.socialEventsService.update(event).then(event => {
            event.attachment = attachment;
            this.socialEventsService.update(event);
          });
        } else {
          this.logger.debug("Event needs migrating - attachment is object:", event.attachment, "attachmentTitle:", event.attachmentTitle);
          event.attachment.title = event.attachmentTitle;
          event.attachmentTitle = "";
          this.socialEventsService.update(event);
        }
      } else if (!event.attachment.title) {
        this.logger.debug("Event has no attachment title but in right format:", event.attachment);
      } else {
        this.logger.debug("Event already migrated - attachment:", event.attachment);
      }
    });
  }

  public refreshSocialEvents() {
    this.notify.setBusy();
    const dataQueryOptions = {criteria: this.criteria(), sort: this.sort()};
    this.logger.debug("refreshSocialEvents:dataQueryOptions", dataQueryOptions);
    if (this.memberLoginService.memberLoggedIn()) {
      this.socialEventsService.all(dataQueryOptions);
    } else {
      this.socialEventsService.allPublic(dataQueryOptions);
    }
  }

  criteria() {
    switch (Number(this.filterParameters.selectType)) {
      case 1:
        return {eventDate: {$gte: this.todayValue()}};
      case 2:
        return {eventDate: {$lt: this.todayValue()}};
      case 3:
        return {};
    }
  }

  sort() {
    return {eventDate: this.filterParameters.fieldSort};
  }

  socialEventTracker(index: number, socialEvent: SocialEvent) {
    return socialEvent.id;
  }

  addSocialEvent() {
    this.showSocialEventDialog({eventDate: this.todayValue(), attendees: []}, "Add New", this.allow, this.confirm);
  }

  viewSocialEvent(socialEvent) {
    this.showSocialEventDialog(socialEvent, "View", this.allow, this.confirm);
  }

  editSocialEvent(socialEvent) {
    this.showSocialEventDialog(socialEvent, "Edit Existing", this.allow, this.confirm);
  }

  showSocialEventDialog(socialEvent: SocialEvent, socialEventEditMode: string, allow: SocialEventsPermissions, confirm: Confirm) {
    confirm.clear();
    if (!socialEvent.attendees) {
      socialEvent.attendees = [];
    }

    const existingRecordEditEnabled = allow.edits && socialEventEditMode.startsWith("Edit");
    allow.copy = existingRecordEditEnabled;
    allow.delete = existingRecordEditEnabled;
    this.modalService.show(SocialEditModalComponent, this.display.createModalOptions({memberFilterSelections: this.memberFilterSelections, socialEvent, allow, confirm}));
  }

  allowSummaryView() {
    return (this.memberLoginService.allowSocialAdminEdits() || !this.memberLoginService.allowSocialDetailView());
  }

  showLoginTooltip() {
    return !this.memberLoginService.memberLoggedIn();
  }

  login() {
    if (!this.memberLoginService.memberLoggedIn()) {
      this.urlService.navigateTo("login");
    }
  }

  onSearchChange(searchEntry: string) {
    this.logger.debug("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);

  }

  private authChanges() {
    if (this.memberLoginService.memberLoggedIn()) {
      this.display.refreshSocialMemberFilterSelection()
        .then(members => {
          this.memberFilterSelections = members;
          this.verifyReady();
        });
    }
  }
}
