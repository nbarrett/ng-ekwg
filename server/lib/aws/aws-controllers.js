const {envConfig} = require("../env-config/env-config");
const moment = require("moment-timezone");
const {first} = require("lodash");
const debug = require("debug")(envConfig.logNamespace("aws"));
debug.enabled = true;
const AWS = require("@aws-sdk/client-s3");
const https = require("https");
const crypto = require("crypto");
const s3Config = {
  accessKeyId: envConfig.aws.accessKeyId,
  secretAccessKey: envConfig.aws.secretAccessKey,
  region: envConfig.aws.region
};
const s3 = new AWS.S3(s3Config);
const fs = require("fs");
const path = require("path");
const {GetObjectCommand} = require('@aws-sdk/client-s3');
const baseHostingUrl = envConfig.aws.baseHostingUrl;
debug("configured with", s3Config, "Proxying S3 requests to", baseHostingUrl,"http.globalAgent.maxSockets:", https.globalAgent.maxSockets);

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

exports.getObjectInChunks = async (req, res) => {
  const getObjectCommand = new GetObjectCommand(optionsFrom(req));
  try {
    const response = await s3.send(getObjectCommand)

    // Store all of data chunks returned from the response data stream
    // into an array then use Array#join() to use the returned contents as a String
    const responseDataChunks = [];

    // Handle an error while streaming the response body
    response.Body.once('error', err => res.status(500).send(err))

    // Attach a 'data' listener to add the chunks of data to our array
    // Each chunk is a Buffer instance
    response.Body.on('data', chunk => responseDataChunks.push(chunk))

    // Once the stream has no more data, join the chunks into a string and return the string
    response.Body.once('end', () => res.status(200).send(responseDataChunks.join('')));
  } catch (err) {
    // Handle the error or throw
    res.status(500).send(err)
  }
}

exports.getObject = async (req, res) => {
  const options = optionsFrom(req);
  const getObjectCommand = new GetObjectCommand(options);
  try {
    debug("getting object command using options", options)
    const s3Item = await s3.send(getObjectCommand);
    debug("got object", s3Item)
    res.writeHead(200);
    s3Item.Body.pipe(res);
    debug("returned object command using options", options)
  } catch (err) {
    debug("failed getting object command using options", options, err)
    res.status(500).send(err)
  }
}

function optionsFrom(req) {
  const key = `${req.params.bucket}${req.params[0]}`;
  return {Bucket: envConfig.aws.bucket, Key: key};
}

exports.getObjectAsBase64 = async (req, res) => {
  const options = optionsFrom(req);
  debug("getting object", options);
  try {
    const response = await s3.getObject(options);
    debug("received response Body:", response.Body);
    const text = await response.Body.text();
    const src = `data:image/jpeg;base64,${text}`;
    debug("src", src);
    res.status(200).send(src);
  } catch (error) {
    debug("Caught error", error.message, "on s3 request", options.key);
    res.status(500).send(error)
  }
};

exports.get = async (req, res) => {
  const options = optionsFrom(req)
  const response = await s3.getObject(options);
  debug("received response Body:", response.Body);
  const imageBytes = await response.Body.arrayBuffer();
  const blob = new Blob([imageBytes], {type: "image/jpeg"});
  const imageUrl = URL.createObjectURL(blob);
  debug("blob", blob, "imageUrl:", imageUrl);
  res.status(200).send(imageUrl);
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
  return s3.putObject(params)
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

exports.urlToFile = (req, res) => {
  const remoteUrl = req.query.url;
  debug("req.query.url:", remoteUrl);
  debug("downloading remote image from",  remoteUrl);
  https.get(remoteUrl, serverResponse => {
    serverResponse.pipe(res);
  }).on("error", e => {
    debug("Got error", e.message, "on s3 request", remoteUrl);
  });
};
