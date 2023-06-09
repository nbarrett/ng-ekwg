import { Request } from "express";
import { UploadedFile } from "../../../projects/ngx-ramblers/src/app/models/aws-object.model";
import { MailchimpConfig, MailchimpConfigResponse } from "../../../projects/ngx-ramblers/src/app/models/mailchimp.model";

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

export interface MailchimpConfigData {
  config: MailchimpConfig;
  mailchimp: any;
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
