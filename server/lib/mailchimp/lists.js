let {envConfig} = require("../env-config/env-config");
let debug = require("debug")(envConfig.logNamespace("mailchimp:routes:lists"));
let messageHandler = require("./messageHandler");
let mcapi = require("mailchimp-api");
let mc = new mcapi.Mailchimp(envConfig.mailchimp.apiKey);

/*
 * GET list of lists.
 */

exports.list = (req, res) => {
  var requestData = {};
  var messageType = "list lists";
  debug(messageType, requestData);
  mc.lists.list(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*
 * list members.
 */

exports.members = (req, res) => {
  var requestData = {
    id: messageHandler.mapListTypeToId(req, debug),
    status: "subscribed",
    opts: {
      start: 0,
      limit: 100,
    }
  };
  var messageType = "list members";
  debug(messageType, requestData);
  mc.lists.members(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*
 * Subscribe an email to a list.
 */

exports.subscribe = (req, res) => {
  var requestData = {
    id: messageHandler.mapListTypeToId(req, debug),
    email: {email: req.body.email},
  };
  var messageType = "subscribe member to mailing list";
  debug(messageType, requestData);
  mc.lists.subscribe(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*
 * batch subscribe a complete list.
 */

exports.batchSubscribe = (req, res) => {
  var requestData = {
    id: messageHandler.mapListTypeToId(req, debug),
    batch: req.body,
    double_optin: false,
    update_existing: true,
    replace_interests: true,
  };
  var messageType = "batch subscribe to list";
  debug(messageType, JSON.stringify(requestData));
  mc.lists.batchSubscribe(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};


/*
 * batch unsubscribe a complete list.
 */

exports.batchUnsubscribe = (req, res) => {
  var requestData = {
    id: messageHandler.mapListTypeToId(req, debug),
    batch: req.body,
    delete_member: true,
    send_goodbye: false,
    send_notify: false,
  };
  var messageType = "batch unsubscribe from list";
  debug(messageType, requestData);
  mc.lists.batchUnsubscribe(requestData, responseData => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};
