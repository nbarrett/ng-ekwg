angular.module('ekwgApp')
  .controller('ResetPasswordFailedController', function ($log, $scope, LegacyUrlService, URLService, Notifier, CommitteeReferenceData, close) {
    var logger = $log.getInstance('ResetPasswordFailedController');
    $log.logLevels['MemberAdminController'] = $log.LEVEL.OFF;

    $scope.notify = {};
    var notify = Notifier($scope.notify);

    notify.showContactUs(true);
    notify.error({
      continue: true,
      title: "Reset password failed",
      message: "The password reset link you followed has either expired or is invalid. Click Restart Forgot Password to try again"
    });
    $scope.actions = {
      close: function () {
        close()
      },
      forgotPassword: function () {
        LegacyUrlService.navigateTo("forgot-password");
      },
    }
  });

