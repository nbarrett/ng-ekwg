angular.module('ekwgApp')
  .factory('MeetupService', function ($log, $http, HTTPResponseService) {

    var logger = $log.getInstance('MeetupService');
    $log.logLevels['MeetupService'] = $log.LEVEL.OFF;

    return {
      config: function () {
        return $http.get('/meetup/config').then(HTTPResponseService.returnResponse);
      },
      eventUrlFor: function (meetupEventUrl) {
        return $http.get('/meetup/config').then(HTTPResponseService.returnResponse).then(function (meetupConfig) {
          return meetupConfig.url + '/' + meetupConfig.group + '/events/' + meetupEventUrl;
        });
      },
      eventsForStatus: function (status) {
        var queriedStatus = status || 'upcoming';
        return $http({
          method: 'get',
          params: {
            status: queriedStatus,
          },
          url: '/meetup/events'
        }).then(function (response) {
          var returnValue = HTTPResponseService.returnResponse(response);
          logger.debug('eventsForStatus', queriedStatus, returnValue);
          return returnValue;
        })
      }
    }
  });


