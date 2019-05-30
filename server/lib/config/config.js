'use strict';
let debug = require('debug')(logNamespace('config'));
let path = require('path');
let config = require('config');
let distFolder = path.resolve(__dirname, config.server.distFolder);
debug("distFolder", distFolder);

function validatedEnvironmentVariable(variableName) {
  let variableValue = process.env[variableName];
  if (!variableValue) {
    throw new Error('Environment variable \'' + variableName + '\' must be set');
  }
  return variableValue;
}

function logNamespace(moduleName) {
  return 'ekwg:' + validatedEnvironmentVariable('NODE_ENV') + ':' + moduleName;
}

module.exports = {
  env: validatedEnvironmentVariable('NODE_ENV'),
  logNamespace: logNamespace,
  instagram: {
    accessToken: validatedEnvironmentVariable('INSTAGRAM_ACCESS_TOKEN'),
    userId: validatedEnvironmentVariable('INSTAGRAM_USER_ID'),
    clientId: validatedEnvironmentVariable('INSTAGRAM_CLIENT_ID'),
    clientSecret: validatedEnvironmentVariable('INSTAGRAM_CLIENT_SECRET')
  },
  mailchimp: {
    apiKey: validatedEnvironmentVariable('MAILCHIMP_APIKEY'),
    lists: {
      walks: config.mailchimp.lists.walks,
      socialEvents: config.mailchimp.lists.socialEvents,
      general: config.mailchimp.lists.general
    }
  },
  googleMaps: {
    apiKey: validatedEnvironmentVariable('GOOGLE_MAPS_APIKEY'),
  },
  mongo: {
    dbUrl: config.mongo.dbUrl,
    apiKey: validatedEnvironmentVariable('MONGOLAB_APIKEY'),
    database: config.mongo.database
  },
  meetup: {
    url: config.meetup.url,
    apiUrl: config.meetup.apiUrl,
    group: config.meetup.group,
    apiKey: validatedEnvironmentVariable('MEETUP_APIKEY'),
  },
  ramblers: {
    url: config.ramblers.url,
    walkDescriptionPrefix: config.ramblers.walkDescriptionPrefix,
    listWalksPath: config.ramblers.listWalksPath,
    gwem: {
      userName: validatedEnvironmentVariable('RAMBLERS_GWEM_USER'),
      password: validatedEnvironmentVariable('RAMBLERS_GWEM_PASSWORD')
    }
  },
  aws: {
    accessKeyId: validatedEnvironmentVariable('AWS_ACCESS_KEY_ID'),
    secretAccessKey: validatedEnvironmentVariable('AWS_SECRET_ACCESS_KEY'),
    region: config.aws.region,
    bucket: config.aws.bucket,
    domain: config.aws.domain,
    uploadUrl: 'https://' + config.aws.bucket + '.s3.amazonaws.com',
    baseHostingUrl: 'http://s3-' + config.aws.region + '.' + config.aws.domain + '/' + config.aws.bucket
  },
  server: {
    listenPort: process.env.PORT || config.server.listenPort,
    distFolder: distFolder,
    uploadDir: config.server.uploadDir,
    staticUrl: config.server.staticUrl,
    cookieSecret: config.server.cookieSecret
  }
};
