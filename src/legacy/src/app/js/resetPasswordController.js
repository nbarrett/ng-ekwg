angular.module("ekwgApp")
  .controller("ResetPasswordController", function ($q, $log, $scope, AuthenticationModalsService, ValidationUtils, LoggedInMemberService, URLService, Notifier, userName, message, close) {
      var logger = $log.getInstance('ResetPasswordController');
      $log.logLevels['ResetPasswordController'] = $log.LEVEL.OFF;

      $scope.notify = {};
      $scope.memberCredentials = {userName: userName};
      var notify = Notifier($scope.notify);

      if (message) {
        notify.progress({
          title: "Reset password",
          message: message
        });
      }

      $scope.actions = {
        submittable: function () {
          var newPasswordPopulated = ValidationUtils.fieldPopulated($scope.memberCredentials, "newPassword");
          var newPasswordConfirmPopulated = ValidationUtils.fieldPopulated($scope.memberCredentials, "newPasswordConfirm");
          logger.info("notSubmittable: newPasswordConfirmPopulated", newPasswordConfirmPopulated, "newPasswordPopulated", newPasswordPopulated);
          return newPasswordPopulated && newPasswordConfirmPopulated;
        },
        close: function () {
          close()
        },
        resetPassword: function () {
          notify.showContactUs(false);
          notify.setBusy();
          notify.progress({
            busy: true,
            title: "Reset password",
            message: "Attempting reset of password for " + $scope.memberCredentials.userName
          });
          LoggedInMemberService.resetPassword($scope.memberCredentials.userName, $scope.memberCredentials.newPassword, $scope.memberCredentials.newPasswordConfirm).then(function () {
            var loginResponse = LoggedInMemberService.loginResponse();
            if (LoggedInMemberService.memberLoggedIn()) {
              notify.hide();
              close();
              if (!LoggedInMemberService.loggedInMember().profileSettingsConfirmed) {
                return URLService.navigateTo("mailing-preferences");
              }
              return true;
            }
            else {
              notify.showContactUs(true);
              notify.error({
                title: "Reset password failed",
                message: loginResponse.alertMessage
              });

            }
            return true;
          });
        }
      }
    }
  );