// @ts-ignore
import mailchimp = require("@mailchimp/mailchimp_marketing");
import debug = require("debug");
import express = require("express");
import transforms = require("../mongo/controllers/transforms");
import config = require("../mongo/models/config");
import campaigns = require("./campaigns");
import routes = require("./index");
import lists = require("./lists");
import reports = require("./reports");
import segments = require("./segments");
import { envConfig } from "../env-config/env-config";

const debugLog = debug(envConfig.logNamespace("mailchimp"));

function resolvePrefix(result: any): string {
  const url = new URL(result.mailchimp.apiUrl);
  return url.host.split("\.")[0];
}

config.findOne({"mailchimp": {"$exists": true}})
  .then((result: any) => {
    mailchimp.setConfig({
      apiKey: envConfig.mailchimp.apiKey,
      server: resolvePrefix(result),
    });
    queryLists();
  })
  .catch(error => {
    debugLog(`config error`, transforms.parseError(error));
  });

async function run() {
  debugLog("calling ping...");
  const response = await mailchimp.ping.get();
  debugLog(response);
}

const queryLists = async () => {
  const response = await mailchimp.lists.getAllLists();
  debugLog(response);
};

const router = express.Router();

router.get("/index", routes.index);
router.get("/lists", lists.list);
router.get("/lists/:listType", lists.members);
router.post("/lists/:listType/batchSubscribe", lists.batchSubscribe);
router.post("/lists/:listType/batchUnsubscribe", lists.batchUnsubscribe);
router.post("/lists/:listType/subscribe", lists.subscribe);

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
