import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { MemberAuthAudit, MemberAuthAuditApiResponse } from "../../models/member.model";
import { CommonDataService } from "../common-data-service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { NumberUtilsService } from "../number-utils.service";

@Injectable({
  providedIn: "root"
})
export class MemberAuthAuditService {

  private BASE_URL = "/api/database/member-auth-audit";
  private logger: Logger;

  constructor(private http: HttpClient,
              private numberUtils: NumberUtilsService,
              private commonDataService: CommonDataService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberAuthAuditService, NgxLoggerLevel.OFF);
  }

  async all(criteria?: object, orderBy?: object): Promise<MemberAuthAudit[]> {
    const params = this.commonDataService.toHttpParams(criteria);
    this.logger.debug("find-one:criteria", criteria, "params", params.toString());
    const apiResponse = await this.http.get<MemberAuthAuditApiResponse>(`${this.BASE_URL}/all`, {params}).toPromise();
    this.logger.debug("find-one - received", apiResponse);
    return apiResponse.response as MemberAuthAudit[];
  }

  async getByMemberId(memberId: string): Promise<MemberAuthAudit[]> {
    this.logger.debug("getById:", memberId);
    const apiResponse = await this.http.get<MemberAuthAuditApiResponse>(`${this.BASE_URL}/member/${memberId}`).toPromise();
    this.logger.debug("getById - received", apiResponse);
    return apiResponse.response as MemberAuthAudit[];
  }

  async create(member: MemberAuthAudit): Promise<MemberAuthAudit> {
    this.logger.debug("creating", member);
    const apiResponse = await this.http.post<MemberAuthAuditApiResponse>(this.BASE_URL, member).toPromise();
    this.logger.debug("created", member, "received", apiResponse);
    return apiResponse.response as MemberAuthAudit;
  }

  async delete(memberUpdateAudit: MemberAuthAudit): Promise<MemberAuthAudit> {
    this.logger.debug("deleting", memberUpdateAudit);
    const apiResponse = await this.http.delete<MemberAuthAuditApiResponse>(this.BASE_URL + "/" + memberUpdateAudit.id).toPromise();
    this.logger.debug("deleted", memberUpdateAudit, "received", apiResponse);
    return apiResponse.response as MemberAuthAudit;
  }

}
