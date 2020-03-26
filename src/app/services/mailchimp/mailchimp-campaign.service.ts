import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { extend } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { ApiResponse } from "../../models/api-response.model";
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
  private allowSendCampaign: false;

  constructor(private stringUtils: StringUtilsService,
              private http: HttpClient,
              private dateUtils: DateUtilsService,
              private memberService: MemberService,
              private commonDataService: CommonDataService,
              private mailchimpListSubscriptionService: MailchimpListSubscriptionService,
              private mailchimpListService: MailchimpListService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpCampaignService, NgxLoggerLevel.DEBUG);
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

  async list(options) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/list`), this.campaignNotifications)).response;
  }

  async setContent(campaignId, contentSections) {
    return contentSections ? (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/update`, {
      updates: {
        name: "content",
        value: contentSections
      }
    }), this.campaignNotifications)).response : Promise.resolve({
      result: "success",
      campaignId,
      message: "setContent skipped as no content provided"
    });
  }

  setOrClearSegment(replicatedCampaignId, optionalSegmentId) {
    if (optionalSegmentId) {
      return this.setSegmentId(replicatedCampaignId, optionalSegmentId);
    } else {
      return this.clearSegment(replicatedCampaignId);
    }
  }

  setSegmentId(campaignId, segmentId) {
    return this.setSegmentOpts(campaignId, {saved_segment_id: segmentId});
  }

  clearSegment(campaignId) {
    return this.setSegmentOpts(campaignId, []);
  }

  async setSegmentOpts(campaignId, value) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/update`, {
      updates: {
        name: "segment_opts",
        value
      }
    }), this.campaignNotifications)).response;
  }

  async setCampaignOptions(campaignId, campaignName, otherOptions) {
    const value = extend({}, {
      title: campaignName.substring(0, 99),
      subject: campaignName
    }, otherOptions);
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/update`, {
      updates: {
        name: "options",
        value
      }
    }), this.campaignNotifications)).response;
  }

  async replicateCampaign(campaignId) {
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/replicate`, {}), this.campaignNotifications)).response;
  }

  async sendCampaign(campaignId) {
    if (!this.allowSendCampaign) {
      return Promise.reject("You cannot send campaigns as sending has been disabled in this release of the application");
    }
    return (await this.commonDataService.responseFrom(this.logger, this.http.post<ApiResponse>(`${this.BASE_URL}/${campaignId}/send`, {}), this.campaignNotifications)).response;
  }

  async listCampaigns() {
    return (await this.commonDataService.responseFrom(this.logger, this.http.get<ApiResponse>(`${this.BASE_URL}/list`, {}), this.campaignNotifications)).response;
  }

  replicateAndSendWithOptions(options) {
    this.logger.debug("replicateAndSendWithOptions:options", options);
    return this.replicateCampaign(options.campaignId)
      .then((replicateCampaignResponse) => {
        this.logger.debug("replicateCampaignResponse", replicateCampaignResponse);
        const replicatedCampaignId = replicateCampaignResponse.id;
        return this.setCampaignOptions(replicatedCampaignId, options.campaignName, options.otherSegmentOptions)
          .then((renameResponse) => {
            this.logger.debug("renameResponse", renameResponse);
            return this.setContent(replicatedCampaignId, options.contentSections)
              .then((setContentResponse) => {
                this.logger.debug("setContentResponse", setContentResponse);
                return this.setOrClearSegment(replicatedCampaignId, options.segmentId)
                  .then((setSegmentResponse) => {
                    this.logger.debug("setSegmentResponse", setSegmentResponse);
                    return options.dontSend ? replicateCampaignResponse : this.sendCampaign(replicatedCampaignId);
                  });
              });
          });
      });
  }
}
