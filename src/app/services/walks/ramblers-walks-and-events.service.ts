import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { first } from "lodash-es";
import findWhere from "lodash-es/find";
import isEmpty from "lodash-es/isEmpty";
import without from "lodash-es/without";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { chain } from "../../functions/chain";
import { DataQueryOptions } from "../../models/api-request.model";
import { ApiResponse } from "../../models/api-response.model";
import { Member } from "../../models/member.model";
import { RamblersWalkResponse, RamblersWalksApiResponse, RamblersWalksUploadRequest, WalkUploadColumnHeadings, WalkUploadRow } from "../../models/ramblers-gwem";
import { RamblersUploadAuditApiResponse } from "../../models/ramblers-upload-audit.model";
import { Walk, WalkExport } from "../../models/walk.model";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { CommitteeConfigService } from "../committee/commitee-config.service";
import { CommitteeReferenceData } from "../committee/committee-reference-data";
import { CommonDataService } from "../common-data-service";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { WalksService } from "./walks.service";

@Injectable({
  providedIn: "root"
})
export class RamblersWalksAndEventsService {

  private BASE_URL = "/api/ramblers/gwem";
  private logger: Logger;
  private auditNotifications = new Subject<RamblersUploadAuditApiResponse>();
  private walkNotifications = new Subject<RamblersWalksApiResponse>();
  private committeeReferenceData: CommitteeReferenceData;

  constructor(private http: HttpClient,
              private walksService: WalksService,
              private dateUtils: DateUtilsService,
              private displayDate: DisplayDatePipe,
              private memberLoginService: MemberLoginService,
              private commonDataService: CommonDataService,
              committeeConfig: CommitteeConfigService,
              loggerFactory: LoggerFactory) {
    committeeConfig.events().subscribe(data => this.committeeReferenceData = data);
    this.logger = loggerFactory.createLogger(RamblersWalksAndEventsService, NgxLoggerLevel.OFF);
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

  exportableWalks(walkExports: WalkExport[]): WalkExport[] {
    return walkExports.filter(walkExport => walkExport.selected)
      .sort(walkExport => walkExport.walk.walkDate);
  }

  walkUploadRows(walkExports, members: Member[]): WalkUploadRow[] {
    return this.exportableWalks(walkExports).map(walkEport => walkEport.walk).map(walk => this.walkToCsvRecord(walk, members));
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

  uploadToRamblers(walkExports, members: Member[], notify): Promise<string> {
    notify.setBusy();
    this.logger.debug("sourceData", walkExports);
    const walkIdDeletionList: string[] = this.exportableWalks(walkExports).map(walkExport => walkExport.walk)
      .filter(walk => walk.ramblersWalkId).map(walk => walk.ramblersWalkId);
    const rows = this.walkUploadRows(walkExports, members);
    const fileName = this.exportWalksFileName();
    const walksUploadRequest: RamblersWalksUploadRequest = {
      headings: WalkUploadColumnHeadings,
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
    return chain(walkDescription).map(this.replaceSpecialCharacters).value().join(". ");
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

  walkStartTime(walk) {
    return walk.startTime ? this.dateUtils.asString(walk.startTime, "HH mm", "HH:mm") : "";
  }

  walkGridReference(walk) {
    return walk.gridReference ? walk.gridReference : "";
  }

  walkPostcode(walk) {
    return walk.gridReference ? "" : walk.postcode ? walk.postcode : "";
  }

  walkDate(walk) {
    return this.dateUtils.asString(walk.walkDate, undefined, "DD-MM-YYYY");
  }

  walkToCsvRecord(walk, members: Member[]): WalkUploadRow {
    return {
      Date: this.walkDate(walk),
      Title: this.walkTitle(walk),
      Description: this.walkDescription(walk),
      "Linear or Circular": this.walkType(walk),
      "Starting postcode": this.walkPostcode(walk),
      "Starting gridref": this.walkGridReference(walk),
      "Starting location details": this.nearestTown(walk),
      "Show exact starting point": "Yes",
      "Start time": this.walkStartTime(walk),
      "Show exact meeting point?": "Yes",
      "Meeting time": this.walkStartTime(walk),
      Restriction: "Public",
      Difficulty: this.asString(walk.grade),
      "Local walk grade": this.asString(walk.grade),
      "Distance miles": this.walkDistanceMiles(walk),
      "Contact id": this.contactIdLookup(walk, members),
      "Contact display name": this.contactDisplayName(walk)
    };
  }

}
