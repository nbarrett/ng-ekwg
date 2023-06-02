import { ApiResponse } from "./api-response.model";
import { AuditStatus } from "./audit";

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

export interface MailchimpListsMembersResponse {
  list_id: string;
  members: MailchimpListMember[];
}

export interface MailchimpListingResponse {
  lists: MailchimpList[],
  total_items: number;
  constraints: {
    may_create: boolean;
    max_instances: number;
    current_total_instances: number
  },
  _links: Link[]
}

export interface MailchimpList {
  id: string;
  web_id: number;
  name: string;
  contact: {
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  },
  permission_reminder: string;
  use_archive_bar: false,
  campaign_defaults: {
    from_name: string;
    from_email: string;
    subject: string;
    language: string;
  },
  notify_on_subscribe: false,
  notify_on_unsubscribe: false,
  date_created: string;
  list_rating: number;
  email_type_option: boolean;
  subscribe_url_short: string;
  subscribe_url_long: string;
  beamer_address: string;
  visibility: string;
  double_optin: false,
  has_welcome: false,
  marketing_permissions: false,
  modules: string[];
  stats: {
    member_count: number;
    total_contacts: number;
    unsubscribe_count: number;
    cleaned_count: number;
    member_count_since_send: number;
    unsubscribe_count_since_send: number;
    cleaned_count_since_send: number;
    campaign_count: number;
    campaign_last_sent: string;
    merge_field_count: number;
    avg_sub_rate: number;
    avg_unsub_rate: number;
    target_sub_rate: number;
    open_rate: number;
    click_rate: number;
    last_sub_date: string;
    last_unsub_date: string;
  },
  _links: Link[]
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
  start: number;
  limit: number;
  concise: boolean;
  status: string;
  query?: string;
}

export interface MailchimpCampaignListResponse {
  campaigns: MailchimpCampaign[];
  total_items: number;
  _links: Link[];
}

export interface MailchimpCampaignListResponseVersion2 {
  total: number;
  errors: any[];
  data: MailchimpCampaignVersion2[];
}

export interface MailchimpCampaign {
  id: string;
  web_id: number;
  parent_campaign_id: string;
  type: string;
  create_time: string;
  archive_url: string;
  long_archive_url: string;
  status: string;
  emails_sent: number;
  send_time: string;
  content_type: string;
  needs_block_refresh: boolean;
  resendable: boolean;
  recipients: {
    list_id: string;
    list_is_active: boolean;
    list_name: string;
    segment_text: string;
    recipient_count: number;
    segment_opts: {
      saved_segment_id: number;
      prebuilt_segment_id: string;
      match: string;
      conditions: string[];
    }
  };
  settings: {
    subject_line: string;
    preview_text: string;
    title: string;
    from_name: string;
    reply_to: string;
    use_conversation: boolean;
    to_name: string;
    folder_id: string;
    authenticate: boolean;
    auto_footer: boolean;
    inline_css: boolean;
    auto_tweet: boolean;
    auto_fb_post: string[];
    fb_comments: boolean;
    timewarp: boolean;
    template_id: number;
    drag_and_drop: boolean;
  };
  variate_settings: {
    winning_combination_id: string;
    winning_campaign_id: string;
    winner_criteria: string;
    wait_time: number;
    test_size: number;
    subject_lines: string[];
    send_times: string[];
    from_names: string[];
    reply_to_addresses: string[];
    contents: string[];
    combinations: [
      {
        id: string;
        subject_line: number;
        send_time: number;
        from_name: number;
        reply_to: number;
        content_description: number;
        recipients: number
      }
    ]
  };
  tracking: {
    opens: boolean;
    html_clicks: boolean;
    text_clicks: boolean;
    goal_tracking: boolean;
    ecomm360: boolean;
    google_analytics: string;
    clicktale: string;
    salesforce: {
      campaign: boolean;
      notes: boolean;
    };
    capsule: {
      notes: boolean;
    }
  };
  rss_opts: {
    feed_url: string;
    frequency: string;
    schedule: {
      hour: number;
      daily_send: {
        sunday: boolean;
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
      };
      weekly_send_day: string;
      monthly_send_date: number
    };
    last_sent: string;
    constrain_rss_img: boolean;
  };
  ab_split_opts: {
    split_test: string;
    pick_winner: string;
    wait_units: string;
    wait_time: number;
    split_size: number;
    from_name_a: string;
    from_name_b: string;
    reply_email_a: string;
    reply_email_b: string;
    subject_a: string;
    subject_b: string;
    send_time_a: string;
    send_time_b: string;
    send_time_winner: string;
  };
  social_card: {
    image_url: string;
    description: string;
    title: string;
  };
  report_summary: {
    opens: number;
    unique_opens: number;
    open_rate: number;
    clicks: number;
    subscriber_clicks: number;
    click_rate: number;
    ecommerce: {
      total_orders: number;
      total_spent: number;
      total_revenue: number
    }
  };
  delivery_status: {
    enabled: boolean;
    can_cancel: boolean;
    status: string;
    emails_sent: number;
    emails_canceled: number
  };
  _links: Link[];
}

export interface MailchimpCampaignVersion2 {
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

export interface SaveSegmentResponse {
  segment: { id: number };
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

export interface MailchimpCampaignSearchResponse {
  results: [
    {
      campaign: {
        id: string;
        web_id: number;
        parent_campaign_id: string;
        type: string;
        create_time: string;
        archive_url: string;
        long_archive_url: string;
        status: string;
        emails_sent: number;
        send_time: string;
        content_type: string;
        needs_block_refresh: boolean;
        resendable: boolean;
        recipients: {
          list_id: string;
          list_is_active: boolean;
          list_name: string;
          segment_text: string;
          recipient_count: number;
          segment_opts: {
            saved_segment_id: number;
            prebuilt_segment_id: string;
            match: string;
            conditions: string[];
          }
        };
        settings: {
          subject_line: string;
          preview_text: string;
          title: string;
          from_name: string;
          reply_to: string;
          use_conversation: boolean;
          to_name: string;
          folder_id: string;
          authenticate: boolean;
          auto_footer: boolean;
          inline_css: boolean;
          auto_tweet: boolean;
          auto_fb_post: string[];
          fb_comments: boolean;
          timewarp: boolean;
          template_id: number;
          drag_and_drop: boolean;
        },
        variate_settings: {
          winning_combination_id: string;
          winning_campaign_id: string;
          winner_criteria: string;
          wait_time: number;
          test_size: number;
          subject_lines: string[];
          send_times: string[];
          from_names: string[];
          reply_to_addresses: string[];
          contents: string[];
          combinations: [
            {
              id: string;
              subject_line: number;
              send_time: number;
              from_name: number;
              reply_to: number;
              content_description: number;
              recipients: number;
            }
          ]
        },
        tracking: {
          opens: boolean;
          html_clicks: boolean;
          text_clicks: boolean;
          goal_tracking: boolean;
          ecomm360: boolean;
          google_analytics: string;
          clicktale: string;
          salesforce: {
            campaign: boolean;
            notes: boolean;
          },
          capsule: {
            notes: boolean;
          }
        },
        rss_opts: {
          feed_url: string;
          frequency: string;
          schedule: {
            hour: number;
            daily_send: {
              sunday: boolean;
              monday: boolean;
              tuesday: boolean;
              wednesday: boolean;
              thursday: boolean;
              friday: boolean;
              saturday: boolean;
            },
            weekly_send_day: string;
            monthly_send_date: number;
          },
          last_sent: string;
          constrain_rss_img: boolean;
        },
        ab_split_opts: {
          split_test: string;
          pick_winner: string;
          wait_units: string;
          wait_time: number;
          split_size: 1,
          from_name_a: string;
          from_name_b: string;
          reply_email_a: string;
          reply_email_b: string;
          subject_a: string;
          subject_b: string;
          send_time_a: string;
          send_time_b: string;
          send_time_winner: string;
        },
        social_card: {
          image_url: string;
          description: string;
          title: string;
        },
        report_summary: {
          opens: number;
          unique_opens: number;
          open_rate: number;
          clicks: number;
          subscriber_clicks: number;
          click_rate: number;
          ecommerce: {
            total_orders: number;
            total_spent: number;
            total_revenue: number;
          }
        },
        delivery_status: {
          enabled: boolean;
          can_cancel: boolean;
          status: string;
          emails_sent: number;
          emails_canceled: number;
        },
        _links: [
          {
            rel: string;
            href: string;
            method: string;
            targetSchema: string;
            schema: string;
          }
        ]
      },
      snippet: string;
    }
  ],
  total_items: number;
  _links: [
    {
      rel: string;
      href: string;
      method: string;
      targetSchema: string;
      schema: string;
    }
  ]
}

export interface MailchimpCampaignReplicateResponse {
  id: string;
  web_id: number;
  parent_campaign_id: string;
  type: string;
  create_time: string;
  archive_url: string;
  long_archive_url: string;
  status: string;
  emails_sent: number;
  send_time: string;
  content_type: string;
  needs_block_refresh: boolean;
  resendable: boolean;
  recipients: {
    list_id: string;
    list_name: string;
    segment_text: string;
    recipient_count: number;
    segment_opts: {
      saved_segment_id: number;
      prebuilt_segment_id: string;
      match: string;
      conditions: string[];
    }
  };
  settings: {
    subject_line: string;
    preview_text: string;
    title: string;
    from_name: string;
    reply_to: string;
    use_conversation: boolean;
    to_name: string;
    folder_id: string;
    authenticate: boolean;
    auto_footer: boolean;
    inline_css: boolean;
    auto_tweet: boolean;
    auto_fb_post: string[];
    fb_comments: boolean;
    timewarp: boolean;
    template_id: number;
    drag_and_drop: boolean
  };
  variate_settings: {
    winning_combination_id: string;
    winning_campaign_id: string;
    winner_criteria: string;
    wait_time: number;
    test_size: number;
    subject_lines: string[];
    send_times: string[];
    from_names: string[];
    reply_to_addresses: string[];
    contents: string[];
    combinations: [
      {
        id: string;
        subject_line: number;
        send_time: number;
        from_name: number;
        reply_to: number;
        content_description: number;
        recipients: number
      }
    ]
  };
  tracking: {
    opens: boolean;
    html_clicks: boolean;
    text_clicks: boolean;
    goal_tracking: boolean;
    ecomm360: boolean;
    google_analytics: string;
    clicktale: string;
    salesforce: {
      campaign: boolean;
      notes: boolean
    };
    capsule: {
      notes: boolean
    }
  };
  rss_opts: {
    feed_url: string[];
    frequency: string[];
    schedule: {
      hour: number;
      daily_send: {
        sunday: boolean;
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean
      };
      weekly_send_day: string[];
      monthly_send_date: number
    };
    last_sent: string[];
    constrain_rss_img: boolean
  };
  ab_split_opts: {
    split_test: string[];
    pick_winner: string[];
    wait_units: string[];
    wait_time: number;
    split_size: number;
    from_name_a: string;
    from_name_b: string;
    reply_email_a: string;
    reply_email_b: string;
    subject_a: string;
    subject_b: string;
    send_time_a: string[];
    send_time_b: string[];
    send_time_winner: string[];
  };
  social_card: {
    image_url: string[];
    description: string[];
    title: string[];
  };
  report_summary: {
    opens: number;
    unique_opens: number;
    open_rate: number;
    clicks: number;
    subscriber_clicks: number;
    click_rate: number;
    ecommerce: {
      total_orders: number;
      total_spent: number;
      total_revenue: number
    }
  };
  delivery_status: {
    enabled: boolean;
    can_cancel: boolean;
    status: string[];
    emails_sent: number;
    emails_canceled: number
  };
  _links: Link[];
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
