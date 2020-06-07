const config = require("../config/config");
const debug = require("debug")(config.logNamespace("instagram:recent-media"));
const messageHandlers = require("../shared/message-handlers");
exports.recentMedia = (req, res) => {
  messageHandlers.httpRequest({
    apiRequest: {
      hostname: "graph.instagram.com",
      protocol: "https:",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      method: "get",
      path: `https://graph.instagram.com/${config.instagram.userId}/media?access_token=${config.instagram.accessToken}&fields=id,media_type,media_url,username,timestamp,caption`
    },
    debug: debug,
    res: res,
    req: req,
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};
