'use strict';
let config = require('../../config.js');
let aws = require('../aws/aws');
let debug = require('debug')(config.logNamespace('ramblers:memberBulkLoad'));
let path = require('path');
let fs = require('fs');
let moment = require('moment-timezone');
let _ = require('underscore');
let _str = require('underscore.string');
let csv = require('csv');
let childProcess = require('child_process');
let BULK_LOAD_SUFFIX = 'MemberList.csv';
let NEW_MEMBER_SUFFIX = 'new.csv';

exports.uploadRamblersData = function (req, res) {
  var momentInstance = moment().tz('Europe/London');
  let uploadSessionFolder = `memberAdmin/${momentInstance.format('YYYY-MM-DD-HH-mm-ss')}`;
  let uploadedFile = uploadedFileInfo();

  let bulkUploadResponse = {files: {}, auditLog: []};
  debugAndInfo('Received uploaded member data file', uploadedFile.originalname, 'into location', uploadedFile.path, 'containing', uploadedFile.size, 'bytes');
  if (fileExtensionIs('.zip')) {
    extractZipFile(uploadedFile.path, uploadedFile.originalname, res);
  } else if (fileExtensionIs('.csv') && filenameValid()) {
    extractCsvToJson(uploadedFile.path, uploadedFile.originalname, res);
  } else {
    fs.unlink(uploadedFile.originalname, function () {
      res.json(debugAndError(`Only zip files or files that end with '${BULK_LOAD_SUFFIX}' or '${NEW_MEMBER_SUFFIX}' are allowed, but you supplied ${uploadedFile.originalname}`))
    });
  }

  function logWithStatus(status, argumentsData) {
    var debugData = _.map(argumentsData, function (item) {
      return _.isObject(item) ? JSON.stringify(item) : item;
    }).join(" ");
    debug(debugData);
    bulkUploadResponse.auditLog.push({status: status, message: debugData});
    if (status === 'error') {
      bulkUploadResponse.error = debugData
    }
    return bulkUploadResponse;
  }

  function debugAndComplete() {
    return logWithStatus('complete', arguments);
  }

  function debugAndInfo() {
    return logWithStatus('info', arguments);
  }

  function debugAndError(errorMessage) {
    return logWithStatus('error', arguments);
  }


  function filenameValid() {
    return _str.endsWith(uploadedFile.originalname, BULK_LOAD_SUFFIX) || _str.endsWith(uploadedFile.originalname, NEW_MEMBER_SUFFIX);
  }

  function uploadedFileInfo() {
    return _.first(req.files);
  }

  function fileExtensionIs(extension) {
    return path.extname(uploadedFileInfo().originalname).toLowerCase() === extension;
  }

  function extractZipFile(receivedZipFileName, userZipFileName, res) {

    aws.putObjectDirect(uploadSessionFolder, userZipFileName, receivedZipFileName).then(function (response) {
        if (response.error) {
          return res.status(500).send(response);
        } else {
          debugAndInfo(response.information);
          bulkUploadResponse.files.archive = `${uploadSessionFolder}/${uploadedFile.originalname}`;
          let inflateToken = 'inflating:';
          let unzipPath = '/tmp/memberData/';
          let zip = childProcess.spawn('unzip', ['-P', 'J33ves33', '-o', '-d', unzipPath, receivedZipFileName]);
          let zipOutputLines = [];
          let zipErrorLines = [];

          let handleError = function (data) {
            zipErrorLines = zipErrorLines.concat(data.toString().trim().split('\n'));
            res.json(debugAndError(`Unzip of ${userZipFileName} ended unsuccessfully. Unzip process terminated with: ${zipErrorLines.join(', ')}`));
          };

          zip.stdout.on('data', function (data) {
            let logOutput = data.toString().trim().split('\n').filter(item => !_.isEmpty(item));
            if (logOutput.length > 0) {
              debugAndInfo('Unzip output [' + logOutput + ']');
              zipOutputLines = zipOutputLines.concat(logOutput);
            }
          });

          zip.on('error', handleError);

          zip.stderr.on('data', handleError);

          zip.on('exit', function (code) {
            if (code !== 0) {
              res.json(debugAndError(`Unzip of ${userZipFileName} ended unsuccessfully. Unzip process terminated with: ${zipErrorLines.join(', ')}`));
            } else {
              let extractedFiles = _.chain(zipOutputLines)
                .filter(function (file) {
                  return _str.include(file, inflateToken);
                })
                .map(function (file) {
                  return file.replace(inflateToken, '').trim();
                })
                .value();
              debugAndInfo('Unzip process completed successfully after processing', receivedZipFileName, 'and extracted', extractedFiles.length, 'file(s):', extractedFiles.join(', '));
              if (extractedFiles.length === 0) {
                res.json(debugAndError('No files could be unzipped from ' + userZipFileName));
              } else {
                extractFromFile(unzipPath, extractedFiles, BULK_LOAD_SUFFIX, res).then(function (response) {
                  if (response.error) {
                    debugAndError(response.error);
                    res.json(bulkUploadResponse);
                  } else if (!response) {
                    extractFromFile(unzipPath, extractedFiles, NEW_MEMBER_SUFFIX, res).then(function (response) {
                      if (!response) {
                        res.json(debugAndError(`No bulk load or new member file could be found in zip ${userZipFileName}.${extractedFiles.length} ignored files were: ${extractedFiles.join(", ")}`));
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

  function extractFromFile(unzipPath, extractedFiles, fileNameSuffix, res) {
    let memberDataFileName = _.find(extractedFiles, function (file) {
      return _str.endsWith(file, fileNameSuffix);
    });
    if (memberDataFileName) {
      debugAndInfo(memberDataFileName, 'matched', fileNameSuffix);
      return aws.putObjectDirect(uploadSessionFolder, memberDataFileName, memberDataFileName)
        .then(function (response) {
          if (response.error) {
            return response;
          } else {
            debugAndInfo(response.information);
            extractCsvToJson(memberDataFileName, path.basename(memberDataFileName), res);
            return true;
          }
        });
    } else {
      debugAndInfo('No files matched', fileNameSuffix);
      return Promise.resolve(false);
    }
  }

  function extractMemberDataFromArray(json, userFileName, res) {
    let currentDataRow;
    try {
      let memberDataRows = _.chain(json)
        .map(function (dataRow) {
          currentDataRow = dataRow;
          if (dataRow['[Expiry Date]']) {
            return {
              membershipExpiryDate: dataRow['[Expiry Date]'].trim(),
              membershipNumber: dataRow['[Membership Number]'].trim(),
              mobileNumber: dataRow['[Telephone]'].trim(),
              email: dataRow['[Private Email]'].trim(),
              firstName: dataRow['[Forenames]'] || dataRow['[Initials]'].trim(),
              lastName: dataRow['[Surname]'].trim(),
              postcode: dataRow['[Postcode]'].trim()
            }
          } else if (dataRow['Membership_No']) {
            return {
              membershipNumber: dataRow['Membership_No'].trim(),
              mobileNumber: dataRow['Tel'].trim(),
              email: dataRow['Email'].trim(),
              firstName: dataRow['Forenames'] || dataRow['Initials'].trim(),
              lastName: dataRow['Surname'].trim(),
              postcode: dataRow['PostCode'].trim()
            }
          } else {
            return debugAndError('Loading of data from ' + userFileName + ' failed processing data row ' + JSON.stringify(currentDataRow) + ' due to membership record type not being recognised');
          }
        })
        .filter(function (dataRow) {
          return dataRow.membershipNumber;
        }).value();
      bulkUploadResponse.members = memberDataRows;
      debugAndComplete(`${memberDataRows.length} member(s) were extracted from ${userFileName}`);
      return bulkUploadResponse;
    } catch (error) {
      debugAndError('Error attempting to extract data from', userFileName);
      debugAndError('Error message:' + error.message);
      debugAndError('Error stack:', error.stack);
      return debugAndError('Loading of data from ' + userFileName + ' failed processing data row ' + JSON.stringify(currentDataRow) + ' due to unexpected error:' + error);
    }
  }

  function extractCsvToJson(localFileName, userFileName, res) {
    debugAndInfo('Extracting member data from', userFileName);
    bulkUploadResponse.files.data = `${uploadSessionFolder}/${userFileName}`;

    csv()
      .from.path(localFileName, {columns: true, delimiter: ',', escape: '"'})
      .to.array(function (data) {
      res.json(extractMemberDataFromArray(data, userFileName, res));
    })
      .on('error', function (error) {
        debugAndError('Data could not be extracted from', localFileName);
        res.json(debugAndError(error));
      });
  }

}
;
