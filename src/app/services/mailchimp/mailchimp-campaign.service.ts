import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
import {
  MailchimpCampaignListRequest,
  MailchimpCampaignListResponse,
  MailchimpCampaignReplicateIdentifiersResponse,
  MailchimpCampaignReplicateResponse,
  MailchimpCampaignSendRequest,
  MailchimpCampaignSendResponse,
  MailchimpCampaignUpdateResponse
} from "../../models/mailchimp.model";
import { CommonDataService } from "../common-data-service";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberService } from "../member/member.service";
import { StringUtilsService } from "../string-utils.service";
import { MailchimpListSubscriptionService } from "./mailchimp-list-subscription.service";
import { MailchimpListService } from "./mailchimp-list.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpCampaignService {
  private logger: Logger;
  private BASE_URL = "api/mailchimp/campaigns";
  private campaignNotifications = new Subject<ApiResponse>();
  private allowSendCampaign: boolean;

  constructor(private stringUtils: StringUtilsService,
              private http: HttpClient,
              private dateUtils: DateUtilsService,
              private memberService: MemberService,
              private commonDataService: CommonDataService,
              private mailchimpListSubscriptionService: MailchimpListSubscriptionService,
              private mailchimpListService: MailchimpListService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpCampaignService, NgxLoggerLevel.DEBUG);
    this.allowSendCampaign = true;
  }

  async addCampaign(campaignId, campaignName) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/campaignAdd`, {campaignName}), this.campaignNotifications)).response;
  }

  async deleteCampaign(campaignId) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.delete<ApiResponse>(`${this.BASE_URL}/${campaignId}/delete`), this.campaignNotifications)).response;
  }

  async getContent(campaignId) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/${campaignId}/content`), this.campaignNotifications)).response;
  }

  async list(options: MailchimpCampaignListRequest): Promise<MailchimpCampaignListResponse> {
    const params: HttpParams = this.commonDataService.toHttpParams(options);
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/list`, {params}), this.campaignNotifications)).response;
  }

  setOrClearSegment(replicatedCampaignId: string, segmentId?: number): Promise<MailchimpCampaignUpdateResponse> {
    if (segmentId) {
      return this.setSegmentId(replicatedCampaignId, segmentId);
    } else {
      return this.clearSegment(replicatedCampaignId);
    }
  }

  setSegmentId(campaignId: string, segmentId: number): Promise<MailchimpCampaignUpdateResponse> {
    return this.setSegmentOpts(campaignId, {saved_segment_id: segmentId});
  }

  clearSegment(campaignId: string): Promise<MailchimpCampaignUpdateResponse> {
    return this.setSegmentOpts(campaignId, {});
  }

  async setContent(campaignId, contentSections): Promise<MailchimpCampaignUpdateResponse> {
    return await this.updateCampaign(campaignId, {
      updates: {
        name: "content",
        value: contentSections
      }
    });
  }

  async setSegmentOpts(campaignId: string, value?: any): Promise<MailchimpCampaignUpdateResponse> {
    return await this.updateCampaign(campaignId, {
      updates: {
        name: "segment_opts",
        value
      }
    });
  }

  async setCampaignOptions(campaignId, campaignName, otherOptions): Promise<MailchimpCampaignUpdateResponse> {
    return await this.updateCampaign(campaignId, {
      updates: {
        name: "options",
        value: {
          ...{
            title: campaignName.substring(0, 99),
            subject: campaignName
          },
          ...otherOptions
        }
      }
    });
  }

  private async updateCampaign(campaignId, body: { updates: { name: string; value: any } }) {
    const apiResponse = await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/update`, body), this.campaignNotifications);
    return apiResponse.error ? Promise.reject("campaign update failed due to error: " + this.stringUtils.stringifyObject(apiResponse.error)) : apiResponse.response;
  }

  async replicateCampaign(campaignId): Promise<MailchimpCampaignReplicateResponse> {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/replicate`, {}), this.campaignNotifications)).response;
  }

  async sendCampaign(campaignId: string): Promise<MailchimpCampaignSendResponse> {
    if (!this.allowSendCampaign) {
      const reason = "You cannot send campaigns as sending has been disabled in this release of the application";
      this.logger.error(reason);
      return Promise.reject(reason);
    }
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/send`, {}), this.campaignNotifications)).response;
  }

  async listCampaigns() {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/list`, {}), this.campaignNotifications)).response;
  }

  replicateAndSendWithOptions(campaignRequest: MailchimpCampaignSendRequest): Promise<MailchimpCampaignReplicateIdentifiersResponse> {
    return this.replicateCampaign(campaignRequest.campaignId)
      .then((replicateCampaignResponse) => {
        return this.setCampaignOptions(replicateCampaignResponse.id, campaignRequest.campaignName, campaignRequest.otherSegmentOptions)
          .then(() => this.setContent(replicateCampaignResponse.id, campaignRequest.contentSections)
            .then(() => this.setOrClearSegment(replicateCampaignResponse.id, campaignRequest.segmentId)
              .then(() =>
                campaignRequest.dontSend ? Promise.resolve({complete: false, web_id: replicateCampaignResponse.web_id}) :
                  this.sendCampaign(replicateCampaignResponse.id)
                    .then((sendCampaignResponse) => ({...sendCampaignResponse, ...{web_id: replicateCampaignResponse.web_id}})))));
      });
  }
}
