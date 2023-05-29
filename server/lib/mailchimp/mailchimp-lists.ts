import { ErrorResponse, lists } from "@mailchimp/mailchimp_marketing";
import * as messageHandler from "./message-handler";
import { envConfig } from "../env-config/env-config";
import { configuredMailchimp } from "./mailchimp-config";
import debug from "debug";
import { Request, Response } from "express";
import BatchListMembersBody = lists.BatchListMembersBody;
import BatchListMembersResponse = lists.BatchListMembersResponse;
import BatchListMembersOpts = lists.BatchListMembersOpts;

const debugLog = debug(envConfig.logNamespace("mailchimp-lists"));

export async function mailchimpLists(req: Request, res: Response) {
  const mailchimpConfigData = await configuredMailchimp();
  const messageType = "list lists";
  mailchimpConfigData.mailchimp.lists.getAllLists({
    fields: ["lists.id",
      "lists.web_id",
      "lists.name",
      "lists.stats.member_count",
      "lists.stats.unsubscribe_count",
      "lists.stats.cleaned_count",
      "lists.stats.campaign_count",
      "lists.stats.campaign_last_sent",
      "lists.stats.merge_field_count"],
    status: "subscribed",
    offset: 0,
    count: 100
  }).then(responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }).catch(error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

export async function mailchimpListMembers(req: Request, res: Response): Promise<void> {
  const messageType = "mailchimp-list-members";
  const listId = messageHandler.mapListTypeToId(req, debugLog);
  try {
    const mailchimpConfigData = await configuredMailchimp();
    mailchimpConfigData.mailchimp.lists.getListMembersInfo(listId, {
      fields: ["list_id",
        "members.web_id",
        "members.unique_email_id",
        "members.email_address",
        "members.status",
        "members.merge_fields",
        "members.last_changed"],
      status: "subscribed",
      offset: 0,
      count: 300
    }).then(responseData => {
      messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
    }).catch(error => {
      messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
    });
  } catch (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  }
}

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

