import express = require("express");
import campaigns = require("./campaigns");
import reports = require("./reports");
import segments = require("./segments");
import * as lists from "./mailchimp-lists";

const router = express.Router();

router.get("/lists", lists.mailchimpLists);
router.get("/lists/:listType", lists.mailchimpListMembers);

router.post("/lists/:listType/batchSubscribe", lists.batchSubscribe);

router.post("/lists/:listType/segmentAdd", segments.segmentAdd);
router.delete("/lists/:listType/segmentDel/:segmentId", segments.segmentDel);
router.post("/lists/:listType/segmentRename", segments.segmentRename);
router.post("/lists/:listType/segmentMembersAdd", segments.segmentMembersAdd);
router.delete("/lists/:listType/segmentMembersDel", segments.segmentMembersDel);
router.get("/lists/:listType/segments", segments.segments);
router.put("/lists/:listType/segmentReset", segments.segmentReset);

router.get("/campaigns/:campaignId/content", campaigns.content);
router.post("/campaigns/:campaignId/create/:listType", campaigns.create);
router.delete("/campaigns/:campaignId/delete", campaigns.deleteCampaign);
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
