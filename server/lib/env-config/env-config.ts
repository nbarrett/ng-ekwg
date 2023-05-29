import debug from "debug";
import * as configData from "config";

function validatedEnvironmentVariable(variableName: string): string {
  const variableValue = process.env[variableName];
  if (!variableValue) {
    throw new Error("Environment variable '" + variableName + "' must be set");
  }
  return variableValue;
}

const env = validatedEnvironmentVariable("NODE_ENV");

function logNamespace(moduleName: string) {
  return `ekwg:${env}:${moduleName || ""}`;
}

const debugLog = debug(logNamespace("env-config"));
debugLog("configData:", JSON.stringify(configData));
export const envConfig = {
  auth: {
    secret: validatedEnvironmentVariable("AUTH_SECRET"),
  },
  aws: {
    accessKeyId: validatedEnvironmentVariable("AWS_ACCESS_KEY_ID"),
    baseHostingUrl: `http://s3-${configData.aws.region}.${configData.aws.domain}/${configData.aws.bucket}`,
    bucket: configData.aws.bucket,
    domain: configData.aws.domain,
    region: configData.aws.region,
    secretAccessKey: validatedEnvironmentVariable("AWS_SECRET_ACCESS_KEY"),
    uploadUrl: `https://${configData.aws.bucket}.s3.amazonaws.com`,
  },
  dev: env !== "production",
  env,
  googleMaps: {
    apiKey: validatedEnvironmentVariable("GOOGLE_MAPS_APIKEY"),
  },
  instagram: {
    accessToken: validatedEnvironmentVariable("INSTAGRAM_ACCESS_TOKEN"),
    clientId: validatedEnvironmentVariable("INSTAGRAM_CLIENT_ID"),
    clientSecret: validatedEnvironmentVariable("INSTAGRAM_CLIENT_SECRET"),
    userId: validatedEnvironmentVariable("INSTAGRAM_USER_ID"),
  },
  logNamespace,
  mailchimp: {
    apiKey: validatedEnvironmentVariable("MAILCHIMP_APIKEY"),
    lists: {
      general: configData.mailchimp.lists.general,
      socialEvents: configData.mailchimp.lists.socialEvents,
      walks: configData.mailchimp.lists.walks,
    },
  },
  meetup: {
    apiUrl: configData.meetup.apiUrl,
    group: configData.meetup.group,
    oauth: {
      accessToken: validatedEnvironmentVariable("MEETUP_ACCESS_TOKEN"),
    },
    url: configData.meetup.url,
  },
  mongo: {
    uri: validatedEnvironmentVariable("MONGODB_URI"),
  },
  production: env === "production",
  ramblers: {
    groupCode: configData.ramblers.groupCode,
    apiKey: validatedEnvironmentVariable("RAMBLERS_WALKS_MANAGER_API_KEY"),
    walksManager: {
      password: validatedEnvironmentVariable("RAMBLERS_WALKS_MANAGER_PASSWORD"),
      userName: validatedEnvironmentVariable("RAMBLERS_WALKS_MANAGER_USER"),
    },
    listWalksPath: configData.ramblers.listWalksPath,
    url: configData.ramblers.url,
  },
  server: {
    listenPort: process.env.PORT || configData.server.listenPort,
    staticUrl: configData.server.staticUrl,
    uploadDir: configData.server.uploadDir,
  },
};
