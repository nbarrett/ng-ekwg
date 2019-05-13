angular.module('ekwgApp')
  .factory('ContactUsAmendService', function ($filter, LoggedInMemberService, DateUtils) {
  })
  .controller('ContactUsController', function ($log, $rootScope, $routeParams, $scope, CommitteeReferenceData, LoggedInMemberService) {
    var logger = $log.getInstance('ContactUsController');
    $log.logLevels['ContactUsController'] = $log.LEVEL.OFF;

    $scope.contactUs = {
      ready: function () {
        return CommitteeReferenceData.ready;
      }
    };

    $scope.allowEdits = function () {
      return LoggedInMemberService.allowMemberAdminEdits();
    }

  });
