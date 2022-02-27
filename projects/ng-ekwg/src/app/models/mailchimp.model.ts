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
  SUBSCRIBED = "subscribed",
  UNSUBSCRIBED = "unsubscribed",
  CLEANED = "cleaned",
  PENDING = "pending"
}

export interface CampaignConfig {
  campaignId: string;
  name: string;
  monthsInPast?: number;
}

export interface MergeFields {
  EMAIL: string;
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
  unique_email_id?: string;
  web_id: number;
}

export interface MailchimpListResponse {
  list_id: string;
  members: MailchimpListMember[];
}

export interface MailchimpSubscription {
  subscribed?: boolean;
  updated?: boolean;
  leid?: number;   // will be deleted
  unique_email_id?: string;
  web_id?: number;
  lastUpdated?: number;
  email?: SubscriberIdentifiers;
}

export interface SubscriberIdentifiers {
  email: string;
  euid?: string;
  leid?: number;
}

export interface MailchimpSubscriptionMember {
  email_address: string;
  status: SubscriptionStatus;
  merge_fields: MergeFields;
}

export type SubscriptionRequest = SubscriberIdentifiers | MergeVariablesRequest & MailchimpSubscription;

export interface MailchimpBatchSubscriptionResponse {
  new_members: MailchimpMember[];
  updated_members: MailchimpMember[];
  errors: MailchimpEmailWithError[];
  total_created: number;
  total_updated: number;
  error_count: number;
  _links: Link[];
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

export interface Link {
  rel: string;
  href: string;
  method: string;
  targetSchema: string;
  schema: string;
}

export interface MailchimpEmailWithError {
  email_address: string;
  error: string;
  error_code: string;
}

export interface MailchimpListMember {
  email_address: string;
  unique_email_id: string;
  web_id: number;
  status: SubscriptionStatus;
  merge_fields: MergeFields;
  last_changed: string;
}

export interface MailchimpMember extends MailchimpMemberIdentifiers {
  id: string;
  email_address: string;
  unique_email_id: string;
  email_type: string;
  status: SubscriptionStatus;
  merge_fields: MergeFields;
  interests?: Interests;
  stats: Stats;
  ip_signup: string;
  timestamp_signup: string;
  ip_opt: string;
  timestamp_opt: string;
  member_rating: number;
  last_changed: string;
  language: string;
  vip: boolean;
  email_client: string;
  location: Location;
  last_note: LastNote;
  tags_count: number;
  tags: Tag[];
  list_id: string;
  _links: Link[];
}

export interface Interests {
  property1?: boolean;
  property2?: boolean;
}

export interface LastNote {
  note_id: number;
  created_at: string;
  created_by: string;
  note: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  gmtoff: number;
  dstoff: number;
  country_code: string;
  timezone: string;
}

export interface Stats {
  avg_open_rate: number;
  avg_click_rate: number;
}

export interface Tag {
  id: number;
  name: string;
}
