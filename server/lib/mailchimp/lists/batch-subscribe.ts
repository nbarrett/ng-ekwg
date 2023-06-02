import { ErrorResponse, lists } from "@mailchimp/mailchimp_marketing";
import { Request, Response } from "express";
import { envConfig } from "../../env-config/env-config";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageHandler from "../message-handler";
import BatchListMembersOpts = lists.BatchListMembersOpts;
import BatchListMembersResponse = lists.BatchListMembersResponse;
import BatchListMembersBody = lists.BatchListMembersBody;

import debug from "debug";

const debugLog = debug(envConfig.logNamespace("mailchimp:campaigns:search"));

export async function batchSubscribe(req: Request, res: Response) {
  const messageType = "batch-subscribe-list";
  const listId = messageHandler.mapListTypeToId(req, debugLog);
  try {
    const mailchimpConfigData = await configuredMailchimp();
    const options: BatchListMembersOpts = {
      skipMergeValidation: false,
      skipDuplicateCheck: false
    };
    const body: BatchListMembersBody = {members: req.body, update_existing: true};
    mailchimpConfigData.mailchimp.lists.batchListMembers(listId, body, options).then((responseData: BatchListMembersResponse) => {
      messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
    }).catch((error: ErrorResponse) => {
      messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
    });
  } catch (error: any) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  }
}
