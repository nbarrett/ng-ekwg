"use strict";
const config = require("../config/config.js");
const aws = require("../aws/aws-controllers");
const debug = require("debug")(config.logNamespace("ramblers:memberBulkLoad"));
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const moment = require("moment-timezone");
const {find, first, chain, isEmpty, isObject, map, get} = require("lodash");
const csv = require("csv");
const childProcess = require("child_process");
const BULK_LOAD_SUFFIX = "MemberList.csv";
const NEW_MEMBER_SUFFIX = "new.csv";
const EXCEL_SUFFIX = ".xls";

exports.uploadRamblersData = (req, res) => {
  var momentInstance = moment().tz("Europe/London");
  const uploadSessionFolder = `memberAdmin/${momentInstance.format("YYYY-MM-DD-HH-mm-ss")}`;
  const uploadedFile = uploadedFileInfo();

  const bulkUploadResponse = {files: {}, auditLog: []};
  const bulkUploadError = {error: undefined};

  debugAndInfo("Received uploaded member data file", uploadedFile.originalname, "containing", uploadedFile.size, "bytes");
  if (fileExtensionIs(".zip")) {
    extractZipFile(uploadedFile.path, uploadedFile.originalname, res);
  } else if (fileExtensionIs(".csv") && filenameValid()) {
    extractCsvToJson(uploadedFile.path, uploadedFile.originalname, res);
  } else if (isExcel()) {
    extractExcelDataToJson(uploadedFile.path, uploadedFile.originalname, res);
  } else {
    fs.unlink(uploadedFile.originalname, () => {
      debugAndError(`Only zip files or files that end with "${BULK_LOAD_SUFFIX}", ${EXCEL_SUFFIX} or "${NEW_MEMBER_SUFFIX}" are allowed, but you supplied ${uploadedFile.originalname}`)
      returnResponse();
    });
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

  function debugAndComplete() {
    logWithStatus("complete", arguments);
  }

  function debugAndInfo() {
    logWithStatus("info", arguments);
  }

  function debugAndError() {
    logWithStatus("error", arguments);
  }

  function isExcel() {
    return uploadedFile.originalname.includes(EXCEL_SUFFIX);
  }

  function filenameValid() {
    return uploadedFile.originalname.endsWith(BULK_LOAD_SUFFIX) || uploadedFile.originalname.endsWith(NEW_MEMBER_SUFFIX) || isExcel();
  }

  function uploadedFileInfo() {
    return first(req.files);
  }

  function fileExtensionIs(extension) {
    return path.extname(uploadedFileInfo().originalname).toLowerCase() === extension;
  }

  function extractZipFile(receivedZipFileName, userZipFileName, res) {
    aws.putObjectDirect(uploadSessionFolder, userZipFileName, receivedZipFileName).then(response => {
        if (response.error) {
          return res.status(500).send(response);
        } else {
          debugAndInfo(response.information);
          bulkUploadResponse.files.archive = `${uploadSessionFolder}/${uploadedFile.originalname}`;
          const inflateToken = "inflating:";
          const unzipPath = "/tmp/memberData/";
          const zip = childProcess.spawn("unzip", ["-P", "J33ves33", "-o", "-d", unzipPath, receivedZipFileName]);
          let zipOutputLines = [];
          let zipErrorLines = [];

          const handleError = data => {
            zipErrorLines = zipErrorLines.concat(data.toString().trim().split("\n"));
            debugAndError(`Unzip of ${userZipFileName} ended unsuccessfully. Unzip process terminated with: ${zipErrorLines.join(", ")}`)
            returnResponse();
          };

          zip.stdout.on("data", data => {
            const logOutput = data.toString().trim().split("\n").filter(item => !isEmpty(item));
            if (logOutput.length > 0) {
              debugAndInfo("Unzip output [" + logOutput + "]");
              zipOutputLines = zipOutputLines.concat(logOutput);
            }
          });

          zip.on("error", handleError);

          zip.stderr.on("data", handleError);

          zip.on("exit", code => {
            if (code !== 0) {
              debugAndError(`Unzip of ${userZipFileName} ended unsuccessfully. Unzip process terminated with: ${zipErrorLines.join(", ")}`);
              returnResponse();
            } else {
              const extractedFiles = chain(zipOutputLines)
                .filter(file => file.includes(inflateToken))
                .map(file => file.replace(inflateToken, "").trim())
                .value();
              debugAndInfo("Unzip process completed successfully after processing", receivedZipFileName, "and extracted", extractedFiles.length, "file(s):", extractedFiles.join(", "));
              if (extractedFiles.length === 0) {
                debugAndError("No files could be unzipped from " + userZipFileName)
                returnResponse();
              } else {
                extractFromFile(unzipPath, extractedFiles, BULK_LOAD_SUFFIX, res).then(response => {
                  if (response.error) {
                    debugAndError(response.error);
                    returnResponse();
                  } else if (!response) {
                    extractFromFile(unzipPath, extractedFiles, NEW_MEMBER_SUFFIX, res).then(response => {
                      if (!response) {
                        debugAndError(`No bulk load or new member file could be found in zip ${userZipFileName}.${extractedFiles.length} ignored files were: ${extractedFiles.join(", ")}`)
                        returnResponse();
                      }
                    })
                  }
                });
              }
            }
          });
        }
      }
    );
  }

  function extractExcelDataToJson(uploadedWorkbook, userFileName, res) {
    debug('Reading members from ' + uploadedWorkbook);
    var workbook = xlsx.readFile(uploadedWorkbook);
    var ramblersSheet = chain(workbook.SheetNames)
      .filter(function (sheet) {
        debug("sheet", sheet);
        return sheet.includes("Full List");
      }).first().value();
    debug('Importing data from workbook sheet', ramblersSheet);
    var json = xlsx.utils.sheet_to_json(workbook.Sheets[ramblersSheet]);
    if (json.length > 0) {
      extractMemberDataFromArray(json, userFileName, res)
      return returnResponse();
    } else {
      debugAndError('Excel workbook ' + userFileName + ' did not contain a sheet called [' + ramblersSheet + '] or no data rows were found in it');
      returnResponse();
    }
  }

  function extractFromFile(unzipPath, extractedFiles, fileNameSuffix, res) {
    const memberDataFileName = find(extractedFiles, file => file.endsWith(fileNameSuffix));
    if (memberDataFileName) {
      debugAndInfo(memberDataFileName, "matched", fileNameSuffix);
      return aws.putObjectDirect(uploadSessionFolder, memberDataFileName, memberDataFileName)
        .then(response => {
          if (response.error) {
            return response;
          } else {
            debugAndInfo(response.information);
            extractCsvToJson(memberDataFileName, path.basename(memberDataFileName), res);
            return true;
          }
        });
    } else {
      debugAndInfo("No files matched", fileNameSuffix);
      return Promise.resolve(false);
    }
  }

  function extractMemberDataFromArray(json, userFileName, res) {
    let currentDataRow;
    try {
      const memberDataRows = chain(json)
        .map(dataRow => {
          currentDataRow = dataRow;
          if (dataRow["[Expiry Date]"]) {
            return {
              membershipExpiryDate: dataRow["[Expiry Date]"].trim(),
              membershipNumber: dataRow["[Membership Number]"].trim(),
              mobileNumber: dataRow["[Telephone]"].trim(),
              email: dataRow["[Private Email]"].trim(),
              firstName: dataRow["[Forenames]"] || dataRow["[Initials]"].trim(),
              lastName: dataRow["[Surname]"].trim(),
              postcode: dataRow["[Postcode]"].trim()
            }
          } else if (dataRow["Membership_No"]) {
            return {
              membershipNumber: dataRow["Membership_No"].trim(),
              mobileNumber: dataRow["Tel"].trim(),
              email: dataRow["Email"].trim(),
              firstName: dataRow["Forenames"] || dataRow["Initials"].trim(),
              lastName: dataRow["Surname"].trim(),
              postcode: dataRow["PostCode"].trim()
            }
          } else if (dataRow["Mem No."]) {
            return {
              membershipExpiryDate: dataRow["Expiry date"].trim(),
              membershipNumber: dataRow["Mem No."],
              mobileNumber: dataRow["Mobile Telephone"].trim(),
              email: dataRow["Email Address"].trim(),
              firstName: dataRow["Forenames"] || dataRow["Initials"].trim(),
              lastName: dataRow["Surname"].trim(),
              postcode: dataRow["Postcode"].trim()
            }
          } else {
            return debugAndError("Loading of data from " + userFileName + " failed processing data row " + JSON.stringify(currentDataRow) + " due to membership record type not being recognised");
          }
        })
        .filter(dataRow => dataRow && dataRow.membershipNumber).value();
      bulkUploadResponse.members = memberDataRows;
      debugAndComplete(`${memberDataRows.length} member(s) were extracted from ${userFileName}`);
    } catch (error) {
      debugAndError("Error attempting to extract data from", userFileName);
      debugAndError("Error message:" + error.message);
      debugAndError("Error stack:", error.stack);
      return debugAndError("Loading of data from " + userFileName + " failed processing data row " + JSON.stringify(currentDataRow) + " due to unexpected error:" + error);
    }
  }

  function extractCsvToJson(localFileName, userFileName, res) {
    debugAndInfo("Extracting member data from", userFileName);
    bulkUploadResponse.files.data = `${uploadSessionFolder}/${userFileName}`;

    csv()
      .from.path(localFileName, {
      columns: true, delimiter: ",", escape: "\""
    })
      .to.array(data => {
      extractMemberDataFromArray(data, userFileName, res)
      returnResponse();
    })
      .on("error", error => {
        debugAndError("Data could not be extracted from", localFileName, error);
        returnResponse();
      });
  }

}
