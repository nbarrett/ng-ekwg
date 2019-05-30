'use strict';
let config = require('../../config/config.js');
let debug = require('debug')(config.logNamespace('mailchimp:routes:index'));
let messageHandler = require('./messageHandler.js');
let mcapi = require('mailchimp-api');
let mc = new mcapi.Mailchimp(config.mailchimp.apiKey);

/*
 * GET home page.
 */

exports.index = function (req, res) {
  mc.helper.ping(function (data) {
    res.json(data);
  }, function (err) {
    console.log(err);
    if (err.name == 'Invalid_ApiKey') {
      res.locals.error_flash = "Invalid API key. Set it in app.js";
    } else if (error.error) {
      res.locals.error_flash = error.code + ": " + error.error;
    } else {
      res.locals.error_flash = "An unknown error occurred";
    }
    res.json(err);
  });
};
