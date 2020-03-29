import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { chain } from "../../functions/chain";
import { ApiResponse } from "../../models/api-response.model";
import {
  MailchimpBatchSubscriptionResponse,
  MailchimpBatchUnsubscribeResponse,
  MailchimpListDeleteSegmentMembersResponse,
  MailchimpListResponse,
  MailchimpListSegmentAddResponse,
  MailchimpListSegmentDeleteResponse,
  MailchimpListSegmentMembersAddResponse,
  MailchimpListSegmentRenameResponse,
  MailchimpListSegmentResetResponse,
  MailchimpSubscriber,
  SubscriberIdentifiers
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
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentAdd`, {segmentName}), this.notifications)).response;
  }

  async addSegmentMembers(listType: string, segmentId: number, segmentMembers): Promise<MailchimpListSegmentMembersAddResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentMembersAdd`, {
      segmentId,
      segmentMembers
    }), this.notifications)).response;
  }

  async deleteSegmentMembers(listType: string, segmentId: number, segmentMembers): Promise<MailchimpListDeleteSegmentMembersResponse> {
    const params: HttpParams = this.commonDataService.toHttpParams({segmentId, segmentMembers});
    return (await this.commonDataService.responseFrom(this.logger, this.http.delete<ApiResponse>(`${this.BASE_URL}/${listType}/segmentMembersDel`, {params}), this.notifications)).response;
  }

  async resetSegment(listType: string, segmentId: number): Promise<MailchimpListSegmentResetResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.put<ApiResponse>(`${this.BASE_URL}/${listType}/segmentReset`, {segmentId}), this.notifications)).response;
  }

  async renameSegment(listType: string, segmentId: number, segmentName: string): Promise<MailchimpListSegmentRenameResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentRename`, {
      segmentId,
      segmentName
    }), this.notifications)).response;
  }

  async deleteSegment(listType: string, segmentId: number): Promise<MailchimpListSegmentDeleteResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.delete<ApiResponse>(`${this.BASE_URL}/${listType}/segmentDel/${segmentId}`), this.notifications)).response;
  }

  async listSegments(listType: string) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/${listType}/segments`), this.notifications)).response;
  }

  async listSubscribers(listType: string): Promise<MailchimpListResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/${listType}`), this.notifications)).response;
  }

  async batchUnsubscribe(listType: string, subscribers): Promise<MailchimpBatchUnsubscribeResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/batchUnsubscribe`, subscribers), this.notifications)).response;
  }

  async batchSubscribe(listType: string, subscribers): Promise<MailchimpBatchSubscriptionResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/batchSubscribe`, subscribers), this.notifications)).response;
  }

  batchUnsubscribeMembers(listType: string, allMembers: Member[], notify: AlertInstance) {
    return this.listSubscribers(listType)
      .then(listResponse => this.filterForUnsubscribes(listResponse, listType, allMembers))
      .then(subscriberIdentifiersResponse => this.batchUnsubscribeForListType(subscriberIdentifiersResponse, listType, allMembers, notify));
  }

  returnUpdatedMembers() {
    return this.memberService.all();
  }

  batchUnsubscribeForListType(subscriberIdentifiersResponse, listType: string, allMembers: Member[], notify: AlertInstance) {
    if (subscriberIdentifiersResponse.length > 0) {
      return this.batchUnsubscribe(listType, subscriberIdentifiersResponse)
        .then(() => this.removeSubscriberDetailsFromMembers(listType, allMembers, subscriberIdentifiersResponse, notify));
    } else {
      notify.progress({title: "List Unsubscription", message: "No members needed to be unsubscribed from " + listType + " list"});
    }
  }

  removeSubscriberDetailsFromMembers(listType: string, allMembers: Member[], subscribers, notify: AlertInstance) {
    return () => {
      const updatedMembers = chain(subscribers)
        .map(subscriber => {
          const member = this.responseToMember(listType, allMembers, subscriber);
          if (member) {
            member.mailchimpLists[listType] = {subscribed: false, updated: true};
            return this.memberService.update(member);
          } else {
            notify.warning({title: "List Unsubscription", message: "Could not find member from " + listType + " response containing data " + JSON.stringify(subscriber)});
          }
        })
        .value();
      Promise.all(updatedMembers).then(() => {
        notify.success({title: "List Unsubscription", message: "Successfully unsubscribed " + updatedMembers.length + " member(s) from " + listType + " list"});
        return updatedMembers;
      });
    };
  }

  filterForUnsubscribes(listResponse: MailchimpListResponse, listType: string, allMembers): SubscriberIdentifiers[] {
    return listResponse.data
      .filter(subscriber => this.includeInUnsubscribe(listType, allMembers, subscriber))
      .map(subscriber => ({
        email: subscriber.email,
        euid: subscriber.euid,
        leid: subscriber.leid
      }));
  }

  responseToMember(listType, members: Member[], subscriber: MailchimpSubscriber) {
    return members.find(member => {
      const matchedOnListSubscriberId = subscriber.leid && member.mailchimpLists[listType].leid && (subscriber.leid.toString() === member.mailchimpLists[listType].leid.toString());
      const matchedOnLastReturnedEmail = member.mailchimpLists[listType].email && (subscriber.email.toLowerCase() === member.mailchimpLists[listType].email.toLowerCase());
      const matchedOnCurrentEmail = member.email && subscriber.email.toLowerCase() === member.email.toLowerCase();
      return (matchedOnListSubscriberId || matchedOnLastReturnedEmail || matchedOnCurrentEmail);
    });
  }

  includeMemberInUnsubscription(listType, member) {
    if (!member || !member.groupMember) {
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

  includeInUnsubscribe(listType: string, members: Member[], subscriber: MailchimpSubscriber) {
    return this.includeMemberInUnsubscription(listType, this.responseToMember(listType, members, subscriber));
  }

  resetUpdateStatusForMember(member) {
    // updated == false means not up to date with mail e.g. next list update will send this data to mailchimo
    member.mailchimpLists.walks.updated = false;
    member.mailchimpLists.socialEvents.updated = false;
    member.mailchimpLists.general.updated = false;
  }

  findMemberAndMarkAsUpdated(listType: string, batchedMembers: any[], subscriber: MailchimpSubscriber) {
    const member = this.responseToMember(listType, batchedMembers, subscriber);
    if (member) {
      member.mailchimpLists[listType].leid = subscriber.leid;
      member.mailchimpLists[listType].updated = true; // updated == true means up to date e.g. nothing to send to mailchimo
      member.mailchimpLists[listType].lastUpdated = this.dateUtils.nowAsValue();
      member.mailchimpLists[listType].email = member.email;
    } else {
      this.logger.debug(`From ${batchedMembers.length} members, could not find any member related to subscriber ${JSON.stringify(subscriber)}`);
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

  includeMemberInSubscription(listType, member): boolean {
    return this.includeMemberInEmailList(listType, member) && !member.mailchimpLists[listType].updated;
  }

  defaultMailchimpSettings(member: Member, subscribedState: boolean) {
    member.mailchimpLists = {
      walks: {subscribed: subscribedState},
      socialEvents: {subscribed: subscribedState},
      general: {subscribed: subscribedState}
    };
  }

}
