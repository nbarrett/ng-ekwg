import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import each from "lodash-es/each";
import { NgxLoggerLevel } from "ngx-logger";
import { chain } from "../functions/chain";
import { Member } from "../models/member.model";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { NumberUtilsService } from "./number-utils.service";

@Injectable({
  providedIn: "root"
})
export class MemberService {

  private BASE_URL = "/api/database/member";
  private logger: Logger;

  constructor(private http: HttpClient,
              private numberUtils: NumberUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberService, NgxLoggerLevel.DEBUG);
  }

  filterFor = {
    SOCIAL_MEMBERS_SUBSCRIBED: member => member.groupMember && member.socialMember && member.mailchimpLists.socialEvents.subscribed,
    WALKS_MEMBERS_SUBSCRIBED: member => member.groupMember && member.mailchimpLists.walks.subscribed,
    GENERAL_MEMBERS_SUBSCRIBED: member => member.groupMember && member.mailchimpLists.general.subscribed,
    GROUP_MEMBERS: member => member.groupMember,
    COMMITTEE_MEMBERS: member => member.groupMember && member.committee,
    SOCIAL_MEMBERS: member => member.groupMember && member.socialMember,
  };

  getMemberForUserName(userName: string): Promise<Member> {
    return this.query({userName: userName.toLowerCase()});
  }

  async query(criteria?: object): Promise<Member> {
    const params = this.convertToParams(criteria);
    this.logger.debug("find-one:criteria", criteria, "params", params.toString());
    const apiResponse = await this.http.get<Member>(`${this.BASE_URL}/find-one`, {params}).toPromise();
    this.logger.debug("find-one - received", apiResponse);
    return apiResponse;
  }

  private convertToParams(criteria: object): HttpParams {
    let params = new HttpParams();
    each(criteria, (value, field) => {
      params = params.set(field, value);
      this.logger.debug("query setting params field:", field, "value:", value);
    });
    return params;
  }

  async all(criteria?: object): Promise<Member[]> {
    const params = this.convertToParams(criteria);
    this.logger.debug("all:params", params.toString());
    const apiResponse = await this.http.get<Member[]>(`${this.BASE_URL}/all`, {params}).toPromise();
    this.logger.debug("all:params", params.toString(), "received", apiResponse.length, "members");
    return apiResponse;
  }

  async getById(memberId: string): Promise<Member> {
    this.logger.debug("getById:", memberId);
    const apiResponse = await this.http.get<Member>(`${this.BASE_URL}/${memberId}`).toPromise();
    this.logger.debug("getById - received", apiResponse);
    return apiResponse;
  }

  async getMemberByPasswordResetId(passwordResetId): Promise<Member> {
    this.logger.debug("getMemberByPasswordResetId:", passwordResetId);
    const apiResponse = await this.http.get<Member>(`${this.BASE_URL}/password-reset-id/${passwordResetId}`).toPromise();
    this.logger.debug("getMemberByPasswordResetId - received", apiResponse);
    return apiResponse;
  }

  async create(member: Member): Promise<Member> {
    this.logger.debug("creating", member);
    const apiResponse = await this.http.post<{ response: Member }>(this.BASE_URL, member).toPromise();
    this.logger.debug("created", member, "- received", apiResponse);
    return apiResponse.response;
  }

  async update(member: Member): Promise<Member> {
    this.logger.debug("updating", member);
    const apiResponse = await this.http.put<{ response: Member }>(this.BASE_URL + "/" + member.id, member).toPromise();
    this.logger.debug("updated", member, "- received", apiResponse);
    return apiResponse.response;
  }

  async delete(member: Member): Promise<Member> {
    this.logger.debug("deleting", member);
    const apiResponse = await this.http.delete<{ response: Member }>(this.BASE_URL + "/" + member.id).toPromise();
    this.logger.debug("deleted", member, "- received", apiResponse);
    return apiResponse.response;
  }

  setPasswordResetId(member) {
    member.passwordResetId = this.numberUtils.generateUid();
    this.logger.debug("member.userName", member.userName, "member.passwordResetId", member.passwordResetId);
    return member;
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

  allLimitedFields(filterFunction) {
    return this.all({
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
    }).then(members => chain(members)
      .filter(filterFunction)
      .sortBy(member => member.firstName + member.lastName).value());
  }

  toMember(memberIdOrObject, members) {
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
