"use strict";
const config = require("./lib/config/config.js");
const path = require("path");
const express = require("express");
const favicon = require("serve-favicon");
const logger = require("morgan");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const compression = require("compression")
const errorHandler = require("errorhandler");
const mongoose = require("mongoose");
const passport = require("passport");
const ramblers = require("./lib/ramblers/ramblers");
const aws = require("./lib/aws/aws");
const database = require("./lib/mongo/database");
const meetup = require("./lib/meetup/meetup");
const instagram = require("./lib/instagram/instagram");
const googleMaps = require("./lib/google-maps/googleMaps");
const mailchimp = require("./lib/mailchimp/mailchimp");
const contentText = require("./lib/mongo/routes/content-text");
const auth = require("./lib/mongo/routes/auth");
const member = require("./lib/mongo/routes/member");
const debug = require("debug")(config.logNamespace("server"));
const app = express();

app.use(compression())
app.set("port", config.server.listenPort);
app.disable("view cache");
app.use(favicon(path.join(config.server.distFolder, "assets/images/ramblers/favicon.ico")));
app.use(logger(config.env));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/ramblers", ramblers);
app.use("/api/aws", aws);
app.use("/api/google-maps", googleMaps);
app.use("/api/instagram", instagram);
app.use("/api/mailchimp", mailchimp);
app.use("/api/meetup", meetup);
app.use("/api/database", database);
app.use("/api/database/auth", auth);
app.use("/api/database/content-text", contentText);
app.use("/api/database/member", member);
app.use("/", express.static(config.server.distFolder));
app.use((req, res, next) => {
  res.sendFile(path.join(config.server.distFolder, "index.html"));
});
if (app.get("env") === "dev") {
  app.use(errorHandler());
}

mongoose.connect(config.mongo.uri, {useNewUrlParser: true, useUnifiedTopology: true})
  .then((response) => {
    debug("Connected to database:", config.mongo.uri);
  })
  .catch((error) => {
    debug("Connection failed:", config.mongo.uri, error);
  });

app.listen(app.get("port"), function () {
  debug("listening on port " + config.server.listenPort);
});
