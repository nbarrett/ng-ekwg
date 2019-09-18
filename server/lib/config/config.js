"use strict";
let path = require("path");
let config = require("config");
let distFolder = path.resolve(__dirname, config.server.distFolder);

function validatedEnvironmentVariable(variableName) {
  let variableValue = process.env[variableName];
  if (!variableValue) {
    throw new Error("Environment variable '" + variableName + "' must be set");
  }
  return variableValue;
}

function logNamespace(moduleName) {
  return `ekwg:${validatedEnvironmentVariable("NODE_ENV")}:${moduleName || ""}`;
}

module.exports = {
  aws: {
    accessKeyId: validatedEnvironmentVariable("AWS_ACCESS_KEY_ID"),
    baseHostingUrl: "http://s3-" + config.aws.region + "." + config.aws.domain + "/" + config.aws.bucket,
    bucket: config.aws.bucket,
    domain: config.aws.domain,
    region: config.aws.region,
    secretAccessKey: validatedEnvironmentVariable("AWS_SECRET_ACCESS_KEY"),
    uploadUrl: "https://" + config.aws.bucket + ".s3.amazonaws.com",
  },
  env: validatedEnvironmentVariable("NODE_ENV"),
  googleMaps: {
    apiKey: validatedEnvironmentVariable("GOOGLE_MAPS_APIKEY"),
  },
  instagram: {
    accessToken: validatedEnvironmentVariable("INSTAGRAM_ACCESS_TOKEN"),
    clientId: validatedEnvironmentVariable("INSTAGRAM_CLIENT_ID"),
    clientSecret: validatedEnvironmentVariable("INSTAGRAM_CLIENT_SECRET"),
    userId: validatedEnvironmentVariable("INSTAGRAM_USER_ID"),
  },
  logNamespace: logNamespace,
  mailchimp: {
    apiKey: validatedEnvironmentVariable("MAILCHIMP_APIKEY"),
    lists: {
      general: config.mailchimp.lists.general,
      socialEvents: config.mailchimp.lists.socialEvents,
      walks: config.mailchimp.lists.walks,
    },
  },
  meetup: {
    group: config.meetup.group,
    url: config.meetup.url,
    apiUrl: config.meetup.apiUrl,
    oauth: {
      accessToken: validatedEnvironmentVariable("MEETUP_ACCESS_TOKEN")
    }
  },
  mongo: {
    apiKey: validatedEnvironmentVariable("MONGOLAB_APIKEY"),
    database: config.mongo.database,
    dbUrl: config.mongo.dbUrl,
  },
  ramblers: {
    gwem: {
      password: validatedEnvironmentVariable("RAMBLERS_GWEM_PASSWORD"),
      userName: validatedEnvironmentVariable("RAMBLERS_GWEM_USER"),
    },
    listWalksPath: config.ramblers.listWalksPath,
    url: config.ramblers.url,
    walkDescriptionPrefix: config.ramblers.walkDescriptionPrefix,
  },
  server: {
    cookieSecret: config.server.cookieSecret,
    distFolder: distFolder,
    listenPort: process.env.PORT || config.server.listenPort,
    staticUrl: config.server.staticUrl,
    uploadDir: config.server.uploadDir,
  },
};
