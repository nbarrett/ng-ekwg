import { Request, Response } from "express";
import { envConfig } from "../env-config/env-config";


export function processSuccessfulResponse(req: Request, res: Response, response, messageType, debug) {
  debug("Data:", JSON.stringify(response), "Received:", messageType, "successful response");
  res.json({request: {messageType}, response});
}

export function processUnsuccessfulResponse(req: Request, res: Response, error, messageType, debug) {
  const errorResponse = {code: error.code, message: error.message, stack: error.stack};
  debug("Received:", messageType, "error response:", errorResponse);
  res.json({request: {messageType}, error: errorResponse});
}

export function logRequestData(messageType, requestData, debug) {
  debug("Sending:", messageType, "request", JSON.stringify(requestData));
}

export function debug(messageType, requestData, debug): void {
  debug("Sending:", messageType, "request", JSON.stringify(requestData));
}

export function mapListTypeToId(req: Request, debug) {
  const listId = envConfig.mailchimp.lists[req.params.listType];
  debug("Mapping list type:" + req.params.listType + "-> mailchimp list Id", listId);
  return listId;
}

