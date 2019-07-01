'use strict';
let config = require('../config/config');
let debug = require('debug')(config.logNamespace('mailchimp:routes:campaigns'));
let messageHandler = require('./messageHandler');
let mcapi = require('mailchimp-api');
let mc = new mcapi.Mailchimp(config.mailchimp.apiKey);
let _ = require('underscore');
let moment = require('moment-timezone');
let _str = require('underscore.string');
/*

 campaigns/content (string apikey, string cid, struct options)
 Get the content (both html and text) for a campaign either as it would appear in the campaign archive or as the raw, original content

 */

exports.content = function (req, res) {
  var requestData = {
    "cid": req.params.campaignId,
    "seg_id": req.body.segmentId
  };
  var messageType = 'campaign content';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.content(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/create (string apikey, string type, struct options, struct content, struct segment_opts, struct type_opts)
 Create a new draft campaign to send. You can not have more than 32,000 campaigns in your account.

 */

exports.create = function (req, res) {

  var requestData = {
    "type": "regular",
    "options": {
      "list_id": messageHandler.mapListTypeToId(req, debug),
      "from_name": "Desiree Nel",
      "from_email": "membership@ekwg.co.uk",
      "subject": "EKWG website password reset instructions",
      "to_name": "*|FNAME|* *|LNAME|*",
      "template_id": req.body.templateId,
      "authenticate": true
    },
    "id": messageHandler.mapListTypeToId(req, debug),
    "name": req.body.segmentName
  };
  var messageType = 'campaign add';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.create(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/delete (string apikey, string cid)
 Delete a campaign. Seriously, "poof, gone!" - be careful! Seriously, no one can undelete these.


 */

exports['delete'] = function (req, res) {
  var requestData = {
    "cid": req.params.campaignId
  };

  var messageType = 'campaign delete';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns['delete'](requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/list (string apikey, struct filters, int start, int limit, string sort_field, string sort_dir)
 Get the list of campaigns and their details matching the specified filters

 */

exports.list = function (req, res) {
  var requestData = {
    filters: {
      status: req.query.status || 'save',
      exact: req.query.exact || false
    },
    start: req.query.start || 0,
    limit: req.query.limit || 25
  };
  var messageType = 'list campaigns';
  debug(messageType, "req.query:", req.query);

  addOptionalParameter('subject', requestData.filters);
  addOptionalParameter('title', requestData.filters);
  addOptionalParameter('exact', requestData.filters);
  messageHandler.logRequestData(messageType, requestData, debug);

  function addOptionalParameter(key, object) {
    if (req.query[key]) {
      object[key] = req.query[key]
    }
  }

  mc.campaigns.list(requestData, function (responseData) {

    function addDateField(campaign, fieldName, campaignResponse) {
      if (campaign[fieldName]) {
        campaignResponse[fieldName] = moment(campaign[fieldName], moment.ISO_8601).tz('Europe/London').valueOf();
      }
    }

    var filteredResponse = _str.toBoolean(req.query.concise) ? {
      total: responseData.data.length,
      errors: responseData.errors,
      data: _.chain(responseData.data)
        .map(function (campaign) {
          var campaignFields = _.pick(campaign, ['id', 'web_id', 'list_id', 'template_id', 'title', 'subject', 'saved_segment', 'status', 'from_name', 'archive_url_long']);
          addDateField(campaign, 'create_time', campaignFields);
          addDateField(campaign, 'send_time', campaignFields);
          return campaignFields

        })
    } : responseData.data;

    messageHandler.processSuccessfulResponse(req, res, filteredResponse, messageType + ' with ' + filteredResponse.total + ' data items -', debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/replicate (string apikey, string cid)
 Replicate a campaign.

 */

exports.replicate = function (req, res) {
  var requestData = {
    "cid": req.params.campaignId
  };
  var messageType = 'campaign replicate';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.replicate(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/schedule-batch (string apikey, string cid, string schedule_time, int num_batches, int stagger_mins)
 Schedule a campaign to be sent in batches sometime in the future. Only valid for "regular" campaigns

 */

exports.scheduleBatch = function (req, res) {
  var requestData = {
    "cid": req.params.campaignId,
    "seg_id": req.body.segmentId
  };
  var messageType = 'segment reset';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.scheduleBatch(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/schedule (string apikey, string cid, string schedule_time, string schedule_time_b)
 Schedule a campaign to be sent in the future

 */

exports.schedule = function (req, res) {
  var requestData = {
    "cid": req.params.campaignId,
    "get_counts": true
  };
  var messageType = 'list segments';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.schedule(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/segment-test (string apikey, string list_id, struct options)
 Allows one to test their segmentation rules before creating a campaign using them.

 */

exports.segmentTest = function (req, res) {
  var requestData = {
    "list_id": messageHandler.mapListTypeToId(req, debug),
    "get_counts": true
  };
  var messageType = 'list segments';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.segmentTest(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/send (string apikey, string cid)
 Send a given campaign immediately. For RSS campaigns, this will "start" them.

 */

exports.send = function (req, res) {
  var requestData = {
    "cid": req.params.campaignId
  };
  var messageType = 'campaign send';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.send(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/send-test (string apikey, string cid, array test_emails, string send_type)
 Send a test of this campaign to the provided email addresses

 */

exports.sendTest = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "get_counts": true
  };
  var messageType = 'campaign send test';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.sendTest(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/template-content (string apikey, string cid)
 Get the HTML template content sections for a campaign. Note that this will return very jagged, non-standard results based on the template a campaign is using. You only want to use this if you want to allow editing template sections in your application.

 */

exports.templateContent = function (req, res) {
  var requestData = {
    "cid": req.params.campaignId
  };
  var messageType = 'campaign template content';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.templateContent(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/unschedule (string apikey, string cid)
 Unschedule a campaign that is scheduled to be sent in the future

 */

exports.unschedule = function (req, res) {
  var requestData = {
    "cid": req.params.campaignId,
    "get_counts": true
  };
  var messageType = 'list segments';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.unschedule(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 campaigns/update (string apikey, string cid, string name, array value)
 Update just about any setting besides type for a campaign that has not been sent. See campaigns/create() for details. Caveats:

 If you set a new list_id, all segmentation options will be deleted and must be re-added.
 If you set template_id, you need to follow that up by setting it's 'content'
 If you set segment_opts, you should have tested your options against campaigns/segment-test().
 To clear/unset segment_opts, pass an empty string or array as the value. Various wrappers may require one or the other.

 */

exports.update = function (req, res) {
  //  options, content, segment_opts)
  var requestData = {
    "cid": req.params.campaignId,
    name: req.body.updates.name, value: req.body.updates.value
  };

  var messageType = 'campaign update';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.campaigns.update(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};
