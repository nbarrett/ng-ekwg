let {envConfig} = require("../env-config/env-config");
let debug = require("debug")(envConfig.logNamespace("mailchimp:routes:index"));
let messageHandler = require("./messageHandler");
let mcapi = require("mailchimp-api");
let mc = new mcapi.Mailchimp(envConfig.mailchimp.apiKey);

/*
 * GET home page.
 */

exports.index = function (req, res) {
  mc.helper.ping(function (data) {
    res.json(data);
  }, function (err) {
    console.log(err);
    if (err.name === "Invalid_ApiKey") {
      res.locals.error_flash = "Invalid API key. Set it in app.js";
    } else if (error.error) {
      res.locals.error_flash = error.code + ": " + error.error;
    } else {
      res.locals.error_flash = "An unknown error occurred";
    }
    res.json(err);
  });
};
