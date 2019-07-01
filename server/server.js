'use strict';
let config = require('./lib/config/config.js');
let path = require('path');
let express = require('express');
let favicon = require('serve-favicon');
let logger = require('morgan');
let methodOverride = require('method-override');
let bodyParser = require('body-parser');
let errorHandler = require('errorhandler');
let ramblers = require('./lib/ramblers/ramblers');
let aws = require('./lib/aws/aws');
let database = require('./lib/mongo/database');
let meetup = require('./lib/meetup/meetup');
let instagram = require('./lib/instagram/instagram');
let googleMaps = require('./lib/google-maps/googleMaps');
let mailchimp = require('./lib/mailchimp/mailchimp');
let app = express();
let debug = require('debug')(config.logNamespace('server'));

app.set('port', config.server.listenPort);
app.disable('view cache');
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
app.use('/api/meetup', meetup);
app.use('/api/database', database);
app.use("/", express.static(config.server.distFolder));
app.use((req, res, next) => {
  res.sendFile(path.join(config.server.distFolder, "index.html"));
});
if (app.get('env') === 'dev') {
  app.use(errorHandler())
}

app.listen(app.get('port'), function () {
  debug('listening on port ' + config.server.listenPort)
});
