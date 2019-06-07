angular.module('ekwgApp')
  .factory('InstagramService', function ($http, HTTPResponseService) {

    function recentMedia() {
      return $http.get('/instagram/recentMedia').then(HTTPResponseService.returnResponse);
    }

    return {
      recentMedia: recentMedia,
    }
  });


