import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import {
  MailchimpBatchSubscriptionResponse,
  MailchimpEmailWithError,
  MailchimpListDeleteSegmentMembersResponse,
  MailchimpListMember,
  MailchimpListResponse,
  MailchimpListSegmentAddResponse,
  MailchimpListSegmentDeleteResponse,
  MailchimpListSegmentMembersAddResponse,
  MailchimpListSegmentRenameResponse,
  MailchimpListSegmentResetResponse,
  MailchimpMemberIdentifiers,
  MailchimpSubscriptionMember,
  MergeFields,
  SubscriptionRequest,
  SubscriptionStatus
} from "../../models/mailchimp.model";
import { Member } from "../../models/member.model";
import { CommonDataService } from "../common-data-service";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberService } from "../member/member.service";
import { AlertInstance } from "../notifier.service";
import { StringUtilsService } from "../string-utils.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpListService {
  private logger: Logger;
  private BASE_URL = "api/mailchimp/lists";
  private notifications = new Subject<ApiResponse>();

  constructor(private stringUtils: StringUtilsService,
              private http: HttpClient,
              private dateUtils: DateUtilsService,
              private commonDataService: CommonDataService,
              private memberService: MemberService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpListService, NgxLoggerLevel.OFF);
  }

  async addSegment(listType: string, segmentName: string): Promise<MailchimpListSegmentAddResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentAdd`, {segmentName}), this.notifications, true)).response;
  }

  async addSegmentMembers(listType: string, segmentId: number, segmentMembers: SubscriptionRequest[]): Promise<MailchimpListSegmentMembersAddResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentMembersAdd`, {
      segmentId,
      segmentMembers
    }), this.notifications, true)).response;
  }

  async deleteSegmentMembers(listType: string, segmentId: number, segmentMembers): Promise<MailchimpListDeleteSegmentMembersResponse> {
    const params: HttpParams = this.commonDataService.toHttpParams({segmentId, segmentMembers});
    return (await this.commonDataService.responseFrom(this.logger, this.http.delete<ApiResponse>(`${this.BASE_URL}/${listType}/segmentMembersDel`, {params}), this.notifications, true)).response;
  }

  async resetSegment(listType: string, segmentId: number): Promise<MailchimpListSegmentResetResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.put<ApiResponse>(`${this.BASE_URL}/${listType}/segmentReset`, {segmentId}), this.notifications, true)).response;
  }

  async renameSegment(listType: string, segmentId: number, segmentName: string): Promise<MailchimpListSegmentRenameResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentRename`, {
      segmentId,
      segmentName
    }), this.notifications, true)).response;
  }

  async deleteSegment(listType: string, segmentId: number): Promise<MailchimpListSegmentDeleteResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.delete<ApiResponse>(`${this.BASE_URL}/${listType}/segmentDel/${segmentId}`), this.notifications, true)).response;
  }

  async listSegments(listType: string) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/${listType}/segments`), this.notifications, true)).response;
  }

  async listSubscribers(listType: string): Promise<MailchimpListResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/${listType}`), this.notifications, true)).response;
  }

  async batchSubscribe(listType: string, mailchimpSubscriptionMembers: MailchimpSubscriptionMember[]): Promise<MailchimpBatchSubscriptionResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/batchSubscribe`, mailchimpSubscriptionMembers), this.notifications, true)).response;
  }

  batchUnsubscribeMembers(listType: string, allMembers: Member[], notify: AlertInstance) {
    return this.listSubscribers(listType)
      .then((listResponse: MailchimpListResponse) => this.updateWebId(listResponse, listType, allMembers))
      .then((listResponse: MailchimpListResponse) => this.filterForUnsubscribes(listResponse, listType, allMembers))
      .then(mailchimpSubscriptionMembers => this.batchUnsubscribeForListType(mailchimpSubscriptionMembers, listType, allMembers, notify));
  }

  batchUnsubscribeForListType(mailchimpSubscriptionMembers: MailchimpSubscriptionMember[], listType: string, allMembers: Member[], notify: AlertInstance) {
    if (mailchimpSubscriptionMembers.length > 0) {
      this.logger.debug("batch unsubscribing from list", listType, mailchimpSubscriptionMembers);
      return this.batchSubscribe(listType, mailchimpSubscriptionMembers)
        .then(() => this.removeSubscriberDetailsFromMembers(listType, allMembers, mailchimpSubscriptionMembers, notify));
    } else {
      const message = {title: "List Unsubscription", message: "No members needed to be unsubscribed from " + listType + " list"};
      this.logger.debug(message);
      notify.progress(message);
    }
  }

  removeSubscriberDetailsFromMembers(listType: string, allMembers: Member[], mailchimpSubscriptionMembers: MailchimpSubscriptionMember[], notify: AlertInstance) {
    return () => {
      const updatedMembers = mailchimpSubscriptionMembers.map(mailchimpListMember => {
        const member: Member = this.subscriberToMember(listType, allMembers, mailchimpListMember);
        if (member) {
          member.mailchimpLists[listType] = {subscribed: false, updated: true};
          return this.memberService.update(member);
        } else {
          notify.warning({title: "List Unsubscription", message: "Could not find member from " + listType + " response containing data " + JSON.stringify(mailchimpListMember)});
        }
      });
      Promise.all(updatedMembers).then(() => {
        notify.success({title: "List Unsubscription", message: "Successfully unsubscribed " + updatedMembers.length + " member(s) from " + listType + " list"});
        return updatedMembers;
      });
    };
  }

  public toMergeVariables(member: Member): MergeFields {
    return {
      EMAIL: member.email,
      FNAME: member.firstName,
      LNAME: member.lastName,
      MEMBER_NUM: member.membershipNumber,
      MEMBER_EXP: this.dateUtils.displayDate(member.membershipExpiryDate),
      USERNAME: member.userName,
      PW_RESET: member.passwordResetId || ""
    };
  }

  filterForUnsubscribes(listResponse: MailchimpListResponse, listType: string, allMembers): MailchimpSubscriptionMember[] {
    const unsubscribes: MailchimpSubscriptionMember[] = listResponse.members
      .filter(mailchimpListMember => this.includeInUnsubscribe(listType, allMembers, mailchimpListMember))
      .map(mailchimpListMember => ({...mailchimpListMember, status: SubscriptionStatus.UNSUBSCRIBED}));
    this.logger.debug("given", listResponse.members.length, "in", listType, "list,", unsubscribes.length, "were filtered for unsubscription");
    return unsubscribes;
  }

  subscriberToMember(listType: string, members: Member[], mailchimpListMember: MailchimpMemberIdentifiers | MailchimpEmailWithError | MailchimpSubscriptionMember): Member {
    return members.find(member => {
      this.logger.off("subscriberToMember:member", member, "mailchimpListMember:", mailchimpListMember);
      const matchedOnUniqueEmailId = mailchimpListMember["unique_email_id"] && mailchimpListMember["unique_email_id"] === member.mailchimpLists[listType]?.unique_email_id;
      const matchedOnWebId = mailchimpListMember["web_id"] && mailchimpListMember["web_id"] === member.mailchimpLists[listType]?.web_id;
      const matchedOnLastReturnedEmail = mailchimpListMember?.email_address && mailchimpListMember?.email_address?.toLowerCase() === member.mailchimpLists[listType]?.email?.toLowerCase();
      const matchedOnCurrentEmail = mailchimpListMember?.email_address && mailchimpListMember?.email_address?.toLowerCase() === member?.email?.toLowerCase();
      const matched = matchedOnUniqueEmailId || matchedOnWebId || matchedOnLastReturnedEmail || matchedOnCurrentEmail;
      this.logger.off("subscriberToMember:member:matched", matched);
      return matched;
    });
  }

  resetUpdateStatusForMember(member): void {
    // updated == false means not up to date with mail e.g. next list update will send this data to mailchimo
    member.mailchimpLists.walks.updated = false;
    member.mailchimpLists.socialEvents.updated = false;
    member.mailchimpLists.general.updated = false;
  }

  findMemberAndMarkAsUpdated(listType: string, batchedMembers: Member[], mailchimpMember: MailchimpListMember): Member {
    const member = this.subscriberToMember(listType, batchedMembers, mailchimpMember);
    if (member) {
      member.mailchimpLists[listType].updated = true; // updated == true means up to date e.g. nothing to send to mailchimp
      member.mailchimpLists[listType].leid = null;
      member.mailchimpLists[listType].email = null;
      if (mailchimpMember.web_id) {
        member.mailchimpLists[listType].web_id = mailchimpMember.web_id;
      }
      if (mailchimpMember.unique_email_id) {
        member.mailchimpLists[listType].unique_email_id = mailchimpMember.unique_email_id;
      }
      member.mailchimpLists[listType].lastUpdated = this.dateUtils.nowAsValue();
      this.logger.info("Updated member:", member, "from:", mailchimpMember);
    } else {
      this.logger.info(`From ${batchedMembers.length} members, could not find any member related to subscriber ${JSON.stringify(mailchimpMember)}`);
    }
    return member;
  }

  findMemberAndMarkAsUpdatedFromError(listType: string, batchedMembers: Member[], emailWithError: MailchimpEmailWithError): Member {
    const member = this.subscriberToMember(listType, batchedMembers, emailWithError);
    if (member) {
      member.mailchimpLists[listType].updated = true; // updated == true means up to date e.g. nothing to send to mailchimp
      member.mailchimpLists[listType].lastUpdated = this.dateUtils.nowAsValue();
      member.mailchimpLists[listType].email = member.email;
    } else {
      this.logger.info(`From ${batchedMembers.length} members, could not find any member related to subscriber ${JSON.stringify(emailWithError)}`);
    }
    return member;
  }

  includeMemberInEmailList(listType, member): boolean {
    if (member.email && member.mailchimpLists[listType].subscribed) {
      if (listType === "socialEvents") {
        return member.groupMember && member.socialMember;
      } else {
        return member.groupMember;
      }
    } else {
      return false;
    }
  }

  includeMemberInSubscription(listType, member: Member): boolean {
    return this.includeMemberInEmailList(listType, member) && !member.mailchimpLists[listType].updated;
  }

  includeInUnsubscribe(listType: string, members: Member[], subscriber: MailchimpListMember): boolean {
    return this.includeMemberInUnsubscription(listType, this.subscriberToMember(listType, members, subscriber));
  }

  includeMemberInUnsubscription(listType, member: Member): boolean {
    if (!member || !member?.groupMember) {
      return true;
    } else if (member.mailchimpLists) {
      if (listType === "socialEvents") {
        return (!member.socialMember && member.mailchimpLists[listType].subscribed);
      } else {
        return (!member.mailchimpLists[listType].subscribed);
      }
    } else {
      return false;
    }
  }

  defaultMailchimpSettings(member: Member, subscribedState: boolean): void {
    member.mailchimpLists = {
      walks: {subscribed: subscribedState},
      socialEvents: {subscribed: subscribedState},
      general: {subscribed: subscribedState}
    };
  }

  setMailchimpSubscriptionStateFor(member: Member, subscribedState: boolean): void {
    if (!member.mailchimpLists) {
      this.defaultMailchimpSettings(member, subscribedState);
    } else {
      member.mailchimpLists.walks.subscribed = subscribedState;
      member.mailchimpLists.socialEvents.subscribed = subscribedState;
      member.mailchimpLists.general.subscribed = subscribedState;
    }
  }

  private updateWebId(mailchimpListResponse: MailchimpListResponse, listType: string, allMembers: Member[]): Promise<MailchimpListResponse> {
    return Promise.all(mailchimpListResponse.members.map(listResponse => {
      const member = this.findMemberAndMarkAsUpdated(listType, allMembers, listResponse);
      if (member) {
        return this.memberService.update(member);
      }
    })).then(() => mailchimpListResponse);
  }
}
