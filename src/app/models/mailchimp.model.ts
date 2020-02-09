export interface MailchimpConfig {
  id: string;
  mailchimp: {
    "apiUrl": string;
    "lists": {
      "walks": string;
      "socialEvents": string;
      "general": string
    };
    "segments": {
      "walks": {};
      "socialEvents": {};
      "general": {
        "passwordResetSegmentId": number;
        "forgottenPasswordSegmentId": number;
        "welcomeSegmentId": number;
        "committeeSegmentId": number;
        "expiredMembersSegmentId": number;
        "expiredMembersWarningSegmentId": number
      }
    };
    "campaigns": {
      "walkNotification": {
        "campaignId": string;
        "name": string
      };
      "expenseNotification": {
        "campaignId": string;
        "name": string
      };
      "passwordReset": {
        "campaignId": string;
        "name": string;
        "monthsInPast": number
      };
      "forgottenPassword": {
        "campaignId": string;
        "name": string
      };
      "welcome": {
        "campaignId": string;
        "name": string;
        "monthsInPast": number
      };
      "socialEvents": {
        "campaignId": string;
        "name": string
      };
      "committee": {
        "campaignId": string;
        "name": string
      };
      "expiredMembers": {
        "campaignId": string;
        "name": string;
        "monthsInPast": number
      };
      "newsletter": {
        "campaignId": string;
        "name": string
      };
      "expiredMembersWarning": {
        "campaignId": string;
        "name": string;
        "monthsInPast": number
      }
    }
  };
}

export interface MailchimpBatchSubscriptionResponse {
  error_count: number;
  updates: object[];
  add_count: number;
  adds;
  update_count;
  errors;
}
