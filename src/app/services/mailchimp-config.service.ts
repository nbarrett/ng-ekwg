import { Injectable } from "@angular/core";
import { MailchimpConfigResponse } from "../models/mailchimp.model";
import { ConfigService } from "./config.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpConfigService {

  constructor(private config: ConfigService) {
  }

  getConfig(): Promise<MailchimpConfigResponse> {
    return this.config.getConfig("mailchimp", {
      mailchimp: {
        interestGroups: {
          walks: {interestGroupingId: undefined},
          socialEvents: {interestGroupingId: undefined},
          general: {interestGroupingId: undefined}
        },
        segments: {
          walks: {segmentId: undefined},
          socialEvents: {segmentId: undefined},
          general: {
            passwordResetSegmentId: undefined,
            forgottenPasswordSegmentId: undefined,
            committeeSegmentId: undefined
          }
        }
      }
    });
  }

  saveConfig(config) {
    return this.config.saveConfig("mailchimp", config);
  }

}
