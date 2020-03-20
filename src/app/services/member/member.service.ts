import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { share } from "rxjs/operators";
import { chain } from "../../functions/chain";
import { DataQueryOptions } from "../../models/api-request.model";
import { MailchimpSubscription, Member, MemberApiResponse } from "../../models/member.model";
import { CommonDataService } from "../common-data-service";
import { DbUtilsService } from "../db-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { NumberUtilsService } from "../number-utils.service";

@Injectable({
  providedIn: "root"
})
export class MemberService {

  private BASE_URL = "/api/database/member";
  private logger: Logger;
  private memberNotifications = new Subject<MemberApiResponse>();

  constructor(private http: HttpClient,
              private numberUtils: NumberUtilsService,
              private dbUtils: DbUtilsService,
              private commonDataService: CommonDataService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberService, NgxLoggerLevel.OFF);
  }

  filterFor = {
    SOCIAL_MEMBERS_SUBSCRIBED: member => member.groupMember && member.socialMember && member.mailchimpLists.socialEvents.subscribed,
    WALKS_MEMBERS_SUBSCRIBED: member => member.groupMember && member.mailchimpLists.walks.subscribed,
    GENERAL_MEMBERS_SUBSCRIBED: member => member.groupMember && member.mailchimpLists.general.subscribed,
    GROUP_MEMBERS: member => member.groupMember,
    COMMITTEE_MEMBERS: member => member.groupMember && member.committee,
    SOCIAL_MEMBERS: member => member.groupMember && member.socialMember,
  };

  private async responseFrom(observable: Observable<MemberApiResponse>): Promise<MemberApiResponse> {
    const shared = observable.pipe(share());
    shared.subscribe((memberAPIResponse: MemberApiResponse) => {
      this.logger.info("memberAPIResponse", memberAPIResponse);
      this.memberNotifications.next(memberAPIResponse);
    }, (httpErrorResponse: HttpErrorResponse) => {
      this.logger.error("httpErrorResponse", httpErrorResponse);
      this.memberNotifications.next(httpErrorResponse.error);
    });
    return await shared.toPromise();
  }

  notifications(): Observable<MemberApiResponse> {
    return this.memberNotifications.asObservable();
  }

  getMemberForUserName(userName: string): Promise<Member> {
    return this.query({criteria: {userName: userName.toLowerCase()}});
  }

  async query(dataQueryOptions?: DataQueryOptions): Promise<Member> {
    const params = this.commonDataService.toHttpParams(dataQueryOptions);
    this.logger.debug("find-one:criteria", dataQueryOptions, "params", params.toString());
    const apiResponse = await this.responseFrom(this.http.get<MemberApiResponse>(`${this.BASE_URL}/find-one`, {params}));
    this.logger.debug("find-one:received", apiResponse);
    return apiResponse.response as Member;
  }

  async all(dataQueryOptions?: DataQueryOptions): Promise<Member[]> {
    const params = this.commonDataService.toHttpParams(dataQueryOptions);
    this.logger.debug("all:params", params.toString());
    const response = await this.responseFrom(this.http.get<MemberApiResponse>(`${this.BASE_URL}/all`, {params}));
    const responses = response.response as Member[];
    this.logger.debug("all:params", params.toString(), "received", responses.length, "members");
    return responses;
  }

  async getById(memberId: string): Promise<Member> {
    this.logger.debug("getById:", memberId);
    const apiResponse = await this.responseFrom(this.http.get<MemberApiResponse>(`${this.BASE_URL}/${memberId}`));
    this.logger.debug("getById - received", apiResponse);
    return apiResponse.response as Member;
  }

  async getMemberByPasswordResetId(passwordResetId): Promise<Member> {
    this.logger.debug("getMemberByPasswordResetId:", passwordResetId);
    const apiResponse = await this.responseFrom(this.http.get<MemberApiResponse>(`${this.BASE_URL}/password-reset-id/${passwordResetId}`));
    this.logger.debug("getMemberByPasswordResetId - received", apiResponse);
    return apiResponse.response as Member;
  }

  async create(member: Member): Promise<Member> {
    this.logger.debug("creating", member);
    const apiResponse = await this.responseFrom(this.http.post<MemberApiResponse>(this.BASE_URL, this.dbUtils.performAudit(member)));
    this.logger.debug("created", member, "- received", apiResponse);
    return apiResponse.response as Member;
  }

  async update(member: Member): Promise<Member> {
    this.logger.debug("updating", member);
    const apiResponse = await this.responseFrom(this.http.put<MemberApiResponse>(this.BASE_URL + "/" + member.id, this.dbUtils.performAudit(member)));
    this.logger.debug("updated", member, "- received", apiResponse);
    return apiResponse.response as Member;
  }

  async updateMailSubscription(memberId: string, listType: string, subscription: MailchimpSubscription): Promise<Member> {
    const body: any = {mailchimpLists: {}};
    body.mailchimpLists[listType] = subscription;
    this.logger.debug("updating member id", memberId, listType, "subscription:", body);
    const apiResponse = await this.responseFrom(this.http.put<MemberApiResponse>(`${this.BASE_URL}/${memberId}/email-subscription`, body));
    this.logger.debug("updated member id", memberId, listType, "subscription:", body, "response:", apiResponse);
    return apiResponse.response as Member;
  }

  async delete(member: Member): Promise<Member> {
    this.logger.debug("deleting", member);
    const apiResponse = await this.responseFrom(this.http.delete<MemberApiResponse>(this.BASE_URL + "/" + member.id));
    this.logger.debug("deleted", member, "- received", apiResponse);
    return apiResponse.response as Member;
  }

  setPasswordResetId(member: Member) {
    member.passwordResetId = this.numberUtils.generateUid();
    this.logger.debug("member.userName", member.userName, "member.passwordResetId", member.passwordResetId);
    return member;
  }

  memberUrl(member: Member) {
    return member && (member.id) && this.BASE_URL + "/" + member.id;
  }

  async createOrUpdate(member: Member): Promise<Member> {
    if (member.id) {
      return this.update(member);
    } else {
      return this.create(member);
    }
  }

  extractMemberId(memberIdOrObject) {
    return (memberIdOrObject && memberIdOrObject.id) ? memberIdOrObject.id : memberIdOrObject;
  }

  allLimitedFields(filterFunction?: (value?: any) => boolean) {
    return this.all({
      select: {
        mailchimpLists: 1,
        groupMember: 1,
        socialMember: 1,
        financeAdmin: 1,
        treasuryAdmin: 1,
        fileAdmin: 1,
        committee: 1,
        walkChangeNotifications: 1,
        email: 1,
        displayName: 1,
        contactId: 1,
        mobileNumber: 1,
        id: 1,
        firstName: 1,
        lastName: 1,
        nameAlias: 1
      }
    }).then(members => chain(members)
      .filter(filterFunction || (() => true))
      .sortBy(member => member.firstName + member.lastName).value());
  }

  toMember(memberIdOrObject, members): Member {
    const memberId = this.extractMemberId(memberIdOrObject);
    return members.find(member => this.extractMemberId(member) === memberId);
  }

  allMemberMembersWithPrivilege(privilege, members) {
    const filteredMembers = members.filter(member => member.groupMember && member[privilege]);
    this.logger.debug("allMemberMembersWithPrivilege:privilege", privilege, "filtered from", members.length, "->", filteredMembers.length, "members ->", filteredMembers);
    return filteredMembers;
  }

  allMemberIdsWithPrivilege(privilege, members) {
    return this.allMemberMembersWithPrivilege(privilege, members).map(this.extractMemberId);
  }

}
