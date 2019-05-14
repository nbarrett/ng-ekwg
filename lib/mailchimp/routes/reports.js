'use strict';
let config = require('../../../config.js');
let debug = require('debug')(config.logNamespace('mailchimp:routes:reports'));
let messageHandler = require('./messageHandler.js');
let mcapi = require('mailchimp-api');
let mc = new mcapi.Mailchimp(config.mailchimp.apiKey);

/*
 * GET the list of sent campaigns.
 */

exports.list = function (req, res) {
  mc.campaigns.list({'status': 'sent'}, function (data) {
    res.json(data.data);
  }, function (error) {
    if (error.error) {
      req.session.error_flash = error.code + ": " + error.error;
    } else {
      req.session.error_flash = "An unknown error occurred";
    }
    res.json(error);
  });
};

/*
 * GET a report.
 */

exports.view = function (req, res) {
  mc.campaigns.list({campaign_id: req.params.id}, function (campaignData) {
    var campaign = campaignData.data[0];
    mc.reports.summary({cid: req.params.id}, function (reportData) {
      res.json(reportData);
    }, function (error) {
      debug(error);
      if (error.name == "Campaign_DoesNotExist") {
        req.session.error_flash = "The campaign does not exist";
      } else if (error.error) {
        req.session.error_flash = error.code + ": " + error.error;
      } else {
        req.session.error_flash = "An unknown error occurred";
      }
      res.json(error);
    });
  });
};
