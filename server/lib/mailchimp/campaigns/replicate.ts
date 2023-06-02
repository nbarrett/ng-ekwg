import debug from "debug";
import { Request, Response } from "express";
import { envConfig } from "../../env-config/env-config";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageHandler from "../message-handler";

const debugLog = debug(envConfig.logNamespace("mailchimp:campaigns:replicate"));

export function replicate(req: Request, res: Response): void {
  const messageType = "campaign replicate";
  configuredMailchimp().then(config => {
    config.mailchimp.campaigns.replicate(req.params.campaignId)
      .then(responseData => {
        messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
      });
  }).catch(error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
