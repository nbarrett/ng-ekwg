angular.module('ekwgApp')
  .factory("AuthenticationModalsService", function ($log, ModalService, RouterHistoryService) {

    var logger = $log.getInstance("AuthenticationModalsService");
    $log.logLevels["AuthenticationModalsService"] = $log.LEVEL.OFF;

    function showMailingPreferencesDialog(memberId) {
      logger.info('called showMailingPreferencesDialog');
      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "partials/index/mailing-preferences-dialog.html",
        controller: "MailingPreferencesController",
        inputs: {memberId: memberId},
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('showMailingPreferencesDialog modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('close event with result', result);
          if (!result) RouterHistoryService.navigateBackToLastMainPage(result);
        });
      })
    }


    return {
      showMailingPreferencesDialog: showMailingPreferencesDialog
    }

  });

