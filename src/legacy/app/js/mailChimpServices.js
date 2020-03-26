angular.module('ekwgApp')
  .factory('MailchimpHttpService', function ($log, $q, $http, MailchimpErrorParserService) {

    var logger = $log.getInstance('MailchimpHttpService');
    $log.logLevels['MailchimpHttpService'] = $log.LEVEL.OFF;

    function call(serviceCallType, method, url, data, params) {
      var deferredTask = $q.defer();
      deferredTask.notify(serviceCallType);
      logger.debug(serviceCallType);
      $http({
        method: method,
        data: data,
        params: params,
        url: url
      }).then(function (response) {
        var responseData = response.data;
        var errorObject = MailchimpErrorParserService.extractError(responseData);
        if (errorObject.error) {
          var errorResponse = {message: serviceCallType + ' was not successful', error: errorObject.error};
          logger.debug(errorResponse);
          deferredTask.reject(errorResponse);
        } else {
          logger.debug('success', responseData);
          deferredTask.resolve(responseData);
          return responseData;
        }
      }).catch(function (response) {
        var responseData = response.data;
        var errorObject = MailchimpErrorParserService.extractError(responseData);
        var errorResponse = {message: serviceCallType + ' was not successful', error: errorObject.error};
        logger.debug(errorResponse);
        deferredTask.reject(errorResponse);
      });
      return deferredTask.promise;
    }

    return {
      call: call
    }

  })
  .factory('MailchimpCampaignService', function (MAILCHIMP_APP_CONSTANTS, $log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService) {

    var logger = $log.getInstance('MailchimpCampaignService');
    $log.logLevels['MailchimpCampaignService'] = $log.LEVEL.OFF;


    return {
      replicateAndSendWithOptions: replicateAndSendWithOptions,
      list: list
    }

  });
