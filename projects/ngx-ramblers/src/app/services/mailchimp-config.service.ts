import { Injectable } from "@angular/core";
import { ConfigKey } from "../models/config.model";
import { CampaignConfig, MailchimpConfig } from "../models/mailchimp.model";
import { ConfigService } from "./config.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpConfigService {

  constructor(private config: ConfigService) {
  }

  async getConfig(): Promise<MailchimpConfig> {
    return await this.config.queryConfig<MailchimpConfig>(ConfigKey.MAILCHIMP, {
        apiUrl: null,
        apiKey: null,
        allowSendCampaign: false,
        mailchimpEnabled: false,
        lists: {
          walks: null,
          socialEvents: null,
          general: null
        },
        segments: {
          walks: {},
          socialEvents: {},
          general: {
            passwordResetSegmentId: null,
            forgottenPasswordSegmentId: null,
            welcomeSegmentId: null,
            committeeSegmentId: null,
            expiredMembersSegmentId: null,
            expiredMembersWarningSegmentId: null
          }
        },
        campaigns: {
          walkNotification: {campaignId: null, name: null, monthsInPast: null},
          expenseNotification: {campaignId: null, name: null, monthsInPast: null},
          passwordReset: {campaignId: null, name: null, monthsInPast: null},
          forgottenPassword: {campaignId: null, name: null, monthsInPast: null},
          welcome: {campaignId: null, name: null, monthsInPast: null},
          socialEvents: {campaignId: null, name: null, monthsInPast: null},
          committee: {campaignId: null, name: null, monthsInPast: null},
          expiredMembers: {campaignId: null, name: null, monthsInPast: null},
          newsletter: {campaignId: null, name: null, monthsInPast: null},
          expiredMembersWarning: {campaignId: null, name: null, monthsInPast: null},
        }
      }
    );
  }

  saveConfig(config: MailchimpConfig) {
    return this.config.saveConfig<MailchimpConfig>(ConfigKey.MAILCHIMP, config);
  }

}
