const express = require("express");
const config = require("../config/config");
const router = express.Router();
const routes = require("./index");
const lists = require("./lists");
const groups = require("./groups");
const segments = require("./segments");
const campaigns = require("./campaigns");
const reports = require("./reports");

router.get("/index", routes.index);
router.get("/lists", lists.list);
router.get("/lists/:listType", lists.members);
router.post("/lists/:listType/batchSubscribe", lists.batchSubscribe);
router.post("/lists/:listType/batchUnsubscribe", lists.batchUnsubscribe);
router.post("/lists/:listType/subscribe", lists.subscribe);

router.post("/lists/:listType/interestGroupAdd", groups.interestGroupAdd);
router.delete("/lists/:listType/interestGroupDel", groups.interestGroupDel);
router.post("/lists/:listType/interestGroupingAdd", groups.interestGroupingAdd);
router.delete("/lists/:listType/interestGroupingDel", groups.interestGroupingDel);
router.get("/lists/:listType/interestGroupings", groups.interestGroupings);
router.put("/lists/:listType/interestGroupingUpdate", groups.interestGroupingUpdate);
router.put("/lists/:listType/interestGroupUpdate", groups.interestGroupUpdate);

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

module.exports = router;
