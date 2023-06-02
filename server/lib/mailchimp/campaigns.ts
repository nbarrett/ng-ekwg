import debug from "debug";
import { Request, Response } from "express";
import { envConfig } from "../env-config/env-config";
import * as messageHandler from "./message-handler";
import mcapi = require("mailchimp-api");

const debugLog = debug(envConfig.logNamespace("mailchimp:routes:campaigns"));
const mc = new mcapi.Mailchimp(envConfig.mailchimp.apiKey);

/*

 campaigns/content (string apikey, string cid, struct options)
 Get the content (both html and text) for a campaign either as it would appear in the campaign archive or as the raw, original content

 */

export function content(req: Request, res: Response) {
  const requestData = {
    "cid": req.params.campaignId,
    "seg_id": req.body.segmentId,
  };
  const messageType = "campaign content";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.content(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/create (string apikey, string type, struct options, struct content, struct segment_opts, struct type_opts)
 Create a new draft campaign to send. You can not have more than 32,000 campaigns in your account.

 */

export function create(req: Request, res: Response) {

  const requestData = {
    "type": "regular",
    "options": {
      "list_id": messageHandler.mapListTypeToId(req, debugLog),
      "from_name": "Desiree Nel",
      "from_email": "membership@ekwg.co.uk",
      "subject": "EKWG website password reset instructions",
      "to_name": "*|FNAME|* *|LNAME|*",
      "template_id": req.body.templateId,
      "authenticate": true,
    },
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "name": req.body.segmentName,
  };
  const messageType = "campaign add";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.create(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/delete (string apikey, string cid)
 Delete a campaign. Seriously, "poof, gone!" - be careful! Seriously, no one can undelete these.


 */

export function deleteCampaign(req: Request, res: Response) {
  const requestData = {
    "cid": req.params.campaignId,
  };

  const messageType = "campaign delete";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns["delete"](requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/schedule-batch (string apikey, string cid, string schedule_time, int num_batches, int stagger_mins)
 Schedule a campaign to be sent in batches sometime in the future. Only valid for "regular" campaigns

 */

export function scheduleBatch(req: Request, res: Response) {
  const requestData = {
    "cid": req.params.campaignId,
    "seg_id": req.body.segmentId,
  };
  const messageType = "segment reset";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.scheduleBatch(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/schedule (string apikey, string cid, string schedule_time, string schedule_time_b)
 Schedule a campaign to be sent in the future

 */

export function schedule(req: Request, res: Response) {
  const requestData = {
    "cid": req.params.campaignId,
    "get_counts": true,
  };
  const messageType = "list segments";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.schedule(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/segment-test (string apikey, string list_id, struct options)
 Allows one to test their segmentation rules before creating a campaign using them.

 */

export function segmentTest(req: Request, res: Response) {
  const requestData = {
    "list_id": messageHandler.mapListTypeToId(req, debugLog),
    "get_counts": true,
  };
  const messageType = "list segments";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.segmentTest(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/send (string apikey, string cid)
 Send a given campaign immediately. For RSS campaigns, this will "start" them.

 */

export function send(req: Request, res: Response) {
  const requestData = {
    "cid": req.params.campaignId,
  };
  const messageType = "campaign send";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.send(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/send-test (string apikey, string cid, array test_emails, string send_type)
 Send a test of this campaign to the provided email addresses

 */

export function sendTest(req: Request, res: Response) {
  const requestData = {
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "get_counts": true,
  };
  const messageType = "campaign send test";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.sendTest(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

export function templateContent(req: Request, res: Response) {
  const requestData = {
    "cid": req.params.campaignId,
  };
  const messageType = "campaign template content";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.templateContent(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/unschedule (string apikey, string cid)
 Unschedule a campaign that is scheduled to be sent in the future

 */

export function unschedule(req: Request, res: Response) {
  const requestData = {
    "cid": req.params.campaignId,
    "get_counts": true,
  };
  const messageType = "list segments";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.unschedule(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

/*

 campaigns/update (string apikey, string cid, string name, array value)
 Update just about any setting besides type for a campaign that has not been sent. See campaigns/create() for details. Caveats:

 If you set a new list_id, all segmentation options will be deleted and must be re-added.
 If you set template_id, you need to follow that up by setting it's 'content'
 If you set segment_opts, you should have tested your options against campaigns/segment-test().
 To clear/unset segment_opts, pass an empty string or array as the value. Various wrappers may require one or the other.

 */

export function update(req: Request, res: Response) {
  //  options, content, segment_opts)
  const requestData = {
    "cid": req.params.campaignId,
    name: req.body.updates.name, value: req.body.updates.value,
  };

  const messageType = "campaign update";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.campaigns.update(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
