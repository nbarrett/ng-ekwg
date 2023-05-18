import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { first } from "lodash-es";
import findWhere from "lodash-es/find";
import isEmpty from "lodash-es/isEmpty";
import without from "lodash-es/without";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { DataQueryOptions } from "../../models/api-request.model";
import { ApiResponse } from "../../models/api-response.model";
import { Member } from "../../models/member.model";
import { RamblersWalkResponse, RamblersWalksApiResponse, RamblersWalksUploadRequest, WalkUploadColumnHeading, WalkUploadRow } from "../../models/ramblers-gwem";
import { RamblersUploadAuditApiResponse } from "../../models/ramblers-upload-audit.model";
import { Walk, WalkExport } from "../../models/walk.model";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { CommitteeConfigService } from "../committee/commitee-config.service";
import { CommitteeReferenceData } from "../committee/committee-reference-data";
import { CommonDataService } from "../common-data-service";
import { DateUtilsService } from "../date-utils.service";
import { enumValues } from "../enums";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { UrlService } from "../url.service";
import { WalksService } from "./walks.service";

@Injectable({
  providedIn: "root"
})
export class RamblersWalksAndEventsService {
  GWEM_DATE_FORMAT = "DD-MM-YYYY";
  WALKS_MANAGER_DATE_FORMAT = "DD/MM/YYYY";

  private BASE_URL = "/api/ramblers/gwem";
  private logger: Logger;
  private auditNotifications = new Subject<RamblersUploadAuditApiResponse>();
  private walkNotifications = new Subject<RamblersWalksApiResponse>();
  private committeeReferenceData: CommitteeReferenceData;
  public ramblersWalkBaseUrl: string;

  constructor(private http: HttpClient,
              private walksService: WalksService,
              private urlService: UrlService,
              private dateUtils: DateUtilsService,
              private displayDate: DisplayDatePipe,
              private memberLoginService: MemberLoginService,
              private commonDataService: CommonDataService,
              committeeConfig: CommitteeConfigService,
              loggerFactory: LoggerFactory) {
    committeeConfig.events().subscribe(data => this.committeeReferenceData = data);
    this.logger = loggerFactory.createLogger(RamblersWalksAndEventsService, NgxLoggerLevel.OFF);
    this.refreshRamblersConfig();
  }

  refreshRamblersConfig() {
    this.walkBaseUrl().then((walkBaseUrl) => {
      this.ramblersWalkBaseUrl = walkBaseUrl.response.toString();
    });
  }

  notifications(): Observable<RamblersUploadAuditApiResponse> {
    return this.auditNotifications.asObservable();
  }

  all(dataQueryOptions?: DataQueryOptions): Promise<RamblersUploadAuditApiResponse> {
    const params = this.commonDataService.toHttpParams(dataQueryOptions);
    this.logger.debug("all:dataQueryOptions", dataQueryOptions, "params", params.toString());
    return this.commonDataService.responseFrom(this.logger, this.http.get<RamblersUploadAuditApiResponse>(`${this.BASE_URL}/all`, {params}), this.auditNotifications);
  }

  uploadRamblersWalks(data: RamblersWalksUploadRequest): Promise<ApiResponse> {
    return this.commonDataService.responseFrom(this.logger, this.http.post<RamblersUploadAuditApiResponse>(`${this.BASE_URL}/upload-walks`, data), this.auditNotifications);
  }

  async listRamblersWalks(): Promise<RamblersWalkResponse[]> {
    const apiResponse = await this.commonDataService.responseFrom(this.logger, this.http.get<RamblersWalksApiResponse>(`${this.BASE_URL}/list-walks`), this.walkNotifications);
    this.logger.debug("received", apiResponse);
    return apiResponse.response;
  }

  walkBaseUrl() {
    return this.commonDataService.responseFrom(this.logger, this.http.get<RamblersUploadAuditApiResponse>(`${this.BASE_URL}/walk-base-url`), this.auditNotifications);
  }

  exportWalksFileName(omitExtension?: boolean): string {
    return "walks-export-" + this.dateUtils.asMoment().format("DD-MMMM-YYYY-HH-mm") + (omitExtension ? "" : ".csv");
  }

  selectedExportableWalks(walkExports: WalkExport[]): WalkExport[] {
    return walkExports.filter(walkExport => walkExport.selected)
      .sort(walkExport => walkExport.walk.walkDate);
  }

  walkUploadRows(walkExports: WalkExport[], members: Member[]): WalkUploadRow[] {
    return this.selectedExportableWalks(walkExports).map(walkExport => walkExport.walk).map(walk => this.walkToUploadRow(walk, members));
  }

  createWalksForExportPrompt(walks): Promise<WalkExport[]> {
    return this.listRamblersWalks()
      .then(ramblersWalksResponses => this.updateWalksWithRamblersWalkData(ramblersWalksResponses, walks))
      .then(updatedWalks => this.returnWalksExport(updatedWalks));
  }

  updateWalksWithRamblersWalkData(ramblersWalksResponses: RamblersWalkResponse[], walks: Walk[]) {
    let unreferencedList = this.collectExistingRamblersIdsFrom(walks);
    this.logger.debug(unreferencedList.length, " existing ramblers walk(s) found", unreferencedList);
    const savePromises = [];
    ramblersWalksResponses.forEach(ramblersWalksResponse => {
      const foundWalk = walks.find(walk => this.dateUtils.asString(walk.walkDate, undefined, "dddd, Do MMMM YYYY") === ramblersWalksResponse.ramblersWalkDate);
      if (!foundWalk) {
        this.logger.debug("no match found for ramblersWalksResponse", ramblersWalksResponse);
      } else {
        unreferencedList = without(unreferencedList, ramblersWalksResponse.ramblersWalkId);
        if (foundWalk && foundWalk.ramblersWalkId !== ramblersWalksResponse.ramblersWalkId) {
          this.logger.debug("updating walk from", foundWalk.ramblersWalkId || "empty", "->", ramblersWalksResponse.ramblersWalkId, "on", this.displayDate.transform(foundWalk.walkDate));
          foundWalk.ramblersWalkId = ramblersWalksResponse.ramblersWalkId;
          savePromises.push(this.walksService.createOrUpdate(foundWalk));
        } else {
          this.logger.debug("no update required for walk", foundWalk.ramblersWalkId, foundWalk.walkDate, this.dateUtils.displayDay(foundWalk.walkDate));
        }
      }
    });

    if (unreferencedList.length > 0) {
      this.logger.debug("removing old ramblers walk(s)", unreferencedList, "from existing walks");
      unreferencedList.map(ramblersWalkId => {
        const walk = findWhere(walks, {ramblersWalkId});
        if (walk) {
          this.logger.debug("removing ramblers walk", walk.ramblersWalkId, "from walk on", this.displayDate.transform(walk.walkDate));
          walk.ramblersWalkId = "";
          savePromises.push(this.walksService.createOrUpdate(walk));
        }
      });
    }
    return Promise.all(savePromises).then(() => walks);
  }

  collectExistingRamblersIdsFrom(walks: Walk[]): string[] {
    return walks.filter(walk => walk.ramblersWalkId)
      .map(walk => walk.ramblersWalkId);
  }

  returnWalksExport(walks: Walk[]): WalkExport[] {
    const todayValue = this.dateUtils.momentNowNoTime().valueOf();
    return walks
      .filter(walk => (walk.walkDate >= todayValue) && walk.briefDescriptionAndStartPoint)
      .sort(walk => walk.walkDate)
      .map(walk => this.validateWalk(walk));
  }

  uploadToRamblers(walkExports: WalkExport[], members: Member[], notify): Promise<string> {
    notify.setBusy();
    this.logger.debug("sourceData", walkExports);
    const walkIdDeletionList: string[] = this.selectedExportableWalks(walkExports).map(walkExport => walkExport.walk)
      .filter(walk => walk.ramblersWalkId).map(walk => walk.ramblersWalkId);
    const rows = this.walkUploadRows(walkExports, members);
    const fileName = this.exportWalksFileName();
    const walksUploadRequest: RamblersWalksUploadRequest = {
      headings: this.walkUploadHeadings(),
      rows,
      fileName,
      walkIdDeletionList,
      ramblersUser: this.memberLoginService.loggedInMember().firstName
    };
    this.logger.debug("exporting", walksUploadRequest);
    notify.warning({
      title: "Ramblers walks upload",
      message: "Uploading " + rows.length + " walk(s) to Ramblers..."
    });
    return this.uploadRamblersWalks(walksUploadRequest)
      .then(response => {
        notify.warning({
          title: "Ramblers walks upload",
          message: "Upload of " + rows.length + " walk(s) to Ramblers has been submitted. Monitor the Walk upload audit tab for progress"
        });
        this.logger.debug("success response data", response);
        notify.clearBusy();
        return fileName;
      })
      .catch(response => {
        this.logger.debug("error response data", response);
        return notify.error({
          title: "Ramblers walks upload failed",
          message: response
        });
      });
  }

  private walkUploadHeadings() {
    return enumValues(WalkUploadColumnHeading);
  }

  validateWalk(walk: Walk): WalkExport {
    const validationMessages = [];
    if (isEmpty(walk)) {
      validationMessages.push("walk does not exist");
    } else {
      if (isEmpty(this.walkTitle(walk))) {
        validationMessages.push("title is missing");
      }
      if (isEmpty(this.walkDistanceMiles(walk))) {
        validationMessages.push("distance is missing");
      }
      if (isEmpty(walk.startTime)) {
        validationMessages.push("start time is missing");
      }
      if (this.walkStartTime(walk) === "Invalid date") {
        validationMessages.push("start time [" + walk.startTime + "] is invalid");
      }
      if (isEmpty(walk.grade)) {
        validationMessages.push("grade is missing");
      }
      if (isEmpty(walk.longerDescription)) {
        validationMessages.push("description is missing");
      }

      if (isEmpty(walk.postcode) && isEmpty(walk.gridReference)) {
        validationMessages.push("both postcode and grid reference are missing");
      }

      if (isEmpty(walk.contactId)) {
        const contactIdMessage = this.memberLoginService.allowWalkAdminEdits() ? "this can be supplied for this walk on Walk Leader tab" : "this will need to be setup for you by " + this.committeeReferenceData.contactUsField("walks", "fullName");
        validationMessages.push("walk leader has no Ramblers contact Id setup on their member record (" + contactIdMessage + ")");
      }
      if (isEmpty(walk.displayName) && isEmpty(walk.displayName)) {
        validationMessages.push("displayName for walk leader is missing");
      }
    }
    return {
      walk,
      validationMessages,
      publishedOnRamblers: walk && !isEmpty(walk.ramblersWalkId),
      selected: walk && walk.ramblersPublish && validationMessages.length === 0 && isEmpty(walk.ramblersWalkId)
    };
  }

  nearestTown(walk: Walk) {
    return walk.nearestTown ? "Nearest Town is " + walk.nearestTown : "";
  }

  walkTitle(walk: Walk) {
    const walkDescription = [];
    if (walk.briefDescriptionAndStartPoint) {
      walkDescription.push(walk.briefDescriptionAndStartPoint);
    }
    return walkDescription.map(this.replaceSpecialCharacters).join(". ");
  }

  walkDescription(walk: Walk) {
    return this.replaceSpecialCharacters(walk.longerDescription);
  }

  walkType(walk: Walk) {
    return walk.walkType || "Circular";
  }

  asString(value) {
    return value ? value : "";
  }

  contactDisplayName(walk: Walk) {
    return walk.displayName ? this.replaceSpecialCharacters(first(walk.displayName.split(" "))) : "";
  }

  contactIdLookup(walk: Walk, members: Member[]) {
    if (walk.contactId) {
      return walk.contactId;
    } else {
      const member = members.find(member => member.id === walk.walkLeaderMemberId);
      const returnValue = member && member.contactId;
      this.logger.debug("contactId: for walkLeaderMemberId", walk.walkLeaderMemberId, "->", returnValue);
      return returnValue;
    }
  }

  contactIdLookupAssemble(walk: Walk, members: Member[]) {
    return "Nick Barrett";
  }

  replaceSpecialCharacters(value) {
    return value ? value
      .replace("’", "")
      .replace("é", "e")
      .replace("â€™", "")
      .replace("â€¦", "…")
      .replace("â€“", "–")
      .replace("â€™", "’")
      .replace("â€œ", "“")
      .replace(/(\r\n|\n|\r)/gm, " ") : "";
  }

  walkDistanceMiles(walk) {
    return walk.distance ? String(parseFloat(walk.distance).toFixed(1)) : "";
  }

  walkStartTime(walk: Walk): string {
    return walk.startTime ? this.dateUtils.asString(this.dateUtils.startTime(walk), null, "HH:mm") : "";
  }

  walkFinishTime(walk) {
    return walk.startTime ? this.dateUtils.asString(this.dateUtils.startTime(walk) + this.dateUtils.durationForDistance(walk.distance), null, "HH:mm") : "";
  }

  walkGridReference(walk) {
    return walk.gridReference ? walk.gridReference : "";
  }

  walkPostcode(walk) {
    return walk.gridReference ? "" : walk.postcode ? walk.postcode : "";
  }

  walkDate(walk: Walk, format: string) {
    return this.dateUtils.asString(walk.walkDate, null, format);
  }

  walkLink(walk: Walk): string {
    return walk?.id ? this.urlService.linkUrl({area: "walks", id: walk.id}) : null;
  }

  ramblersLink(walk: Walk): string {
    return walk.ramblersWalkId && (this.ramblersWalkBaseUrl + walk.ramblersWalkId);
  }

  walkToUploadRow(walk, members: Member[]): WalkUploadRow {
    return this.walkToWalkUploadRow(walk, members);
  }

  walkToWalkUploadRow(walk, members: Member[]): WalkUploadRow {
    const csvRecord: WalkUploadRow = {};
    csvRecord[WalkUploadColumnHeading.DATE] = this.walkDate(walk, this.WALKS_MANAGER_DATE_FORMAT);
    csvRecord[WalkUploadColumnHeading.TITLE] = this.walkTitle(walk);
    csvRecord[WalkUploadColumnHeading.DESCRIPTION] = this.walkDescription(walk);
    csvRecord[WalkUploadColumnHeading.ADDITIONAL_DETAILS] = "";
    csvRecord[WalkUploadColumnHeading.WEBSITE_LINK] = this.walkLink(walk);
    csvRecord[WalkUploadColumnHeading.WALK_LEADERS] = this.contactIdLookupAssemble(walk, members);
    csvRecord[WalkUploadColumnHeading.LINEAR_OR_CIRCULAR] = this.walkType(walk);
    csvRecord[WalkUploadColumnHeading.START_TIME] = this.walkStartTime(walk);
    csvRecord[WalkUploadColumnHeading.STARTING_LOCATION] = "";
    csvRecord[WalkUploadColumnHeading.STARTING_POSTCODE] = this.walkPostcode(walk);
    csvRecord[WalkUploadColumnHeading.STARTING_GRIDREF] = this.walkGridReference(walk);
    csvRecord[WalkUploadColumnHeading.STARTING_LOCATION_DETAILS] = this.nearestTown(walk);
    csvRecord[WalkUploadColumnHeading.MEETING_TIME] = "";
    csvRecord[WalkUploadColumnHeading.MEETING_LOCATION] = "";
    csvRecord[WalkUploadColumnHeading.MEETING_POSTCODE] = "";
    csvRecord[WalkUploadColumnHeading.MEETING_GRIDREF] = "";
    csvRecord[WalkUploadColumnHeading.MEETING_LOCATION_DETAILS] = "";
    csvRecord[WalkUploadColumnHeading.EST_FINISH_TIME] = this.walkFinishTime(walk);
    csvRecord[WalkUploadColumnHeading.FINISHING_LOCATION] = "";
    csvRecord[WalkUploadColumnHeading.FINISHING_POSTCODE] = "";
    csvRecord[WalkUploadColumnHeading.FINISHING_GRIDREF] = "";
    csvRecord[WalkUploadColumnHeading.FINISHING_LOCATION_DETAILS] = "";
    csvRecord[WalkUploadColumnHeading.DIFFICULTY] = this.asString(walk.grade);
    csvRecord[WalkUploadColumnHeading.DISTANCE_KM] = "";
    csvRecord[WalkUploadColumnHeading.DISTANCE_MILES] = this.walkDistanceMiles(walk);
    csvRecord[WalkUploadColumnHeading.ASCENT_METRES] = "";
    csvRecord[WalkUploadColumnHeading.ASCENT_FEET] = "";
    csvRecord[WalkUploadColumnHeading.DOG_FRIENDLY] = "";
    csvRecord[WalkUploadColumnHeading.INTRODUCTORY_WALK] = "";
    csvRecord[WalkUploadColumnHeading.NO_STILES] = "";
    csvRecord[WalkUploadColumnHeading.FAMILY_FRIENDLY] = "";
    csvRecord[WalkUploadColumnHeading.WHEELCHAIR_ACCESSIBLE] = "";
    csvRecord[WalkUploadColumnHeading.ACCESSIBLE_BY_PUBLIC_TRANSPORT] = "";
    csvRecord[WalkUploadColumnHeading.CAR_PARKING_AVAILABLE] = "";
    csvRecord[WalkUploadColumnHeading.CAR_SHARING_AVAILABLE] = "";
    csvRecord[WalkUploadColumnHeading.COACH_TRIP] = "";
    csvRecord[WalkUploadColumnHeading.REFRESHMENTS_AVAILABLE_PUB_CAFE] = "";
    csvRecord[WalkUploadColumnHeading.TOILETS_AVAILABLE] = "";
    return csvRecord;
  }

}
