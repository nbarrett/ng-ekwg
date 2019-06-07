angular.module('ekwgApp')
  .controller("AuthenticationModalsController", function ($log, $scope, URLService, $location, $routeParams, AuthenticationModalsService, LoggedInMemberService) {
      var logger = $log.getInstance("AuthenticationModalsController");
      $log.logLevels["AuthenticationModalsController"] = $log.LEVEL.OFF;
    var urlFirstSegment = URLService.relativeUrlFirstSegment();
    logger.info("URLService.relativeUrl:", urlFirstSegment, "$routeParams:", $routeParams);
      switch (urlFirstSegment) {
        case "/login":
          return AuthenticationModalsService.showLoginDialog();
        case "/logout":
          return LoggedInMemberService.logout();
        case "/mailing-preferences":
          if (LoggedInMemberService.memberLoggedIn()) {
            return AuthenticationModalsService.showMailingPreferencesDialog(LoggedInMemberService.loggedInMember().memberId);
          } else {
            return URLService.setRoot();
          }
        case "/forgot-password":
          return AuthenticationModalsService.showForgotPasswordModal();
        case "/set-password":
          return LoggedInMemberService.getMemberByPasswordResetId($routeParams.passwordResetId)
            .then(function (member) {
              logger.info("for $routeParams.passwordResetId", $routeParams.passwordResetId, "member", member);
              if (_.isEmpty(member)) {
                return AuthenticationModalsService.showResetPasswordFailedDialog();
              } else {
                return AuthenticationModalsService.showResetPasswordModal(member.userName)
              }
            });
        default:
          logger.warn(URLService.relativeUrl(), "doesnt match any of the supported urls");
          return URLService.setRoot();
      }
    }
  );