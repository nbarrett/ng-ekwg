angular.module('ekwgApp')
  .factory('InstagramService', function ($http, HTTPResponseService) {

    function recentMedia() {
      return $http.get('/api/instagram/recent-media').then(HTTPResponseService.returnResponse);
    }

    return {
      recentMedia: recentMedia,
    }
  });


