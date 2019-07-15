angular.module('ekwgApp')
  .controller('LoginController', function ($log, $scope, $routeParams, LoggedInMemberService, AuthenticationModalsService, Notifier, LegacyUrlService, URLService, ValidationUtils, close) {

      $scope.notify = {};
      var logger = $log.getInstance('LoginController');
      $log.logLevels['LoginController'] = $log.LEVEL.OFF;

      var notify = Notifier($scope.notify);
      LoggedInMemberService.logout();
      $scope.actions = {
        submittable: function () {
          var userNamePopulated = ValidationUtils.fieldPopulated($scope.enteredMemberCredentials, "userName");
          var passwordPopulated = ValidationUtils.fieldPopulated($scope.enteredMemberCredentials, "password");
          logger.info("submittable: userNamePopulated", userNamePopulated, "passwordPopulated", passwordPopulated);
          return passwordPopulated && userNamePopulated;
        },
        forgotPassword: function () {
          LegacyUrlService.navigateTo("forgot-password");
        },
        close: function () {
          close()
        },
        login: function () {
          notify.showContactUs(false);
          notify.setBusy();
          notify.progress({
            busy: true,
            title: "Logging in",
            message: "using credentials for " + $scope.enteredMemberCredentials.userName + " - please wait"
          });
          LoggedInMemberService.login($scope.enteredMemberCredentials.userName, $scope.enteredMemberCredentials.password).then(function () {
            var loginResponse = LoggedInMemberService.loginResponse();
            if (LoggedInMemberService.memberLoggedIn()) {
              close();
              if (!LoggedInMemberService.loggedInMember().profileSettingsConfirmed) {
                return LegacyUrlService.navigateTo("mailing-preferences");
              }
              return true;
            }
            else if (LoggedInMemberService.showResetPassword()) {
              return AuthenticationModalsService.showResetPasswordModal($scope.enteredMemberCredentials.userName, "Your password has expired, therefore you need to reset it to a new one before continuing.");
            } else {
              notify.showContactUs(true);
              notify.error({
                title: "Login failed",
                message: loginResponse.alertMessage
              });
            }
          });
        },
      }
    }
  );

