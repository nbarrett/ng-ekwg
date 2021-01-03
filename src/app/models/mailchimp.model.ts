import { ApiResponse } from "./api-response.model";

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
    walkNotification: CampaignConfig;
    expenseNotification: CampaignConfig;
    passwordReset: CampaignConfig;
    forgottenPassword: CampaignConfig;
    welcome: CampaignConfig;
    socialEvents: CampaignConfig;
    committee: CampaignConfig;
    expiredMembers: CampaignConfig;
    newsletter: CampaignConfig;
    expiredMembersWarning: CampaignConfig;
  };
}

export enum SubscriptionStatus {
  Subscribed = "subscribed",
}

export interface CampaignConfig {
  campaignId: string;
  name: string;
  monthsInPast?: number;
}

export interface MergeFields {
  EMAIL?: string;
  FNAME: string;
  LNAME: string;
  MEMBER_NUM: string;
  USERNAME: string;
  PW_RESET: string;
  MEMBER_EXP: string;
}

export interface MergeVariablesRequest {
  merge_vars: MergeFields;
}

export interface MailchimpMemberIdentifiers {
  email_address: string;
  unique_email_id: string;
  web_id: number;
}

export interface MailchimpListMember extends MailchimpMemberIdentifiers {
  status: SubscriptionStatus;
  merge_fields: MergeFields;
  last_changed: Date;
}

export interface MailchimpListResponse {
  list_id: string;
  members: MailchimpListMember[];
}

export interface SubscriberIdentifiersWithError {
  code: number;
  email: SubscriberIdentifiers;
  error: string;
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

export function toMailchimpMemberIdentifiers(subscriberIdentifiers: SubscriberIdentifiers): MailchimpMemberIdentifiers {
  return {
    unique_email_id: subscriberIdentifiers.euid,
    web_id: subscriberIdentifiers.leid,
    email_address: subscriberIdentifiers.email
  };
}

export type SubscriptionRequest = SubscriberIdentifiers | MergeVariablesRequest & MailchimpSubscription;

export interface MailchimpBatchSubscriptionResponse {
  error_count: number;
  updates: SubscriberIdentifiers[];
  add_count: number;
  adds: SubscriberIdentifiers[];
  update_count: number;
  errors: SubscriberIdentifiersWithError[];
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
  title?: string;
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

export interface MailchimpListAudit {
  id?: string;
  memberId: string;
  timestamp: number;
  listType: string;
  status: AuditStatus;
  audit: any;
}

export enum AuditStatus {
  warning = "warning",
  error = "error",
}

export interface MailchimpListAuditApiResponse extends ApiResponse {
  request: any;
  response?: MailchimpListAudit | MailchimpListAudit[];
}
