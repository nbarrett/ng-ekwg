import { Injectable } from "@angular/core";
import { first } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { chain } from "../../functions/chain";
import { CommitteeFile, CommitteeMember, CommitteeYear, GroupEvent, GroupEventsFilter } from "../../models/committee.model";
import { CommitteeDisplayService } from "../../pages/committee/committee-display.service";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { descending, sortBy } from "../arrays";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { SocialEventsService } from "../social-events/social-events.service";
import { UrlService } from "../url.service";
import { WalksQueryService } from "../walks/walks-query.service";
import { WalksService } from "../walks/walks.service";
import { CommitteeConfigService } from "./commitee-config.service";
import { CommitteeFileService } from "./committee-file.service";
import { CommitteeReferenceData } from "./committee-reference-data";

@Injectable({
  providedIn: "root"
})

export class CommitteeQueryService {
  private logger: Logger;
  private committeeReferenceData: CommitteeReferenceData;

  constructor(
    private dateUtils: DateUtilsService,
    private walksService: WalksService,
    private walksQueryService: WalksQueryService,
    private committeeFileService: CommitteeFileService,
    private committeeDisplayService: CommitteeDisplayService,
    private socialEventsService: SocialEventsService,
    private memberLoginService: MemberLoginService,
    private displayDatePipe: DisplayDatePipe,
    private urlService: UrlService,
    committeeConfig: CommitteeConfigService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeQueryService, NgxLoggerLevel.OFF);
    committeeConfig.events().subscribe(data => this.committeeReferenceData = data);
  }

  groupEvents(groupEventsFilter: GroupEventsFilter): Promise<GroupEvent[]> {
    this.logger.debug("groupEventsFilter", groupEventsFilter);
    const fromDate = groupEventsFilter.fromDate.value;
    const toDate = groupEventsFilter.toDate.value;
    this.logger.info("groupEventsFilter:fromDate", this.displayDatePipe.transform(fromDate), "toDate", this.displayDatePipe.transform(toDate));
    const events: GroupEvent[] = [];
    const promises = [];
    const committeeContactDetails: CommitteeMember = this.committeeReferenceData.committeeMembersForRole("secretary")[0];
    if (groupEventsFilter.includeWalks) {
      promises.push(
        this.walksService.all({criteria: {walkDate: {$gte: fromDate, $lte: toDate}}})
          .then(walks => this.walksQueryService.activeWalks(walks))
          .then(walks => walks.forEach(walk => events.push({
            id: walk.id,
            selected: true,
            eventType: "Walk",
            area: "walks",
            eventDate: walk.walkDate,
            eventTime: walk.startTime,
            distance: walk.distance,
            postcode: walk.postcode,
            title: walk.briefDescriptionAndStartPoint || "Awaiting walk details",
            description: walk.longerDescription,
            contactName: walk.displayName || "Awaiting walk leader",
            contactPhone: walk.contactPhone,
            contactEmail: walk.contactEmail
          }))));
    }
    if (groupEventsFilter.includeCommitteeEvents) {
      promises.push(
        this.committeeFileService.all({criteria: {eventDate: {$gte: fromDate, $lte: toDate}}})
          .then(committeeFiles => committeeFiles.forEach(committeeFile => events.push({
            id: committeeFile.id,
            selected: true,
            eventType: "AGM & Committee",
            area: "committee",
            eventDate: committeeFile.eventDate,
            postcode: committeeFile.postcode,
            description: committeeFile.fileType,
            title: this.committeeDisplayService.fileTitle(committeeFile),
            contactName: committeeContactDetails.fullName,
            contactEmail: committeeContactDetails.email
          }))));
    }
    if (groupEventsFilter.includeSocialEvents) {
      promises.push(
        this.socialEventsService.all({criteria: {eventDate: {$gte: fromDate, $lte: toDate}}})
          .then(socialEvents => socialEvents.forEach(socialEvent => events.push({
            id: socialEvent.id,
            selected: true,
            eventType: "Social Event",
            area: "social",
            eventDate: socialEvent.eventDate,
            eventTime: socialEvent.eventTimeStart,
            postcode: socialEvent.postcode,
            title: socialEvent.briefDescription,
            description: socialEvent.longerDescription,
            contactName: socialEvent.displayName,
            contactPhone: socialEvent.contactPhone,
            contactEmail: socialEvent.contactEmail
          }))));
    }

    return Promise.all(promises).then(() => {
      this.logger.info("performed total of", promises.length, "events types containing total of", events.length, "events:", events);
      return events.sort(sortBy("eventDate"));
    });
  }

  committeeFilesLatestFirst(committeeFiles) {
    return committeeFiles.sort(sortBy("-eventDate"));
  }

  latestYear(committeeFiles): number {
    return this.extractYear(first(this.committeeFilesLatestFirst(committeeFiles)));
  }

  committeeFilesForYear(year, committeeFiles): CommitteeFile[] {
    const latestYearValue = this.latestYear(committeeFiles);
    return this.committeeFilesLatestFirst(committeeFiles).filter(committeeFile => {
      const fileYear = this.extractYear(committeeFile);
      this.logger.debug("fileYear", fileYear, "committeeFile", committeeFile);
      return (fileYear === year) || (isNaN(fileYear) && (latestYearValue === year));
    });
  }

  extractYear(committeeFile: CommitteeFile): number {
    return parseInt(this.dateUtils.asString(committeeFile.eventDate, undefined, "YYYY"), 10);
  }

  addLatestYearFlag(committeeFileYear, latestYearValue: number): CommitteeYear {
    return {year: committeeFileYear, latestYear: latestYearValue === committeeFileYear};
  }

  committeeFileYears(committeeFiles): CommitteeYear[] {
    const latestYearValue = this.latestYear(committeeFiles);
    this.logger.info("latestYearValue", latestYearValue);
    const years = chain(committeeFiles)
      .map(file => this.extractYear(file))
      .filter(year => !isNaN(year))
      .unique()
      .map(item => this.addLatestYearFlag(item, latestYearValue))
      .value()
      .sort(descending());
    this.logger.info("committeeFileYears", years);
    return years.length === 0 ? [{year: this.latestYear(committeeFiles), latestYear: true}] : years;
  }

}
