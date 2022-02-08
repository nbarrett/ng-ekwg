import debug = require("debug");
import messageHandler = require("./messageHandler");
import { envConfig } from "../env-config/env-config";
import { configuredMailchimp } from "./mailchimp-config";

const debugLog = debug(envConfig.logNamespace("mailchimp-lists"));

export const lists = {mailchimpLists, mailchimpListMembers, batchSubscribe};

async function mailchimpLists(req, res) {
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

async function mailchimpListMembers(req, res) {
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

async function batchSubscribe(req, res) {
  const messageType = "batch-subscribe-list";
  const listId = messageHandler.mapListTypeToId(req, debugLog);
  try {
    const mailchimpConfigData = await configuredMailchimp();
    const options = {
      skipMergeValidation: false,
      skipDuplicateCheck: false
    };
    mailchimpConfigData.mailchimp.lists.batchListMembers(listId, {members: req.body, update_existing: true}, options).then(responseData => {
      messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
    }).catch(error => {
      messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
    });
  } catch (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  }
}

