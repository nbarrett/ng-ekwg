const {envConfig} = require("../env-config/env-config");
const moment = require("moment-timezone");
const {first, isObject, map} = require("lodash");
const debug = require("debug")(envConfig.logNamespace("aws"));
const AWS = require("aws-sdk");
const http = require("http");
const crypto = require("crypto");
const s3Config = {accessKeyId: envConfig.aws.accessKeyId, secretAccessKey: envConfig.aws.secretAccessKey};
const s3 = new AWS.S3(s3Config);
const fs = require("fs");
const path = require("path");
const baseHostingUrl = envConfig.aws.baseHostingUrl;
http.globalAgent.maxSockets = 20;
debug("configured with", s3Config, "Proxying S3 requests to", baseHostingUrl);

function expiryTime() {
  const _date = new Date();
  const expiryDate = `${_date.getFullYear()}-${_date.getMonth() + 1}-${_date.getDate() + 1}T${_date.getHours() + 3}:00:00.000Z`;
  debug("expiryDate:", expiryDate);
  return expiryDate;
}

exports.listObjects = (req, res) => {
  const bucketParams = {
    Bucket: envConfig.aws.bucket,
    Prefix: req.params.prefix,
    MaxKeys: 2000
  };
  s3.listObjects(bucketParams, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      const response = data.Contents.map(item => ({
        key: item.Key,
        lastModified: moment(item.LastModified).tz("Europe/London").valueOf(),
        size: item.Size
      }))
      return res.status(200).send(response);
    }
  });
};

exports.getObject = (req, res) => {
  const key = `${req.params.bucket}${req.params[0]}`;
  const options = {Bucket: envConfig.aws.bucket, Key: key};
  debug("getting object", options);
  try {
    s3.getObject(options).createReadStream()
      .on("error", error => {
        debug("On error", error.message, "on s3 request", key);
        res.status(500).send(error);
      }).pipe(res)
  } catch (error) {
    debug("Caught error", error.message, "on s3 request", key);
    res.status(500).send(error)
  }
};

exports.get = (req, res) => {
  debug("req.method:", req.method, "req.url:", req.url, "req.params", req.params);
  const remoteUrl = `${baseHostingUrl}/${req.params.bucket}${req.params[0]}`;
  debug("mapping Request from", req.method, req.url, "-> server path", remoteUrl);
  http.get(remoteUrl, serverResponse => {
    serverResponse.pipe(res);
  }).on("error", e => {
    debug("Got error", e.message, "on s3 request", remoteUrl);
  });
};

exports.getConfig = (req, res) => res.send(envConfig.aws);

exports.s3Policy = (req, res) => {
  debug("req.query.mimeType", req.query.mimeType, "req.query.objectKey", req.query.objectKey);
  const s3Policy = {
    "expiration": expiryTime(),
    "conditions": [
      ["starts-with", "$key", `${req.query.objectKey ? req.query.objectKey : ""}/`],
      {"bucket": envConfig.aws.bucket},
      {"acl": "public-read"},
      ["starts-with", "$Content-Type", req.query.mimeType ? req.query.mimeType : ""],
      {"success_action_status": "201"},
    ],
  };

  // stringify and encode the policy
  const stringPolicy = JSON.stringify(s3Policy);
  const base64Policy = new Buffer(stringPolicy, "utf-8").toString("base64");

  debug("s3Policy", s3Policy);
  debug("config.aws.secretAccessKey", envConfig.aws.secretAccessKey);

  // sign the base64 encoded policy
  const signature = crypto.createHmac("sha1", envConfig.aws.secretAccessKey)
    .update(new Buffer(base64Policy, "utf-8")).digest("base64");

  return res.status(200).send({
    s3Policy: base64Policy,
    s3Signature: signature,
    AWSAccessKeyId: envConfig.aws.accessKeyId,
  });
};

exports.listBuckets = (req, res) => {
  s3.listBuckets((err, data) => {
    if (!err) {
      return res.status(200).send(data);
    } else {
      return res.status(500).send(err);
    }
  });
};

exports.putObject = (req, res) => {
  const uploadedFile = first(req.files);
  debug("received file", uploadedFile.originalname, "into location", uploadedFile.path, "containing", uploadedFile.size, "bytes");
  return exports.putObjectDirect(req.params.key, req.params.file)
    .then(response => {
      if (response.error) {
        return res.status(500).send(response);
      } else {
        return res.status(200).send(response);
      }
    });
};

exports.putObjectDirect = (rootFolder, fileName, localFileName) => {
  debug("configured with", s3Config);
  const bucket = envConfig.aws.bucket;

  const objectKey = `${rootFolder}/${path.basename(fileName)}`;
  const data = fs.readFileSync(localFileName);
  const params = {
    Bucket: bucket,
    Key: objectKey,
    Body: data,
    ACL: "public-read",
  };
  debug(`Saving file to ${bucket}/${objectKey}`);
  return s3.putObject(params).promise()
    .then(data => {
      const information = `Successfully uploaded file to ${bucket}/${objectKey}`;
      debug(information, "->", data);
      return ({responseData: data, information: information});
    })
    .catch(error => {
      const errorMessage = `Failed to upload object to ${bucket}/${objectKey}`;
      debug(errorMessage, "->", error);
      return ({responseData: error, error: errorMessage});
    });
};
