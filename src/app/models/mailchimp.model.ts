export interface MailchimpConfigResponse {
  id: string;
  mailchimp: MailchimpConfig;
}

export interface MailchimpConfig {
  apiUrl: string;
  lists: {
    walks: string;
    socialEvents: string;
    general: string
  };
  segments: {
    walks: {};
    socialEvents: {};
    general: {
      passwordResetSegmentId: number;
      forgottenPasswordSegmentId: number;
      welcomeSegmentId: number;
      committeeSegmentId: number;
      expiredMembersSegmentId: number;
      expiredMembersWarningSegmentId: number
    }
  };
  campaigns: {
    walkNotification: {
      campaignId: string;
      name: string
    };
    expenseNotification: {
      campaignId: string;
      name: string
    };
    passwordReset: {
      campaignId: string;
      name: string;
      monthsInPast: number
    };
    forgottenPassword: {
      campaignId: string;
      name: string
    };
    welcome: {
      campaignId: string;
      name: string;
      monthsInPast: number
    };
    socialEvents: {
      campaignId: string;
      name: string
    };
    committee: {
      campaignId: string;
      name: string
    };
    expiredMembers: {
      campaignId: string;
      name: string;
      monthsInPast: number
    };
    newsletter: {
      campaignId: string;
      name: string
    };
    expiredMembersWarning: {
      campaignId: string;
      name: string;
      monthsInPast: number
    }
  };
}

export interface MergeVariables {
  EMAIL?: string;
  FNAME: string;
  LNAME: string;
  MEMBER_NUM: string;
  USERNAME: string;
  PW_RESET: string;
  MEMBER_EXP: string;
}

export interface MergeVariablesRequest {
  merge_vars: MergeVariables;
}

export interface MailchimpSubscriber {
  email: string;
  id: string;
  euid: string;
  email_type: string;
  ip_signup: string;
  timestamp_signup: string;
  ip_opt: string;
  timestamp_opt: string;
  member_rating: number;
  info_changed: string;
  web_id: number;
  leid: number;
  language: string;
  list_id: string;
  list_name: string;
  merges: MergeVariables;
  status: string;
  timestamp: string;
  is_gmonkey: false;
  lists: [
    {
      id: string;
      status: string
    }];
  geo: {
    latitude: string;
    longitude: string;
    gmtoff: string;
    dstoff: string;
    timezone: string;
    cc: string;
    region: string;
  };
  clients: {
    name: string;
    icon_url: string;
  };
  static_segments: [
    {
      id: number;
      name: string;
      added: string
    }];
  notes: [];
}

export interface MailchimpListResponse {
  total: number;
  data: MailchimpSubscriber[];
}

export interface MailchimpSubscription {
  subscribed?: boolean;
  updated?: boolean;
  leid?: string;
  lastUpdated?: number;
  email?: SubscriberIdentifiers;
}

export interface SubscriberIdentifiers {
  email: string;
  euid?: string;
  leid?: number;
}

export type SubscriptionRequest = SubscriberIdentifiers | MergeVariablesRequest & MailchimpSubscription;

export interface MailchimpBatchSubscriptionResponse {
  error_count: number;
  updates: SubscriberIdentifiers[];
  add_count: number;
  adds: SubscriberIdentifiers[];
  update_count: number;
  errors: any[];
}

export interface MailchimpBatchUnsubscribeResponse {
  success_count: number;
  error_count: number;
  errors: any[];
}

export interface MailchimpListSegmentResetResponse {
  complete: boolean;
}

export interface MailchimpListSegmentAddResponse {
  id: number;
  status: string;
  code: number;
  name: string;
  error: string;
}

export interface MailchimpListDeleteSegmentMembersResponse {
  complete: boolean;
}

export interface MailchimpListSegmentRenameResponse {
  complete: boolean;
}

export interface MailchimpListSegmentDeleteResponse {
  complete: boolean;
}

export interface MailchimpListSegmentMembersAddResponse {
  success_count: number;
  error_count: number;
  errors: [];
}

export interface MailchimpCampaignListRequest {
  limit: number;
  concise: boolean;
  status: string;
  title: string;
}

export interface MailchimpCampaignListResponse {
  total: number;
  errors: any[];
  data: MailchimpCampaign[];
}

export interface SaveSegmentResponse {
  segment: { id: number };
}

export interface MailchimpCampaign {
  id: string;
  web_id: number;
  list_id: string;
  template_id: number;
  title: string;
  subject: string;
  saved_segment: {
    id: number;
    type: string;
    name: string;
  };
  status: string;
  from_name: string;
  archive_url_long: string;
  create_time: number;
}

export interface MailchimpCampaignSendRequest {
  dontSend?: boolean;
  campaignId: string;
  campaignName: string;
  segmentId?: number;
  contentSections?: MailchimpExpenseOtherContent | MailchimpGenericOtherContent;
  otherSegmentOptions?: any;
}

export interface MailchimpExpenseOtherContent {
  sections: {
    expense_id_url: string;
    expense_notification_text: string;
  };
}

export interface MailchimpGenericOtherContent {
  sections: {
    notification_text: string;
  };
}

export interface MailchimpCampaignReplicateResponse {
  id: string;
  web_id: number;
  list_id: string;
  folder_id: number;
  template_id: number;
  content_type: string;
  content_edited_by: string;
  title: string;
  type: string;
  create_time: string;
  send_time: string;
  content_updated_time: string;
  status: string;
  from_name: string;
  from_email: string;
  subject: string;
  to_name: string;
  archive_url: string;
  archive_url_long: string;
  emails_sent: number;
  inline_css: boolean;
  analytics: string;
  analytics_tag: string;
  authenticate: boolean;
  ecomm360: boolean;
  auto_tweet: boolean;
  auto_fb_post: boolean;
  auto_footer: boolean;
  timewarp: boolean;
  timewarp_schedule: string;
  tracking: {
    html_clicks: boolean;
    text_clicks: boolean;
    opens: true
  };
  parent_id: string;
  is_child: boolean;
  tests_sent: number;
  tests_remain: number;
  segment_text: string;
  segment_opts: {
    match: string;
    conditions: [
      {
        field: string;
        op: string;
        value: number;
      }
    ]
  };
  saved_segment: {
    id: number;
    type: string;
    name: string;
  };
  type_opts: [];
}

export interface MailchimpCampaignUpdateResponse {
  data: MailchimpCampaignReplicateResponse;
  errors: [];
}

export interface MailchimpCampaignSendResponse {
  complete: boolean;
}

export interface MailchimpCampaignReplicateIdentifiersResponse extends MailchimpCampaignSendResponse {
  web_id?: number;
}

