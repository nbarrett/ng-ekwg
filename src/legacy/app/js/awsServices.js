angular.module('ekwgApp')
  .factory('AWSConfig', function ($http, HTTPResponseService) {

    function getConfig() {
      return $http.get('/api/aws/config').then(HTTPResponseService.returnResponse);
    }

    function awsPolicy(fileType, objectKey) {
      return $http.get('/api/aws/s3/policy?mimeType=' + fileType + '&objectKey=' + objectKey).then(HTTPResponseService.returnResponse);
    }

    return {
      getConfig: getConfig,
      awsPolicy: awsPolicy
    }
  })
  .factory('EKWGFileUpload', function ($log, AWSConfig, NumberUtils, Upload) {
    $log.logLevels['EKWGFileUpload'] = $log.LEVEL.OFF;

    var logger = $log.getInstance('EKWGFileUpload');
    var awsConfig;

    AWSConfig.getConfig().then(function (config) {
      awsConfig = config;
    });

    function onFileSelect(file, notify, objectKey) {
      logger.debug(file, objectKey);

      function generateFileNameData() {
        return {
          originalFileName: file.name,
          awsFileName: NumberUtils.generateUid() + '.' + _.last(file.name.split('.'))
        };
      }

      var fileNameData = generateFileNameData(), fileUpload = file;
      fileUpload.progress = parseInt(0);
      logger.debug('uploading fileNameData', fileNameData);
      return AWSConfig.awsPolicy(file.type, objectKey)
        .then(function (response) {
          var s3Params = response;
          var url = 'https://' + awsConfig.bucket + '.s3.amazonaws.com/';
          return Upload.upload({
            url: url,
            method: 'POST',
            data: {
              'key': objectKey + '/' + fileNameData.awsFileName,
              'acl': 'public-read',
              'Content-Type': file.type,
              'AWSAccessKeyId': s3Params.AWSAccessKeyId,
              'success_action_status': '201',
              'Policy': s3Params.s3Policy,
              'Signature': s3Params.s3Signature
            },
            file: file
          }).then(function (response) {
            fileUpload.progress = parseInt(100);
            if (response.status === 201) {
              var data = xml2json.parser(response.data),
                parsedData;
              parsedData = {
                location: data.postresponse.location,
                bucket: data.postresponse.bucket,
                key: data.postresponse.key,
                etag: data.postresponse.etag
              };
              logger.debug('parsedData', parsedData);
              return fileNameData;
            } else {
              notify.error('Upload Failed for file ' + fileNameData);
            }
          }, notify.error, function (evt) {
            fileUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
          });
        });
    }

    return {onFileSelect: onFileSelect};

  });


