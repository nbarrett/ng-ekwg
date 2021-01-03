// @ts-ignore
import mailchimp = require("@mailchimp/mailchimp_marketing");
import debug = require("debug");
import express = require("express");
import transforms = require("../mongo/controllers/transforms");
import config = require("../mongo/models/config");
import campaigns = require("./campaigns");
import lists = require("./lists");
import messageHandler = require("./messageHandler");
import reports = require("./reports");
import segments = require("./segments");
import { MailchimpConfigResponse } from "../../../src/app/models/mailchimp.model";
import { envConfig } from "../env-config/env-config";

const debugLog = debug(envConfig.logNamespace("mailchimp"));
const router = express.Router();

function resolvePrefix(result: MailchimpConfigResponse): string {
  const url = new URL(result.mailchimp.apiUrl);
  return url.host.split("\.")[0];
}

config.findOne({"mailchimp": {"$exists": true}})
  .then((result: MailchimpConfigResponse) => {
    mailchimp.setConfig({
      apiKey: envConfig.mailchimp.apiKey,
      server: resolvePrefix(result),
    });
  })
  .catch(error => {
    debugLog(`config error`, transforms.parseError(error));
  });

router.get("/lists", (req, res) => {
  const messageType = "list lists";
  const opts = {
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
  };

  mailchimp.lists.getAllLists(opts)
    .then(responseData => {
      messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
    }).catch(error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
});

router.get("/lists/:listType", (req, res) => {
  const messageType = "mailchimp-list-members";
  const listId = messageHandler.mapListTypeToId(req, debugLog);
  const opts = {
    fields: ["list_id",
      "members.web_id",
      "members.unique_email_id",
      "members.email_address",
      "members.status",
      "members.merge_fields",
      "members.last_changed"],
    status: "subscribed",
    offset: 0,
    count: 100
  };
  mailchimp.lists.getListMembersInfo(listId, opts)
    .then(responseData => {
      messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
    })
    .catch(error => {
      messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
    });
});

router.post("/lists/:listType/batchSubscribe", lists.batchSubscribe);
router.post("/lists/:listType/batchUnsubscribe", lists.batchUnsubscribe);

router.post("/lists/:listType/segmentAdd", segments.segmentAdd);
router.delete("/lists/:listType/segmentDel/:segmentId", segments.segmentDel);
router.post("/lists/:listType/segmentRename", segments.segmentRename);
router.post("/lists/:listType/segmentMembersAdd", segments.segmentMembersAdd);
router.delete("/lists/:listType/segmentMembersDel", segments.segmentMembersDel);
router.get("/lists/:listType/segments", segments.segments);
router.put("/lists/:listType/segmentReset", segments.segmentReset);

router.get("/campaigns/:campaignId/content", campaigns.content);
router.post("/campaigns/:campaignId/create/:listType", campaigns.create);
router.delete("/campaigns/:campaignId/delete", campaigns.delete);
router.get("/campaigns/list", campaigns.list);
router.post("/campaigns/:campaignId/replicate", campaigns.replicate);
router.post("/campaigns/:campaignId/schedule", campaigns.schedule);
router.post("/campaigns/:campaignId/scheduleBatch", campaigns.scheduleBatch);
router.post("/campaigns/:campaignId/segmentTest", campaigns.segmentTest);
router.post("/campaigns/:campaignId/send", campaigns.send);
router.post("/campaigns/:campaignId/sendTest", campaigns.sendTest);
router.get("/campaigns/:campaignId/templateContent", campaigns.templateContent);
router.post("/campaigns/:campaignId/unschedule", campaigns.unschedule);
router.post("/campaigns/:campaignId/update", campaigns.update);

router.get("/reports", reports.list);
router.get("/reports/:id", reports.view);

export const mailchimpRoutes = router;
