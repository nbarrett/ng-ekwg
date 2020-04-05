angular.module('ekwgApp')
  .controller("IndexController", function ($scope, PageService, DateUtils) {

    $scope.year = DateUtils.asString(DateUtils.momentNow().valueOf(), undefined, "YYYY");

  });

