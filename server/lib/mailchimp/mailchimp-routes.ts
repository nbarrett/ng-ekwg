import express = require("express");
import { campaignList } from "./campaigns/campaign-list";
import { campaignReplicate } from "./campaigns/campaign-replicate";
import { campaignSearch } from "./campaigns/campaign-search";
import { campaignSend } from "./campaigns/campaign-send";
import { campaignSetContent } from "./campaigns/campaign-set-content";
import { campaignUpdate } from "./campaigns/campaign-update";
import { listsBatchSubscribe } from "./lists/lists-batch-subscribe";
import { listMembers } from "./lists/list-members";
import { lists } from "./lists/lists";
import { listsSegmentAdd } from "./lists/lists-segment-add";
import { listsSegmentDelete } from "./lists/lists-segment-delete";
import { listsSegmentMembersAddOrRemove } from "./lists/lists-segment-members-add-or-remove";
import { listsSegmentUpdate } from "./lists/lists-segment-update";

const router = express.Router();

router.get("/lists", lists);
router.get("/lists/:listType", listMembers);
router.post("/lists/:listType/batchSubscribe", listsBatchSubscribe);
router.post("/lists/:listType/segmentAdd", listsSegmentAdd);
router.post("/lists/:listType/segmentMembersAddOrRemove", listsSegmentMembersAddOrRemove);
router.post("/lists/:listType/segmentUpdate", listsSegmentUpdate);
router.delete("/lists/:listType/segmentDel/:segmentId", listsSegmentDelete);
router.get("/campaigns/list", campaignList);
router.get("/campaigns/search", campaignSearch);
router.post("/campaigns/:campaignId/send", campaignSend);
router.post("/campaigns/:campaignId/replicate", campaignReplicate);
router.post("/campaigns/:campaignId/update", campaignUpdate);
router.post("/campaigns/:campaignId/content", campaignSetContent);

export const mailchimpRoutes = router;
