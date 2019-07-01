const express = require("express");
const config = require('../config/config');
const router = express.Router();
const routes = require('./index');
const lists = require('./lists');
const groups = require('./groups');
const segments = require('./segments');
const campaigns = require('./campaigns');
const reports = require('./reports');

router.get('/mailchimp/index', routes.index);
router.get('/mailchimp/lists', lists.list);
router.get('/mailchimp/lists/:listType', lists.members);
router.post('/mailchimp/lists/:listType/batchSubscribe', lists.batchSubscribe);
router.post('/mailchimp/lists/:listType/batchUnsubscribe', lists.batchUnsubscribe);
router.post('/mailchimp/lists/:listType/subscribe', lists.subscribe);

router.post('/mailchimp/lists/:listType/interestGroupAdd', groups.interestGroupAdd);
router.delete('/mailchimp/lists/:listType/interestGroupDel', groups.interestGroupDel);
router.post('/mailchimp/lists/:listType/interestGroupingAdd', groups.interestGroupingAdd);
router.delete('/mailchimp/lists/:listType/interestGroupingDel', groups.interestGroupingDel);
router.get('/mailchimp/lists/:listType/interestGroupings', groups.interestGroupings);
router.put('/mailchimp/lists/:listType/interestGroupingUpdate', groups.interestGroupingUpdate);
router.put('/mailchimp/lists/:listType/interestGroupUpdate', groups.interestGroupUpdate);

router.post('/mailchimp/lists/:listType/segmentAdd', segments.segmentAdd);
router.delete('/mailchimp/lists/:listType/segmentDel/:segmentId', segments.segmentDel);
router.post('/mailchimp/lists/:listType/segmentRename', segments.segmentRename);
router.post('/mailchimp/lists/:listType/segmentMembersAdd', segments.segmentMembersAdd);
router.delete('/mailchimp/lists/:listType/segmentMembersDel', segments.segmentMembersDel);
router.get('/mailchimp/lists/:listType/segments', segments.segments);
router.put('/mailchimp/lists/:listType/segmentReset', segments.segmentReset);

router.get('/mailchimp/campaigns/:campaignId/content', campaigns.content);
router.post('/mailchimp/campaigns/:campaignId/create/:listType', campaigns.create);
router.delete('/mailchimp/campaigns/:campaignId/delete', campaigns.delete);
router.get('/mailchimp/campaigns/list', campaigns.list);
router.post('/mailchimp/campaigns/:campaignId/replicate', campaigns.replicate);
router.post('/mailchimp/campaigns/:campaignId/schedule', campaigns.schedule);
router.post('/mailchimp/campaigns/:campaignId/scheduleBatch', campaigns.scheduleBatch);
router.post('/mailchimp/campaigns/:campaignId/segmentTest', campaigns.segmentTest);
router.post('/mailchimp/campaigns/:campaignId/send', campaigns.send);
router.post('/mailchimp/campaigns/:campaignId/sendTest', campaigns.sendTest);
router.get('/mailchimp/campaigns/:campaignId/templateContent', campaigns.templateContent);
router.post('/mailchimp/campaigns/:campaignId/unschedule', campaigns.unschedule);
router.post('/mailchimp/campaigns/:campaignId/update', campaigns.update);

router.get('/mailchimp/reports', reports.list);
router.get('/mailchimp/reports/:id', reports.view);

module.exports = router;
