import { Request, Response } from "express";
import { MailchimpApiError, MailchimpListingResponse } from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { MailchimpConfigData, MailchimpDeleteSegmentRequest } from "../../shared/server-models";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageProcessing from "../mailchimp-message-processing";
import debug from "debug";

const messageType = "mailchimp:lists:segment-delete";
const debugLog = debug(envConfig.logNamespace(messageType));

export function listsSegmentDelete(req: Request, res: Response): Promise<void> {

  return configuredMailchimp().then((mailchimpConfigData: MailchimpConfigData) => {
    const requestData: MailchimpDeleteSegmentRequest = {
      list_id: messageProcessing.listTypeToId(req, debugLog, mailchimpConfigData.config),
      segment_id: req.body.segmentId,
    };
    return mailchimpConfigData.client.lists.deleteSegment(requestData)
      .then((responseData: MailchimpListingResponse) => {
        messageProcessing.successfulResponse(req, res, responseData, messageType, debugLog);
      });
  }).catch((error: MailchimpApiError) => {
    messageProcessing.unsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
