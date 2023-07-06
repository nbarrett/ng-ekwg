import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import isEmpty from "lodash-es/isEmpty";
import isNumber from "lodash-es/isNumber";
import without from "lodash-es/without";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { DataQueryOptions } from "../../models/api-request.model";
import { ApiResponse } from "../../models/api-response.model";
import { Member } from "../../models/member.model";
import { RamblersUploadAuditApiResponse } from "../../models/ramblers-upload-audit.model";
import { RamblersWalkResponse, RamblersWalksApiResponse, RamblersWalksUploadRequest, WalkUploadColumnHeading, WalkUploadRow } from "../../models/ramblers-walks-manager";
import { Ramblers } from "../../models/system.model";
import { Walk, WalkExport, WalkType } from "../../models/walk.model";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { CommitteeConfigService } from "../committee/commitee-config.service";
import { CommitteeReferenceData } from "../committee/committee-reference-data";
import { CommonDataService } from "../common-data-service";
import { DateUtilsService } from "../date-utils.service";
import { enumValues } from "../enums";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { StringUtilsService } from "../string-utils.service";
import { SystemConfigService } from "../system/system-config.service";
import { UrlService } from "../url.service";
import { WalksService } from "./walks.service";

@Injectable({
  providedIn: "root"
})
export class RamblersWalksAndEventsService {
  WALKS_MANAGER_DATE_FORMAT = "DD/MM/YYYY";

  private BASE_URL = "/api/ramblers/walks-manager";
  private readonly logger: Logger;
  private auditNotifications = new Subject<RamblersUploadAuditApiResponse>();
  private walkNotifications = new Subject<RamblersWalksApiResponse>();
  private committeeReferenceData: CommitteeReferenceData;
  private ramblers: Ramblers;

  constructor(private http: HttpClient,
              private systemConfigService: SystemConfigService,
              private walksService: WalksService,
              private urlService: UrlService,
              private stringUtilsService: StringUtilsService,
              private dateUtils: DateUtilsService,
              private displayDate: DisplayDatePipe,
              private memberLoginService: MemberLoginService,
              private commonDataService: CommonDataService,
              committeeConfig: CommitteeConfigService,
              loggerFactory: LoggerFactory) {
    committeeConfig.events().subscribe(data => this.committeeReferenceData = data);
    this.logger = loggerFactory.createLogger("RamblersWalksAndEventsService", NgxLoggerLevel.OFF);
    this.systemConfigService.events().subscribe(item => {
      this.ramblers = item.national;
      this.logger.info("systemConfigService:ramblers:", this.ramblers, "item.system", item);
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
    this.logger.info("received", apiResponse);
    return apiResponse.response;
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
    let unreferencedUrls: string[] = this.collectExistingRamblersUrlsFrom(walks);
    this.logger.info(this.stringUtilsService.pluraliseWithCount(unreferencedUrls.length, "existing ramblers walk url"), "found:", unreferencedUrls);
    this.logger.info(this.stringUtilsService.pluraliseWithCount(walks.length, "saved walk"), "found:", walks);
    const savePromises = [];
    ramblersWalksResponses.forEach((ramblersWalksResponse: RamblersWalkResponse) => {
      const walkMatchedByDate = walks.find(walk => this.dateUtils.asString(walk.walkDate, undefined, "dddd, Do MMMM YYYY") === ramblersWalksResponse.startDate);
      if (!walkMatchedByDate) {
        this.logger.info("no date match found for ramblersWalksResponse", ramblersWalksResponse);
      } else {
        unreferencedUrls = without(unreferencedUrls, ramblersWalksResponse.url);
        if (walkMatchedByDate && this.matchByIdOrUrl(walkMatchedByDate, ramblersWalksResponse)) {
          this.logger.info("updating walk from", walkMatchedByDate.ramblersWalkId || "empty", "->", ramblersWalksResponse.id, "and", walkMatchedByDate.ramblersWalkUrl || "empty", "->", ramblersWalksResponse.url, "on", this.displayDate.transform(walkMatchedByDate.walkDate));
          walkMatchedByDate.ramblersWalkId = ramblersWalksResponse.id;
          walkMatchedByDate.ramblersWalkUrl = ramblersWalksResponse.url;
          walkMatchedByDate.startLocationW3w = ramblersWalksResponse.startLocationW3w;
          savePromises.push(this.walksService.createOrUpdate(walkMatchedByDate));
          this.logger.info("walk updated to:", walkMatchedByDate);
        } else {
          this.logger.info("no update required for walk", walkMatchedByDate.id, walkMatchedByDate.walkDate, this.dateUtils.displayDay(walkMatchedByDate.walkDate));
        }
      }
    });

    if (unreferencedUrls.length > 0) {
      this.logger.info("removing", this.stringUtilsService.pluraliseWithCount(unreferencedUrls.length, "old ramblers walk"), unreferencedUrls, "from existing walks");
      unreferencedUrls.map((url: string) => {
        const walkMatchedByUrl: Walk = walks.find(walk => walk.ramblersWalkUrl === url);
        if (walkMatchedByUrl) {
          this.logger.info("removing ramblers walkMatchedByUrl", walkMatchedByUrl.ramblersWalkId, "from walkMatchedByUrl on", this.displayDate.transform(walkMatchedByUrl.walkDate));
          delete walkMatchedByUrl.ramblersWalkId;
          delete walkMatchedByUrl.ramblersWalkUrl;
          savePromises.push(this.walksService.createOrUpdate(walkMatchedByUrl));
        }
      });
    }
    return Promise.all(savePromises).then(() => walks);
  }

  private matchByIdOrUrl(walkMatchedByDate: Walk, ramblersWalksResponse: RamblersWalkResponse): boolean {
    return walkMatchedByDate.ramblersWalkUrl !== ramblersWalksResponse.url || walkMatchedByDate.ramblersWalkId !== ramblersWalksResponse.id;
  }

  collectExistingRamblersUrlsFrom(walks: Walk[]): string[] {
    return walks.filter(walk => walk.ramblersWalkUrl)
      .map(walk => walk.ramblersWalkUrl);
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
    const walkIdDeletionList = this.walkDeletionList(walkExports);
    this.logger.debug("sourceData", walkExports);
    const rows = this.walkUploadRows(walkExports, members);
    const fileName = this.exportWalksFileName();
    const walksUploadRequest: RamblersWalksUploadRequest = {
      headings: this.walkUploadHeadings(),
      rows,
      fileName,
      walkIdDeletionList,
      ramblersUser: this.memberLoginService.loggedInMember().firstName
    };
    this.logger.info("exporting", walksUploadRequest);
    notify.warning({
      title: "Ramblers walks upload",
      message: `Uploading ${this.stringUtilsService.pluraliseWithCount(rows.length, "walk")} to Ramblers...`
    });
    return this.uploadRamblersWalks(walksUploadRequest)
      .then(response => {
        notify.warning({
          title: "Ramblers walks upload",
          message: `Upload of ${this.stringUtilsService.pluraliseWithCount(rows.length, "walk")} to Ramblers has been submitted. Monitor the Walk upload audit tab for progress`
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

  public walkDeletionList(walkExports: WalkExport[]) {
    return this.selectedExportableWalks(walkExports).map(walkExport => walkExport.walk)
      .filter(walk => !isEmpty(walk.ramblersWalkUrl)).map(walk => this.transformUrl(walk));
  }

  private transformUrl(walk: Walk) {
    const transformed = walk.ramblersWalkUrl.replace(this.ramblers?.mainSite?.href, this.ramblers?.walksManager?.href);
    this.logger.info("transformUrl:ramblersWalkUrl:", walk.ramblersWalkUrl, "from:", this.ramblers?.mainSite?.href, "to:", this.ramblers?.walksManager?.href, "transformed:", transformed);
    return transformed;
  }

  private walkUploadHeadings() {
    return enumValues(WalkUploadColumnHeading);
  }

  validateWalk(walk: Walk): WalkExport {
    const validationMessages = [];
    const contactIdMessage = this.memberLoginService.allowWalkAdminEdits() ? "This can be supplied for this walk on Walk Leader tab" : "This will need to be setup for you by " + this.committeeReferenceData.contactUsField("walks", "fullName");
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
        validationMessages.push("Walk leader has no Ramblers Assemble Name entered on their member record. " + contactIdMessage);
      }

      if (isNumber(walk.contactId)) {
        validationMessages.push("Walk leader has an old Ramblers contact Id setup on their member record. This needs to be updated to an Assemble Ramblers Assemble Name." + contactIdMessage);
      }

      if (isEmpty(walk.walkType)) {
        validationMessages.push("Display Name for walk leader is missing. This can be entered manually on the Walk Leader tab");
      }

      if (walk.walkType === WalkType.LINEAR && isEmpty(walk.postcodeFinish)) {
        validationMessages.push(`Walk is ${WalkType.LINEAR} but no finish postcode has been entered in the Walk Details tab`);
      }

      if (walk.walkType === WalkType.CIRCULAR && !isEmpty(walk.postcodeFinish) && walk.postcodeFinish !== walk.postcode) {
        validationMessages.push(`Walk is ${WalkType.CIRCULAR} but the finish postcode ${walk.postcodeFinish} does not match the start postcode ${walk.postcode} in the Walk Details tab`);
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

  walkLeader(walk: Walk) {
    return walk.contactId ? this.replaceSpecialCharacters(walk.contactId) : "";
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

  walkStartGridReference(walk) {
    return walk.gridReference || "";
  }

  walkStartPostcode(walk) {
    return walk.gridReference ? "" : walk.postcode || "";
  }

  walkFinishGridReference(walk) {
    return walk.gridReferenceFinish || "";
  }

  walkFinishPostcode(walk) {
    return walk.gridReferenceFinish ? "" : walk.postcodeFinish || "";
  }

  walkDate(walk: Walk, format: string) {
    return this.dateUtils.asString(walk.walkDate, null, format);
  }

  walkLink(walk: Walk): string {
    return walk?.id ? this.urlService.linkUrl({area: "walks", id: walk.id}) : null;
  }

  ramblersLink(walk: Walk): string {
    return walk.ramblersWalkUrl || (walk.ramblersWalkId ? `https://www.ramblers.org.uk/go-walking/find-a-walk-or-route/walk-detail.aspx?walkID=${walk.ramblersWalkId}` : null);
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
    csvRecord[WalkUploadColumnHeading.WALK_LEADERS] = this.walkLeader(walk);
    csvRecord[WalkUploadColumnHeading.LINEAR_OR_CIRCULAR] = this.walkType(walk);
    csvRecord[WalkUploadColumnHeading.START_TIME] = this.walkStartTime(walk);
    csvRecord[WalkUploadColumnHeading.STARTING_LOCATION] = "";
    csvRecord[WalkUploadColumnHeading.STARTING_POSTCODE] = this.walkStartPostcode(walk);
    csvRecord[WalkUploadColumnHeading.STARTING_GRIDREF] = this.walkStartGridReference(walk);
    csvRecord[WalkUploadColumnHeading.STARTING_LOCATION_DETAILS] = this.nearestTown(walk);
    csvRecord[WalkUploadColumnHeading.MEETING_TIME] = "";
    csvRecord[WalkUploadColumnHeading.MEETING_LOCATION] = "";
    csvRecord[WalkUploadColumnHeading.MEETING_POSTCODE] = "";
    csvRecord[WalkUploadColumnHeading.MEETING_GRIDREF] = "";
    csvRecord[WalkUploadColumnHeading.MEETING_LOCATION_DETAILS] = "";
    csvRecord[WalkUploadColumnHeading.EST_FINISH_TIME] = this.walkFinishTime(walk);
    csvRecord[WalkUploadColumnHeading.FINISHING_LOCATION] = "";
    csvRecord[WalkUploadColumnHeading.FINISHING_POSTCODE] = this.walkFinishPostcode(walk);
    csvRecord[WalkUploadColumnHeading.FINISHING_GRIDREF] = this.walkFinishGridReference(walk);
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
