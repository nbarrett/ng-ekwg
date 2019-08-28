"use strict";
let config = require("../config/config.js");
let debug = require("debug")(config.logNamespace("instagram"));
let ig = require("instagram-node").instagram();
let https = require("https");
let url = require("url");
let port = config.server.listenPort;
let redirectUri = "http://localhost:" + port + "/instagram/handleAuth";
module.exports = function (instagramAuthentication) {

  instagramAuthentication.result = {
    accessToken: config.instagram.accessToken,
    userId: config.instagram.userId,
  };

  ig.use({
    client_id: config.instagram.clientId,
    client_secret: config.instagram.clientSecret,
    access_token: config.instagram.accessToken,
  });


  function authorise(req, res) {

    var authorizationUrl = ig.get_authorization_url(redirectUri, {scope: ["public_content", "likes"]});
    debug("authorise: called with redirect to", authorizationUrl);
    res.redirect(authorizationUrl);
  }

  function handleAuth(req, res) {
    debug("handleAuth called with req.query", req.query);
    debug("handleAuth called with req.url", req.url);
    debug("handleAuth called with req.path", req.path);

    debug("handleAuth:old instagramAuthentication:", instagramAuthentication, "auth code", req.query.code);
    ig.authorize_user(req.query.code, redirectUri, function (err, result) {
      if (err) res.send(err);
      var receivedAccessToken = result.access_token;

      instagramAuthentication.result = {accessToken: receivedAccessToken, userId: receivedAccessToken.split(".")[0]};
      debug("handleAuth:generated new instagramAuthentication:", instagramAuthentication);

      res.json(instagramAuthentication.result);
    });
  }

  function recentMedia(req, res) {
    let response = {instagram: []};
    if (instagramAuthentication.result) {

      debug("recentMedia:accessToken:", instagramAuthentication.result.accessToken, "userId:", instagramAuthentication.result.userId);

      ig.user_media_recent(instagramAuthentication.result.userId, function (err, result, pagination, remaining, limit) {
        if (err) {
          res.json(err);
        } else {
          response.instagram = result;
          res.json(response);
        }
      });
    } else {
      debug("recentMedia:warning - no instagramAuthentication.result has been received yet");
      res.json(response);
    }
  }

  return {
    authorise: authorise,
    handleAuth: handleAuth,
    recentMedia: recentMedia,
  };
};
