import { Injectable } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { first } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { share } from "rxjs/operators";
import { chain } from "../../functions/chain";
import { GroupEvent } from "../../models/committee.model";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { sortBy } from "../arrays";
import { CommitteeConfigService } from "../commitee-config.service";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { AlertInstance } from "../notifier.service";
import { SocialEventsService } from "../social-events/social-events.service";
import { UrlService } from "../url.service";
import { WalksService } from "../walks/walks.service";
import { CommitteeFileService } from "./committee-file.service";
import { CommitteeReferenceDataService } from "./committee-reference-data.service";

@Injectable({
  providedIn: "root"
})

export class CommitteeQueryService {
  private logger: Logger;

  constructor(
    private route: ActivatedRoute,
    private dateUtils: DateUtilsService,
    private walksService: WalksService,
    private committeeReferenceData: CommitteeReferenceDataService,
    private committeeFileService: CommitteeFileService,
    private socialEventsService: SocialEventsService,
    private memberLoginService: MemberLoginService,
    private displayDatePipe: DisplayDatePipe,
    private urlService: UrlService,
    private committeeConfig: CommitteeConfigService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeQueryService, NgxLoggerLevel.OFF);
  }

  groupEvents(groupEvents): Promise<GroupEvent[]> {
    this.logger.debug("groupEvents", groupEvents);
    const fromDate = this.dateUtils.convertDateField(groupEvents.fromDate);
    const toDate = this.dateUtils.convertDateField(groupEvents.toDate);
    this.logger.debug("groupEvents:fromDate", this.displayDatePipe.transform(fromDate), "toDate", this.displayDatePipe.transform(toDate));
    const events = [];
    const promises = [];
    if (groupEvents.includeWalks) {
      promises.push(
        this.walksService.all({criteria: {walkDate: {$gte: fromDate, $lte: toDate}}})
          .then(walks => walks.forEach(walk => events.push({
            id: walk.id,
            selected: true,
            eventType: "Walk",
            area: "walks",
            type: "walk",
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
    if (groupEvents.includeCommitteeEvents) {
      promises.push(
        this.committeeFileService.all({criteria: {eventDate: {$gte: fromDate, $lte: toDate}}})
          .then(committeeFiles => committeeFiles.forEach(committeeFile => events.push({
            id: committeeFile.id,
            selected: true,
            eventType: "AGM & Committee",
            area: "committee",
            type: "committeeFile",
            eventDate: committeeFile.eventDate,
            postcode: committeeFile.postcode,
            description: committeeFile.fileType,
            title: committeeFile.fileNameData.title
          }))));
    }
    if (groupEvents.includeSocialEvents) {
      promises.push(
        this.socialEventsService.all({criteria: {eventDate: {$gte: fromDate, $lte: toDate}}})
          .then(socialEvents => socialEvents.forEach(socialEvent => events.push({
            id: socialEvent.id,
            selected: true,
            eventType: "Social Event",
            area: "social",
            type: "socialEvent",
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
      this.logger.debug("performed total of", promises.length, "events of length", events.length);
      return chain(events)
        .sortBy("eventDate")
        .value();
    });
  }

  committeeFilesLatestFirst(committeeFiles) {
    return committeeFiles.sort(sortBy("-eventDate"));
  }

  latestYear(committeeFiles): string {
    return first(
      this.committeeFilesLatestFirst(committeeFiles)
        .map(item => parseInt(this.dateUtils.asString(item.eventDate, undefined, "YYYY"), 10)));
  }

  committeeFilesForYear(year, committeeFiles) {
    const latestYearValue = this.latestYear(committeeFiles);
    return this.committeeFilesLatestFirst(committeeFiles).filter(committeeFile => {
      const fileYear = this.extractYear(committeeFile);
      return (fileYear === year) || (!fileYear && (latestYearValue === year));
    });
  }

  extractYear(committeeFile) {
    return parseInt(this.dateUtils.asString(committeeFile.eventDate, undefined, "YYYY"), 10);
  }

  addLatestYearFlag(committeeFileYear, latestYearValue) {
    return {year: committeeFileYear, latestYear: latestYearValue === committeeFileYear};
  }

  committeeFileYears(committeeFiles) {

    const latestYearValue = this.latestYear(committeeFiles);

    const years = chain(committeeFiles)
      .map(this.extractYear)
      .unique()
      .sortBy()
      .map(item => this.addLatestYearFlag(item, latestYearValue))
      .value()
      .reverse();
    this.logger.debug("committeeFileYears", years);
    return years.length === 0 ? [{year: this.latestYear(committeeFiles), latestYear: true}] : years;
  }

  queryCommitteeFiles(notify) {
    const shared = this.route.paramMap.pipe(share());
    return shared.toPromise().then((paramMap: ParamMap) => {
      const committeeFileId = paramMap.get("committeeFileId");
      this.logger.debug("committeeFileId from route params:", committeeFileId);
      if (committeeFileId) {
        return this.committeeFileService.getById(committeeFileId)
          .then(committeeFile => {
            if (!committeeFile) {
              notify.error("Committee file could not be found. Try opening again from the link in the notification email");
            }
            return [committeeFile];
          });
      } else {
        return this.committeeFileService.all().then(files => this.filterCommitteeFiles(files));
      }
    });
  }

  committeeFiles(notify: AlertInstance) {
    notify.progress("Refreshing Committee files...");

    return this.queryCommitteeFiles(notify);
  }

  filterCommitteeFiles(files: any[]) {
    this.logger.info("filterCommitteeFiles files ->", files);
    const filteredFiles = files.filter(file => this.committeeReferenceData.isPublic(file.fileType) || this.memberLoginService.allowCommittee() || this.memberLoginService.allowFileAdmin());
    this.logger.debug("filterCommitteeFiles in ->", files && files.length, "out ->", filteredFiles.length, "fileTypes", this.committeeReferenceData.fileTypes());
    return filteredFiles;
  }

}
