angular.module('ekwgApp')
  .controller("IndexController", function ($q, $cookieStore, $log, $scope, $rootScope, LegacyUrlService, URLService, MemberLoginService, ProfileConfirmationService, AuthenticationModalsService, Notifier, DateUtils) {

    var logger = $log.getInstance("IndexController");
    $log.logLevels["IndexController"] = $log.LEVEL.OFF;
    $scope.notify = {};

    var notify = Notifier.createAlertInstance($scope.notify);

    logger.info('called IndexController');
    $scope.ready = false;
    $scope.year = DateUtils.asString(DateUtils.momentNow().valueOf(), undefined, "YYYY");
    $scope.actions = {
      forgotPassword: function () {
        LegacyUrlService.navigateTo("forgot-password");
      },
      loginOrLogout: function () {
        if (MemberLoginService.memberLoggedIn()) {
          MemberLoginService.logout();
        } else {
          LegacyUrlService.navigateTo("login");
        }
      }
    };

    $scope.memberLoggedIn = function () {
      return MemberLoginService.memberLoggedIn()
    };


    $scope.memberLoginStatus = function () {
      if (MemberLoginService.memberLoggedIn()) {
        var loggedInMember = MemberLoginService.loggedInMember();
        return "Logout " + loggedInMember.firstName + " " + loggedInMember.lastName;
      } else {
        return "Login to EWKG Site";
      }
    };

    $scope.allowEdits = function () {
      return MemberLoginService.allowContentEdits();
    };


    $scope.isHome = function () {
      return URLService.relativeUrlFirstSegment() === "/";
    };


    $scope.isOnPage = function (data) {
      var matchedUrl = s.endsWith(URLService.relativeUrlFirstSegment(), data);
      logger.debug("isOnPage", matchedUrl, "data=", data);
      return matchedUrl;
    };

    $scope.isProfileOrAdmin = function () {
      return $scope.isOnPage("profile") || $scope.isOnPage("admin");
    };

  });

