angular.module('ekwgApp')
  .controller("IndexController", function ($scope, PageService, DateUtils) {

    $scope.currentPageHasBeenMigrated = function () {
      return PageService.currentPageHasBeenMigrated();
    }
    $scope.year = DateUtils.asString(DateUtils.momentNow().valueOf(), undefined, "YYYY");

  });

