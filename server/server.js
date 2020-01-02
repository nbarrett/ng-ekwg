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
const ramblers = require("./lib/ramblers/ramblers");
const aws = require("./lib/aws/aws");
const database = require("./lib/mongo/database");
const meetup = require("./lib/meetup/meetup");
const instagram = require("./lib/instagram/instagram");
const googleMaps = require("./lib/google-maps/googleMaps");
const mailchimp = require("./lib/mailchimp/mailchimp");
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
app.use("/api/ramblers", ramblers);
app.use("/api/aws", aws);
app.use("/api/google-maps", googleMaps);
app.use("/api/instagram", instagram);
app.use("/api/mailchimp", mailchimp);
app.use("/api/meetup", meetup);
app.use("/api/database", database);
app.use("/", express.static(config.server.distFolder));
app.use((req, res, next) => {
  res.sendFile(path.join(config.server.distFolder, "index.html"));
});
if (app.get("env") === "dev") {
  app.use(errorHandler());
}

app.listen(app.get("port"), function () {
  debug("listening on port " + config.server.listenPort);
});
