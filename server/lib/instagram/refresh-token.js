const config = require("../config/config");
const debug = require("debug")(config.logNamespace("instagram:refresh-token"));
const messageHandlers = require("../shared/message-handlers");
exports.refreshToken = (req, res) => {
  return messageHandlers.httpRequest({
    apiRequest: {
      hostname: "graph.instagram.com",
      protocol: "https:",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      method: "get",
      path: `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${config.instagram.accessToken}`
    },
    debug: debug,
    res: res,
    req: req,
  })};
