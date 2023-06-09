import debug from "debug";
import { Request, Response } from "express";
import {
  MailchimpApiError,
  MailchimpListSegmentAddOrRemoveMembersRequest,
  MailchimpListSegmentBatchAddOrRemoveMembersResponse, SubscriptionRequest
} from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageProcessing from "../mailchimp-message-processing";

const messageType = "mailchimp:lists:segment-members-add-or-remove";
const debugLog = debug(envConfig.logNamespace(messageType));

export function listsSegmentMembersAddOrRemove(req: Request, res: Response): Promise<void> {

  function formatMembers(membersToAdd: SubscriptionRequest[]) {
    return membersToAdd.map(item => item.email);
  }

  return configuredMailchimp().then(config => {
    const clientRequest: MailchimpListSegmentAddOrRemoveMembersRequest = req.body;
    const listId = messageProcessing.mapListTypeToId(req, debugLog, config.config);
    const bodyParameters = {
      members_to_add: formatMembers(clientRequest.membersToAdd),
      members_to_remove: formatMembers(clientRequest.membersToRemove),
    };
    debugLog("listId:", listId, "segmentId:", clientRequest.segmentId, "bodyParameters:", JSON.stringify(bodyParameters));
    return config.mailchimp.lists.batchSegmentMembers(bodyParameters, listId, clientRequest.segmentId).then((responseData: MailchimpListSegmentBatchAddOrRemoveMembersResponse) => {
      messageProcessing.successfulResponse(req, res, responseData, messageType, debugLog);
    });
  }).catch((error: MailchimpApiError) => {
    messageProcessing.unsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
