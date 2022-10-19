import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import range from "lodash-es/range";
import { PageChangedEvent } from "ngx-bootstrap/pagination";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { ApiAction } from "../../../models/api-response.model";
import { FilterParameters, SocialEvent, SocialEventApiResponse } from "../../../models/social-events.model";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { ApiResponseProcessor } from "../../../services/api-response-processor.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { SocialEventsService } from "../../../services/social-events/social-events.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";
import { SocialDisplayService } from "../social-display.service";

@Component({
  selector: "app-social-home",
  templateUrl: "./social-home.component.html",
  styleUrls: ["./social-home.component.sass"]
})
export class SocialHomeComponent implements OnInit {
  private subscription: Subscription;
  private searchChangeObservable: Subject<string>;
  private logger: Logger;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public socialEventId: string;
  public filterParameters: FilterParameters = {fieldSort: 1, quickSearch: "", selectType: 1};
  private pageSize: number;
  public pageNumber: number;
  public pageCount: number;
  public pages: number[] = [];
  public socialEvents: SocialEvent[] = [];
  public filteredSocialEvents: SocialEvent[] = [];
  public currentPageSocials: SocialEvent[] = [];
  showSearch: false;

  constructor(private authService: AuthService,
              private stringUtils: StringUtilsService,
              private searchFilterPipe: SearchFilterPipe,
              private notifierService: NotifierService,
              public display: SocialDisplayService,
              private apiResponseProcessor: ApiResponseProcessor,
              private route: ActivatedRoute,
              private socialEventsService: SocialEventsService,
              private siteEditService: SiteEditService,
              private memberLoginService: MemberLoginService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialHomeComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit started");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const socialEventId = paramMap.get("relativePath");
      this.logger.debug("socialEventId from route params:", paramMap, socialEventId);
      if (socialEventId) {
        this.socialEventId = socialEventId;
      }
    });
    this.notify.success({
      title: "Finding social events",
      message: "please wait..."
    });
    this.refreshSocialEvents();
    this.searchChangeObservable = new Subject<string>();
    this.searchChangeObservable.pipe(debounceTime(1000))
      .pipe(distinctUntilChanged())
      .subscribe(searchTerm => this.applyFilterToSocialEvents(searchTerm));
    this.subscription = this.socialEventsService.notifications().subscribe((apiResponse: SocialEventApiResponse) => {
      this.logger.info("received apiResponse:", apiResponse);
      if (apiResponse.error) {
        this.logger.warn("received error:", apiResponse.error);
        this.notify.error({
          title: "Problem viewing Social Events",
          message: "Refresh this page to clear this message."
        });
      } else if (this.display.confirm.notificationsOutstanding()) {
        this.logger.debug("Not processing subscription response due to confirm:", this.display.confirm.type);
      } else {
        const socialEvents: SocialEvent[] = this.apiResponseProcessor.processResponse(this.logger, this.socialEvents, apiResponse);
        if (apiResponse.action === ApiAction.QUERY && !!this.socialEventId) {
          this.notify.warning({
            title: "Single Social Event being viewed",
            message: "Refresh this page to return to normal view."
          });
        }
        this.display.confirm.clear();
        this.socialEvents = socialEvents;
        this.logger.info("received socialEvents:", socialEvents);
        this.applyFilterToSocialEvents();
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

  todayValue(): number {
    return this.dateUtils.momentNowNoTime().valueOf();
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

  private verifyReady() {
    if (this.display.memberFilterSelections?.length > 0 && this.socialEvents?.length > 0) {
      this.notify.clearBusy();
    }
  }

  pageChanged(event: PageChangedEvent): void {
    this.logger.debug("event:", event);
    this.goToPage(event.page);
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

  paginate(walks: SocialEvent[], pageSize, pageNumber): SocialEvent[] {
    return walks.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  private applyPagination() {
    this.currentPageSocials = this.paginate(this.filteredSocialEvents, this.pageSize, this.pageNumber);
    this.pages = range(1, this.pageCount + 1);
    this.logger.info("total social event count", this.socialEvents.length, "filteredSocialEvents count", this.filteredSocialEvents.length, "currentPageSocials count", this.currentPageSocials.length, "pageSize:", this.pageSize, "pageCount", this.pageCount, "pages", this.pages);
    const offset = (this.pageNumber - 1) * this.pageSize + 1;
    const pageIndicator = this.pages.length > 1 ? `page ${this.pageNumber} of ${this.pageCount}` : "";
    this.notify.progress(`Showing ${offset} to ${offset + this.pageSize - 1} of ${this.stringUtils.pluraliseWithCount(this.socialEvents.length, "social event")} ${pageIndicator}`);
  }

}
