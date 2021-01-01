const {envConfig} = require("../env-config/env-config");
const aws = require("../aws/aws-controllers");
const debug = require("debug")(envConfig.logNamespace("s3-file-upload"));
const {keys, last, first, isObject, map} = require("lodash");
const stringUtils = require("../shared/string-utils");
exports.uploadFile = (req, res) => {

  const bulkUploadResponse = {files: {}, auditLog: []};
  const bulkUploadError = {error: undefined};

  debugAndInfo("Received file request with keys:", keys(req), "req.query", req.query);
  const rootFolder = req.query["root-folder"];
  const uploadedFile = uploadedFileInfo();
  const fileNameData = generateFileNameData(uploadedFile.originalname);

  debugAndInfo("Received file", "rootFolder", rootFolder, uploadedFile.originalname, "to", uploadedFile.path, "containing", uploadedFile.size, "bytes", "renaming to", fileNameData.awsFileName);
  aws.putObjectDirect(rootFolder, fileNameData.awsFileName, uploadedFile.path).then(response => {
    if (response.error) {
      return res.status(500).send(response);
    } else {
      bulkUploadResponse.awsInfo = response;
      bulkUploadResponse.fileNameData = fileNameData;
      bulkUploadResponse.uploadedFile = uploadedFile;
      debugAndInfo("File upload completed successfully after processing", uploadedFile.path);
      returnResponse();
    }
  });

  function generateFileNameData(name) {
    return {
      rootFolder,
      originalFileName: name,
      awsFileName: stringUtils.generateUid() + '.' + last(name.split('.'))
    }
  }

  function returnResponse() {
    const response = {response: bulkUploadResponse};
    if (bulkUploadError.error) {
      response.error = bulkUploadError.error
    }
    res.json(response)
  }

  function logWithStatus(status, argumentsData) {
    var debugData = map(argumentsData, item => isObject(item) ? JSON.stringify(item) : item).join(" ");
    debug(debugData);
    bulkUploadResponse.auditLog.push({status: status, message: debugData});
    if (status === "error") {
      bulkUploadError.error = debugData
    }
  }

  function debugAndInfo() {
    logWithStatus("info", arguments);
  }

  function uploadedFileInfo() {
    return first(req.files);
  }

}
