import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { DataQueryOptions } from "../../models/api-request.model";
import { CommitteeFile, CommitteeFileApiResponse } from "../../models/committee.model";
import { CommonDataService } from "../common-data-service";
import { Logger, LoggerFactory } from "../logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class CommitteeFileService {

  private BASE_URL = "/api/database/committee-file";
  private logger: Logger;
  private committeeFileNotifications = new Subject<CommitteeFileApiResponse>();

  constructor(private http: HttpClient,
              private commonDataService: CommonDataService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeFileService, NgxLoggerLevel.OFF);
  }

  notifications(): Observable<CommitteeFileApiResponse> {
    return this.committeeFileNotifications.asObservable();
  }

  async all(dataQueryOptions?: DataQueryOptions): Promise<CommitteeFile[]> {
    const params = this.commonDataService.toHttpParams(dataQueryOptions);
    this.logger.debug("all:dataQueryOptions", dataQueryOptions, "params", params.toString());
    const apiResponse = await this.commonDataService.responseFrom(this.logger, this.http.get<CommitteeFileApiResponse>(`${this.BASE_URL}/all`, {params}), this.committeeFileNotifications);
    return apiResponse.response as CommitteeFile[];
  }

  async createOrUpdate(socialEvent: CommitteeFile): Promise<CommitteeFile> {
    if (socialEvent.id) {
      return this.update(socialEvent);
    } else {
      return this.create(socialEvent);
    }
  }

  async getById(id: string): Promise<CommitteeFile>  {
    this.logger.debug("getById:", id);
    const apiResponse = await this.commonDataService.responseFrom(this.logger, this.http.get<CommitteeFileApiResponse>(`${this.BASE_URL}/${id}`), this.committeeFileNotifications);
    return apiResponse.response as CommitteeFile;
  }

  async update(socialEvent: CommitteeFile): Promise<CommitteeFile> {
    this.logger.debug("updating", socialEvent);
    const apiResponse = await this.commonDataService.responseFrom(this.logger, this.http.put<CommitteeFileApiResponse>(this.BASE_URL + "/" + socialEvent.id, socialEvent), this.committeeFileNotifications);
    this.logger.debug("updated", socialEvent, "- received", apiResponse);
    return apiResponse.response as CommitteeFile;
  }

  async create(socialEvent: CommitteeFile): Promise<CommitteeFile> {
    this.logger.debug("creating", socialEvent);
    const apiResponse = await this.commonDataService.responseFrom(this.logger, this.http.post<CommitteeFileApiResponse>(this.BASE_URL, socialEvent), this.committeeFileNotifications);
    this.logger.debug("created", socialEvent, "- received", apiResponse);
    return apiResponse.response as CommitteeFile;
  }

  async delete(socialEvent: CommitteeFile): Promise<CommitteeFile> {
    this.logger.debug("deleting", socialEvent);
    const apiResponse = await this.commonDataService.responseFrom(this.logger, this.http.delete<CommitteeFileApiResponse>(this.BASE_URL + "/" + socialEvent.id), this.committeeFileNotifications);
    this.logger.debug("deleted", socialEvent, "- received", apiResponse);
    return apiResponse.response as CommitteeFile;
  }

}
