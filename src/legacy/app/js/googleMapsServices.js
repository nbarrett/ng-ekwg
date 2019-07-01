angular.module('ekwgApp')
  .factory('GoogleMapsConfig', function ($http, HTTPResponseService) {

    function getConfig() {
      return $http.get('/api/google-maps/config').then(function (response) {
        return HTTPResponseService.returnResponse(response);
      });
    }

    return {
      getConfig: getConfig,
    }
  });


