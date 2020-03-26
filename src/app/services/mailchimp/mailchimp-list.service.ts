import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { chain } from "../../functions/chain";
import { ApiResponse } from "../../models/api-response.model";
import {
  MailchimpBatchSubscriptionApiResponse,
  MailchimpBatchSubscriptionResponse,
  MailchimpListApiResponse,
  MailchimpListResponse,
  SubscriberIdentifiers
} from "../../models/mailchimp.model";
import { Member } from "../../models/member.model";
import { CommonDataService } from "../common-data-service";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberService } from "../member/member.service";
import { AlertInstance } from "../notifier.service";
import { StringUtilsService } from "../string-utils.service";
import { MailchimpListSubscriptionService } from "./mailchimp-list-subscription.service";

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
              private mailchimpListSubscriptionService: MailchimpListSubscriptionService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpListService, NgxLoggerLevel.DEBUG);
  }

  async addSegment(listType: string, segmentName: string) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentAdd`, {segmentName}), this.notifications)).response;
  }

  async addSegmentMembers(listType: string, segmentId: string, segmentMembers) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentMembersAdd`, {
      segmentId,
      segmentMembers
    }), this.notifications)).response;
  }

  async deleteSegmentMembers(listType: string, segmentId: string, segmentMembers) {
    const params: HttpParams = this.commonDataService.toHttpParams({segmentId, segmentMembers});
    return (await this.commonDataService.responseFrom(this.logger, this.http.delete<ApiResponse>(`${this.BASE_URL}/${listType}/segmentMembersDel`, {params}), this.notifications)).response;
  }

  async resetSegment(listType: string, segmentId: string) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentReset`, {segmentId}), this.notifications)).response;
  }

  async renameSegment(listType: string, segmentId: string, segmentName: string) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${listType}/segmentRename`, {
      segmentId,
      segmentName
    }), this.notifications)).response;
  }

  async deleteSegment(listType: string, segmentId: string) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.delete<ApiResponse>(`${this.BASE_URL}/${listType}/segmentDel/${segmentId}`), this.notifications)).response;
  }

  async listSegments(listType: string) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/${listType}/segments`), this.notifications)).response;
  }

  async listSubscribers(listType: string): Promise<MailchimpListResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/${listType}`), this.notifications)).response;
  }

  async batchUnsubscribe(listType: string, subscribers): Promise<MailchimpBatchSubscriptionResponse> {
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
          const member = this.mailchimpListSubscriptionService.responseToMember(listType, allMembers, subscriber);
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
      .filter(subscriber => this.mailchimpListSubscriptionService.includeInUnsubscribe(listType, allMembers, subscriber))
      .map(subscriber => ({
        email: subscriber.email,
        euid: subscriber.euid,
        leid: subscriber.leid
      }));
  }

}
