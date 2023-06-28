import { lists } from "@mailchimp/mailchimp_marketing";
import { Request } from "express";
import { UploadedFile } from "../../../projects/ngx-ramblers/src/app/models/aws-object.model";
import {
  MailchimpBatchSegmentAddOrRemoveRequest,
  MailchimpCampaignContentUpdateRequest,
  MailchimpCampaignListResponse,
  MailchimpCampaignReplicateResponse,
  MailchimpCampaignSearchResponse,
  MailchimpCampaignSendResponse,
  MailchimpCampaignUpdateRequest, MailchimpConfig,
  MailchimpListingResponse,
  MailchimpListSegmentBatchAddOrRemoveMembersResponse,
  MailchimpListsMembersResponse,
  MailchimpSegmentUpdateResponse,
  MailchimpSetContentResponse
} from "../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import BatchListMembersResponse = lists.BatchListMembersResponse;

export interface MessageHandlerOptions {
  req: any;
  body?: any;
  mapper?: (parsedDataJSON: any) => any;
  apiRequest: any;
  successStatusCodes?: number[];
  res: any;
  debug: (...args: any) => void;
}

export interface MulterRequest extends Request {
  file: UploadedFile;
  files: UploadedFile[];
}

export interface MailchimpMarketingApiClient {
  campaigns: {
    setContent(campaignId: string, mailchimpCampaignContentUpdateRequest: MailchimpCampaignContentUpdateRequest): Promise<MailchimpSetContentResponse>;
    list(mailchimpCampaignListRequest: MailchimpCampaignListRequest): Promise<MailchimpCampaignListResponse>;
    replicate(campaignId: string): Promise<MailchimpCampaignReplicateResponse>;
    send(campaignId: string): Promise<MailchimpCampaignSendResponse>;
    update(campaignId: string, mailchimpCampaignListRequest: MailchimpCampaignUpdateRequest): Promise<MailchimpCampaignUpdateRequest>;
    getContent(campaignId: string, options: MailchimpCampaignSearchRequestOptions): Promise<MailchimpCampaignSearchResponse>;
  };
  searchCampaigns: {
    search(query: string, options: MailchimpCampaignSearchRequestOptions): Promise<MailchimpCampaignSearchResponse>;
  };
  lists: {
    updateSegment(listId, segmentId, clientRequest): Promise<MailchimpSegmentUpdateResponse>;
    getListMembersInfo(listId: string, mailchimpListMembersRequest: MailchimpListMembersRequest): Promise<MailchimpListsMembersResponse>;
    getAllLists(listOptions: MailchimpListsRequest): Promise<MailchimpListingResponse>;
    batchListMembers(listId: string, body: lists.BatchListMembersBody, options: lists.BatchListMembersOpts): Promise<BatchListMembersResponse>;
    createSegment(listId: string, requestData: MailchimpCreateSegmentRequest): Promise<MailchimpListingResponse>;
    deleteSegment(listId: string, segmentId: string): Promise<MailchimpListingResponse>;
    batchSegmentMembers(bodyParameters: MailchimpBatchSegmentAddOrRemoveRequest, listId: string, segmentId: number): Promise<MailchimpListSegmentBatchAddOrRemoveMembersResponse>;
  };
}

export interface MailchimpConfigData {
  config: MailchimpConfig;
  client: MailchimpMarketingApiClient;
}

export interface MailchimpListsRequest {
  fields: string[];
  offset: number;
  count: number;
}

export interface MailchimpUpdateSegmentBodyParameters {
  name: string;
  static_segment?: string[];
}

export interface MailchimpCampaignListRequest {
  fields?: string[];
  query?: string;
  exclude_fields?: string[];
  count?: number;
  offset?: number;
  type?: string;
  status?: string;
  before_send_time?: string;
  since_send_time?: string;
  before_create_time?: string;
  since_create_time?: string;
  list_id?: string;
  folder_id?: string;
  member_id?: string;
  sort_field?: string;
  sort_dir?: string;
}

export interface MailchimpCampaignSearchRequestOptions {
  fields: string[];
  exclude_fields?: string[];
}

export interface MailchimpListMembersRequest {
  fields: string[];
  status: string;
  offset: number;
  count: number;
}

export interface MailchimpCreateSegmentRequest {
  name: any;
  static_segment: string[];
  options?: object;
}
