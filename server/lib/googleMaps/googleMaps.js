'use strict';
let config = require('../config/config.js');
let debug = require('debug')(config.logNamespace('googleMaps:config'));

exports.getConfig = function (req, res) {
  debug(config.googleMaps);
  res.send(config.googleMaps);

};

