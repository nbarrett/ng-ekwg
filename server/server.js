'use strict';
let config = require('./lib/config/config.js');
let express = require('express');
let favicon = require('serve-favicon');
let logger = require('morgan');
let methodOverride = require('method-override');
let bodyParser = require('body-parser');
let multer = require('multer');
let errorHandler = require('errorhandler');
let mongoProxy = require('./lib/mongo/mongo-proxy');
let walksAndEventsManager = require('./lib/ramblers/walksAndEventsManager');
let ramblersWalkUpload = require('./lib/ramblers/ramblersWalkUpload');
let memberBulkLoad = require('./lib/ramblers/memberBulkLoad');
let routes = require('./lib/mailchimp/routes/index');
let lists = require('./lib/mailchimp/routes/lists');
let groups = require('./lib/mailchimp/routes/groups');
let segments = require('./lib/mailchimp/routes/segments');
let campaigns = require('./lib/mailchimp/routes/campaigns');
let reports = require('./lib/mailchimp/routes/reports');
let instagramAuthentication = {};
let meetup = require('./lib/meetup/meetup');
let instagram = require('./lib/instagram/instagram')(instagramAuthentication);
let aws = require('./lib/aws/aws');
let googleMaps = require('./lib/googleMaps/googleMaps');
let mongoProxyInstance = mongoProxy();
let app = express();
let debug = require('debug')(config.logNamespace('server'));

app.set('port', config.server.listenPort);
app.disable('view cache');
app.use(favicon('../dist/ng-ekwg/assets/images/ramblers/favicon.ico'));
app.use(logger(config.env));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(config.server.distFolder));

app.get('/walksAndEventsManager/walkBaseUrl', walksAndEventsManager.walkBaseUrl);
app.get('/walksAndEventsManager/walkDescriptionPrefix', walksAndEventsManager.walkDescriptionPrefix);
app.get('/walksAndEventsManager/listWalks', walksAndEventsManager.listWalks);
app.post('/walksAndEventsManager/uploadWalks', ramblersWalkUpload.uploadWalks);

app.get('/aws/listBuckets', aws.listBuckets);
app.get('/aws/s3Policy', aws.s3Policy);
app.get('/aws/config', aws.getConfig);
app.get('/aws/s3/:bucket*', aws.get);
app.post('/aws/s3/:key/:file', multer({dest: config.server.uploadDir}).any(), aws.putObject);
app.get('/googleMaps/config', googleMaps.getConfig);
app.get('/mailchimp/index', routes.index);
app.get('/mailchimp/lists', lists.list);
app.get('/mailchimp/lists/:listType', lists.members);
app.post('/mailchimp/lists/:listType/batchSubscribe', lists.batchSubscribe);
app.post('/mailchimp/lists/:listType/batchUnsubscribe', lists.batchUnsubscribe);
app.post('/mailchimp/lists/:listType/subscribe', lists.subscribe);

app.post('/mailchimp/lists/:listType/interestGroupAdd', groups.interestGroupAdd);
app.delete('/mailchimp/lists/:listType/interestGroupDel', groups.interestGroupDel);
app.post('/mailchimp/lists/:listType/interestGroupingAdd', groups.interestGroupingAdd);
app.delete('/mailchimp/lists/:listType/interestGroupingDel', groups.interestGroupingDel);
app.get('/mailchimp/lists/:listType/interestGroupings', groups.interestGroupings);
app.put('/mailchimp/lists/:listType/interestGroupingUpdate', groups.interestGroupingUpdate);
app.put('/mailchimp/lists/:listType/interestGroupUpdate', groups.interestGroupUpdate);

app.post('/mailchimp/lists/:listType/segmentAdd', segments.segmentAdd);
app.delete('/mailchimp/lists/:listType/segmentDel/:segmentId', segments.segmentDel);
app.post('/mailchimp/lists/:listType/segmentRename', segments.segmentRename);
app.post('/mailchimp/lists/:listType/segmentMembersAdd', segments.segmentMembersAdd);
app.delete('/mailchimp/lists/:listType/segmentMembersDel', segments.segmentMembersDel);
app.get('/mailchimp/lists/:listType/segments', segments.segments);
app.put('/mailchimp/lists/:listType/segmentReset', segments.segmentReset);

app.get('/mailchimp/campaigns/:campaignId/content', campaigns.content);
app.post('/mailchimp/campaigns/:campaignId/create/:listType', campaigns.create);
app.delete('/mailchimp/campaigns/:campaignId/delete', campaigns.delete);
app.get('/mailchimp/campaigns/list', campaigns.list);
app.post('/mailchimp/campaigns/:campaignId/replicate', campaigns.replicate);
app.post('/mailchimp/campaigns/:campaignId/schedule', campaigns.schedule);
app.post('/mailchimp/campaigns/:campaignId/scheduleBatch', campaigns.scheduleBatch);
app.post('/mailchimp/campaigns/:campaignId/segmentTest', campaigns.segmentTest);
app.post('/mailchimp/campaigns/:campaignId/send', campaigns.send);
app.post('/mailchimp/campaigns/:campaignId/sendTest', campaigns.sendTest);
app.get('/mailchimp/campaigns/:campaignId/templateContent', campaigns.templateContent);
app.post('/mailchimp/campaigns/:campaignId/unschedule', campaigns.unschedule);
app.post('/mailchimp/campaigns/:campaignId/update', campaigns.update);

app.get('/mailchimp/reports', reports.list);
app.get('/mailchimp/reports/:id', reports.view);
app.get('/meetup/config', meetup.config);
app.get('/meetup/handleAuth', meetup.handleAuth);
app.get('/meetup/events', meetup.events);
app.get('/instagram/authorise', instagram.authorise);
app.get('/instagram/handleAuth', instagram.handleAuth);
app.get('/instagram/recentMedia', instagram.recentMedia);

app.post('/uploadRamblersData', multer({dest: config.server.uploadDir}).any(), memberBulkLoad.uploadRamblersData);

app.all('/databases/:db/collections/:collection/:id*', mongoProxyInstance);
app.all('/databases/:db/collections/:collection*', mongoProxyInstance);
app.all('/databases/:db/runCommand', mongoProxyInstance);


if (app.get('env') === 'dev') {
  app.use(errorHandler())
}

debug('Using mailchimp APIKey ' + config.mailchimp.apiKey);

app.listen(app.get('port'), function () {
  debug('listening on port ' + config.server.listenPort)
});
