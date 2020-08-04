const config = require("../config/config");
const refreshToken = require("./refresh-token");
const debug = require("debug")(config.logNamespace("instagram:recent-media"));
const messageHandlers = require("../shared/message-handlers");
exports.recentMedia = (req, res) => {
  const refreshRequest = {};
  const refreshResponse = {};
  refreshToken.refreshToken(refreshRequest, refreshResponse)
    .then(apiResponse => debug("refreshToken response:", apiResponse.response, "apiStatusCode:", apiResponse.apiStatusCode))
    .then(() => {
      messageHandlers.httpRequest({
        apiRequest: {
          hostname: "graph.instagram.com",
          protocol: "https:",
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          },
          method: "get",
          path: `https://graph.instagram.com/${config.instagram.userId}/media?access_token=${config.instagram.accessToken}&fields=id,media_type,media_url,permalink,username,timestamp,caption`
        },
        debug: debug,
        res: res,
        req: req,
      }).then(response => res.json(response))
        .catch(error => res.json(error));
    })
};
