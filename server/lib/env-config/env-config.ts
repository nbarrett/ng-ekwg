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

export const envConfig = {
  production: env === "production",
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
  server: {
    listenPort: process.env.PORT || configData.server.listenPort,
    staticUrl: configData.server.staticUrl,
    uploadDir: configData.server.uploadDir,
  },
};
