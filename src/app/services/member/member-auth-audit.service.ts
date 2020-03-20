import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { share } from "rxjs/operators";
import { DataQueryOptions } from "../../models/api-request.model";
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
  private authNotifications = new Subject<MemberAuthAuditApiResponse>();

  constructor(private http: HttpClient,
              private numberUtils: NumberUtilsService,
              private commonDataService: CommonDataService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberAuthAuditService, NgxLoggerLevel.OFF);
  }

  private async responseFrom(observable: Observable<MemberAuthAuditApiResponse>): Promise<MemberAuthAuditApiResponse> {
    const shared = observable.pipe(share());
    shared.subscribe((memberAPIResponse: MemberAuthAuditApiResponse) => {
      this.logger.info("memberAPIResponse", memberAPIResponse);
      this.authNotifications.next(memberAPIResponse);
    }, (httpErrorResponse: HttpErrorResponse) => {
      this.logger.error("httpErrorResponse", httpErrorResponse);
      this.authNotifications.next(httpErrorResponse.error);
    });
    return await shared.toPromise();
  }

  notifications(): Observable<MemberAuthAuditApiResponse> {
    return this.authNotifications.asObservable();
  }

  async all(dataQueryOptions?: DataQueryOptions): Promise<MemberAuthAudit[]> {
    const params = this.commonDataService.toHttpParams(dataQueryOptions);
    this.logger.debug("find-one:criteria", dataQueryOptions, "params", params.toString());
    const apiResponse = await this.responseFrom(this.http.get<MemberAuthAuditApiResponse>(`${this.BASE_URL}/all`, {params}));
    this.logger.debug("find-one - received", apiResponse);
    return apiResponse.response as MemberAuthAudit[];
  }

  async getByMemberId(memberId: string): Promise<MemberAuthAudit[]> {
    this.logger.debug("getById:", memberId);
    const apiResponse = await this.responseFrom(this.http.get<MemberAuthAuditApiResponse>(`${this.BASE_URL}/member/${memberId}`));
    this.logger.debug("getById - received", apiResponse);
    return apiResponse.response as MemberAuthAudit[];
  }

  async create(member: MemberAuthAudit): Promise<MemberAuthAudit> {
    this.logger.debug("creating", member);
    const apiResponse = await this.responseFrom(this.http.post<MemberAuthAuditApiResponse>(this.BASE_URL, member));
    this.logger.debug("created", member, "received", apiResponse);
    return apiResponse.response as MemberAuthAudit;
  }

  async delete(memberUpdateAudit: MemberAuthAudit): Promise<MemberAuthAudit> {
    this.logger.debug("deleting", memberUpdateAudit);
    const apiResponse = await this.responseFrom(this.http.delete<MemberAuthAuditApiResponse>(this.BASE_URL + "/" + memberUpdateAudit.id));
    this.logger.debug("deleted", memberUpdateAudit, "received", apiResponse);
    return apiResponse.response as MemberAuthAudit;
  }

}
