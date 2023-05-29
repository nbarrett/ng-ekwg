import { Request } from "express";
import { UploadedFile } from "../../../projects/ngx-ramblers/src/app/models/aws-object.model";
import { MailchimpConfigResponse } from "../../../projects/ngx-ramblers/src/app/models/mailchimp.model";

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
  config: MailchimpConfigResponse;
  mailchimp: any;
}
