angular.module('ekwgApp')
  .controller("IndexController", function ($q, $cookieStore, $log, $scope, $rootScope, URLService, LoggedInMemberService, ProfileConfirmationService, AuthenticationModalsService, Notifier, DateUtils) {

    var logger = $log.getInstance("IndexController");
    $log.logLevels["IndexController"] = $log.LEVEL.OFF;
    $scope.notify = {};

    var notify = Notifier($scope.notify);

    logger.info('called IndexController');
    $scope.ready = false;
    $scope.year = DateUtils.asString(DateUtils.momentNow().valueOf(), undefined, "YYYY");
    $scope.actions = {
      forgotPassword: function () {
        URLService.navigateTo("forgot-password");
      },
      loginOrLogout: function () {
        if (LoggedInMemberService.memberLoggedIn()) {
          LoggedInMemberService.logout();
        } else {
          URLService.navigateTo("login");
        }
      }
    };

    $scope.memberLoggedIn = function () {
      return LoggedInMemberService.memberLoggedIn()
    };


    $scope.memberLoginStatus = function () {
      if (LoggedInMemberService.memberLoggedIn()) {
        var loggedInMember = LoggedInMemberService.loggedInMember();
        return "Logout " + loggedInMember.firstName + " " + loggedInMember.lastName;
      } else {
        return "Login to EWKG Site";
      }
    };

    $scope.allowEdits = function () {
      return LoggedInMemberService.allowContentEdits();
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

