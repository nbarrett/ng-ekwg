import { ApiResponse } from "./api-response.model";

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

export interface Subscriber {
    "email": string;
    "id": string;
    "euid": string;
    "email_type": string;
    "ip_signup": null;
    "timestamp_signup": null;
    "ip_opt": string;
    "timestamp_opt": string;
    "member_rating": number;
    "info_changed": string;
    "web_id": number;
    "leid": number;
    "language": null;
    "list_id": string;
    "list_name": string;
    "merges": {
        "EMAIL": string;
        "FNAME": string;
        "LNAME": string;
        "MEMBER_NUM": string;
        "USERNAME": string;
        "PW_RESET": string;
        "MEMBER_EXP": string;
    };
    "status": string;
    "timestamp": string;
    "is_gmonkey": false;
    "lists": [
        {
            id: string;
            status: string
        }];
    "geo": {
        "latitude": string;
        "longitude": string;
        "gmtoff": string;
        "dstoff": string;
        "timezone": null;
        "cc": string;
        "region": string;
    };
    "clients": {
        "name": string;
        "icon_url": string;
    };
    static_segments: [
        {
            id: number;
            name: string;
            added: string
        }];
    "notes": [];
}

export interface MailchimpListResponse {
    total: number;
    data: Subscriber[];
}

export interface MailchimpSubscription {
  subscribed?: boolean;
  updated?: boolean;
  leid?: string;
  lastUpdated?: number;
  email?: { email: string, leid?: string };
}

export interface SubscriberIdentifiers {
    email: string;
    euid: string;
    leid: number;
}

export interface MailchimpListApiResponse extends ApiResponse {
    request: any;
    response?: MailchimpListResponse;
    error: any;
}

export interface MailchimpBatchSubscriptionResponse {
    error_count: number;
    updates: object[];
    add_count: number;
    adds;
    update_count;
    errors;
}

export interface MailchimpBatchSubscriptionApiResponse extends ApiResponse {
    request: any;
    response?: MailchimpBatchSubscriptionResponse;
    error: any;
}
