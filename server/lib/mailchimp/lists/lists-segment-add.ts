import { Request, Response } from "express";
import { MailchimpApiError, MailchimpListingResponse } from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { MailchimpConfigData, MailchimpCreateSegmentRequest } from "../../shared/server-models";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageProcessing from "../mailchimp-message-processing";
import debug from "debug";

const messageType = "mailchimp:lists:list";
const debugLog = debug(envConfig.logNamespace(messageType));

export function listsSegmentAdd(req: Request, res: Response): Promise<void> {

  return configuredMailchimp().then((config: MailchimpConfigData) => {
    const requestData: MailchimpCreateSegmentRequest = {
      list_id: messageProcessing.listTypeToId(req, debugLog, config.config),
      name: req.body.segmentName,
      static_segment: [],
      options: null
    };
    return config.client.lists.createSegment(requestData).then((responseData: MailchimpListingResponse) => {
      messageProcessing.successfulResponse(req, res, responseData, messageType, debugLog);
    });
  }).catch((error: MailchimpApiError) => {
    messageProcessing.unsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
