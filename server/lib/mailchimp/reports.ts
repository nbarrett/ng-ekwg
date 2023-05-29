import { envConfig } from "../env-config/env-config";
import mcapi = require("mailchimp-api");
import debug from "debug";

const debugLog = debug(envConfig.logNamespace("mailchimp:routes:reports"));
const mc = new mcapi.Mailchimp(envConfig.mailchimp.apiKey);

/*
 * GET the list of sent campaigns.
 */

export function list(req, res) {
  mc.campaigns.list({"status": "sent"}, function (data) {
    res.json(data.data);
  }, function (error) {
    req.session.error_flash = error.error ? error.code + ": " + error.error : "An unknown error occurred";
    res.json(error);
  });
}

/*
 * GET a report.
 */

export function view(req, res) {
  mc.campaigns.list({campaign_id: req.params.id}, function (campaignData) {
    mc.reports.summary({cid: req.params.id}, function (reportData) {
      res.json(reportData);
    }, function (error) {
      debugLog(error);
      if (error.name === "Campaign_DoesNotExist") {
        req.session.error_flash = "The campaign does not exist";
      } else if (error.error) {
        req.session.error_flash = error.code + ": " + error.error;
      } else {
        req.session.error_flash = "An unknown error occurred";
      }
      res.json(error);
    });
  });
}
