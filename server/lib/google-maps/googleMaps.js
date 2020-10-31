const express = require("express");
const {config} = require("../config/config");
const router = express.Router();
let debug = require("debug")(config.logNamespace("google-maps"));

router.get("/config", (req, res) => {
  debug(config.googleMaps);
  res.send(config.googleMaps);
});

module.exports = router;
