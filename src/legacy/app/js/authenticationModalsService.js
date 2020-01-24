angular.module('ekwgApp')
  .factory("AuthenticationModalsService", function ($log, ModalService, RouterHistoryService) {

    var logger = $log.getInstance("AuthenticationModalsService");
    $log.logLevels["AuthenticationModalsService"] = $log.LEVEL.OFF;

    function showForgotPasswordModal() {
      logger.info('called showForgotPasswordModal');
      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "partials/index/forgotten-password-dialog.html",
        controller: "ForgotPasswordController",
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('close event with result', result);
          if (!result) RouterHistoryService.navigateBackToLastMainPage();
        });
      }).catch(function (error) {
        logger.warn("error happened:", error);
      })
    }

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
          if (!result) RouterHistoryService.navigateBackToLastMainPage();
        });
      })
    }


    return {
      showForgotPasswordModal: showForgotPasswordModal,
      showMailingPreferencesDialog: showMailingPreferencesDialog
    }

  });

