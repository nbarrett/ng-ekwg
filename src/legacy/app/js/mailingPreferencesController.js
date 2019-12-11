angular.module('ekwgApp')
  .controller('MailingPreferencesController', function ($log, $scope, ProfileConfirmationService, Notifier, URLService, MemberLoginService, memberId, close) {

    var logger = $log.getInstance("MailingPreferencesController");
    $log.logLevels["MailingPreferencesController"] = $log.LEVEL.OFF;

    $scope.notify = {};
    var notify = Notifier.createAlertInstance($scope.notify);

    MemberLoginService.getMemberForMemberId(memberId)
      .then(function (member) {
        logger.info('memberId ->', memberId, 'member ->', member);
        $scope.member = member;
      });

    function saveOrUpdateUnsuccessful(message) {
      notify.showContactUs(true);
      notify.error({
        continue: true,
        title: "Error in saving mailing preferences",
        message: "Changes to your mailing preferences could not be saved. " + (message || "Please try again later.")
      });
    }

    $scope.actions = {
      save: function () {
        ProfileConfirmationService.confirmProfile($scope.member);
        MemberLoginService.saveMember($scope.member, $scope.actions.close, saveOrUpdateUnsuccessful);
      },
      close: function () {
        close();
      }
    };

  });
