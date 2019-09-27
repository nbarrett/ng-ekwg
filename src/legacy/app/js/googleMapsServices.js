angular.module('ekwgApp')
  .factory('GoogleMapsConfig', function ($http, HttpResponseService) {

    function getConfig() {
      return $http.get('/api/google-maps/config').then(HttpResponseService.returnResponse.bind(HttpResponseService));
    }

    return {
      getConfig: getConfig,
    }
  });


