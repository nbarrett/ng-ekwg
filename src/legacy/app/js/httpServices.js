angular.module('ekwgApp')
  .factory('HTTPResponseService', function ($log) {

    var logger = $log.getInstance('HTTPResponseService');
    $log.logLevels['HTTPResponseService'] = $log.LEVEL.OFF;

    function returnResponse(response) {
      logger.debug('response.data=', response.data);
      var returnObject = (typeof response.data === 'object') || !response.data ? response.data : JSON.parse(response.data);
      logger.debug('returned ', typeof response.data, 'response status =', response.status, returnObject.length, 'response items:', returnObject);
      return returnObject;
    }

    return {
      returnResponse: returnResponse
    }

  });
