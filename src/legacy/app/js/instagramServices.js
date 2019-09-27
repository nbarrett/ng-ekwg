angular.module('ekwgApp')
  .factory('InstagramService', function ($http, HttpResponseService) {

    function recentMedia() {
      return $http.get('/api/instagram/recent-media').then(HttpResponseService.returnResponse.bind(HttpResponseService));
    }

    return {
      recentMedia: recentMedia,
    }
  });


