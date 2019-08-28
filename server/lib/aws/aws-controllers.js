"use strict";
let config = require("../config/config.js");
let url = require("url");
let debug = require("debug")(config.logNamespace("aws"));
let AWS = require("aws-sdk");
let http = require("http");
let crypto = require("crypto");
let s3Config = {accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey};
let s3 = new AWS.S3(s3Config);
let fs = require("fs");
let path = require("path");
let baseHostingUrl = config.aws.baseHostingUrl;
http.globalAgent.maxSockets = 20;
debug("configured with", s3Config, "Proxying S3 requests to", baseHostingUrl);

function expiryTime() {
  var _date = new Date();
  var expiryDate = `${_date.getFullYear()}-${_date.getMonth() + 1}-${_date.getDate() + 1}T${_date.getHours() + 3}:00:00.000Z`;
  debug("expiryDate:", expiryDate);
  return expiryDate;
}

exports.get = function (req, res, next) {
  debug("req.method:", req.method, "req.url:", req.url, "req.params", req.params);
  var remoteUrl = `${baseHostingUrl}/${req.params.bucket}${req.params[0]}`;
  debug("mapping Request from", req.method, req.url, "-> server path", remoteUrl);
  http.get(remoteUrl, function (serverResponse) {
    serverResponse.pipe(res);
  }).on("error", function (e) {
    debug("Got error", e.message, "on s3 request", remoteUrl);
  });
};

exports.getConfig = function (req, res) {
  return res.send(config.aws);
};

exports.s3Policy = function (req, res) {
  debug("req.query.mimeType", req.query.mimeType, "req.query.objectKey", req.query.objectKey);
  var s3Policy = {
    "expiration": expiryTime(),
    "conditions": [
      ["starts-with", "$key", `${req.query.objectKey ? req.query.objectKey : ""}/`],
      {"bucket": config.aws.bucket},
      {"acl": "public-read"},
      ["starts-with", "$Content-Type", req.query.mimeType ? req.query.mimeType : ""],
      {"success_action_status": "201"},
    ],
  };

  // stringify and encode the policy
  var stringPolicy = JSON.stringify(s3Policy);
  var base64Policy = new Buffer(stringPolicy, "utf-8").toString("base64");

  debug("s3Policy", s3Policy);
  debug("config.aws.secretAccessKey", config.aws.secretAccessKey);

  // sign the base64 encoded policy
  var signature = crypto.createHmac("sha1", config.aws.secretAccessKey)
    .update(new Buffer(base64Policy, "utf-8")).digest("base64");

  return res.status(200).send({
    s3Policy: base64Policy,
    s3Signature: signature,
    AWSAccessKeyId: config.aws.accessKeyId,
  });
};

exports.listBuckets = function (req, res) {
  s3.listBuckets(function (err, data) {
    debug("data.Buckets", data);
    if (!err) {
      return res.status(200).send(data);
    } else {
      return res.status(500).send(err);
    }
  });
};

exports.putObject = function (req, res) {
  let uploadedFile = _.first(req.files);
  debug("received file", uploadedFile.originalname, "into location", uploadedFile.path, "containing", uploadedFile.size, "bytes");
  return exports.putObjectDirect(req.params.key, req.params.file)
    .then(function (response) {
      if (response.error) {
        return res.status(500).send(response);
      } else {
        return res.status(200).send(response);
      }
    });
};

exports.putObjectDirect = function (rootFolder, fileName, localFileName) {
  debug("configured with", s3Config);
  let bucket = config.aws.bucket;

  let objectKey = `${rootFolder}/${path.basename(fileName)}`;
  let data = fs.readFileSync(localFileName);
  let params = {
    Bucket: bucket,
    Key: objectKey,
    Body: data,
    ACL: "public-read",
  };
  debug(`Saving file to ${bucket}/${objectKey}`);
  return s3.putObject(params).promise()
    .then(function (data) {
      let information = `Successfully uploaded file to ${bucket}/${objectKey}`;
      debug(information, "->", data);
      return ({responseData: data, information: information});
    })
    .catch(function (error) {
      let errorMessage = `Failed to upload object to ${bucket}/${objectKey}`;
      debug(errorMessage, "->", error);
      return ({responseData: error, error: errorMessage});
    });
};

exports.getObject = function (req, res) {
  var key = req.params.key + "/" + req.params.file;
  var options = {Bucket: config.aws.bucket, Key: key};
  debug("getting object", options);
  s3.getObject(options).createReadStream().pipe(res)
    .on("error", function (e) {
      debug("Got error", e.message, "on s3 request", key);
    });
};
