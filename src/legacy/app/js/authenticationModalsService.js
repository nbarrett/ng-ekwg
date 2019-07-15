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

    function showResetPasswordModal(userName, message) {
      logger.info('called showResetPasswordModal for userName', userName);
      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "partials/index/reset-password-dialog.html",
        controller: "ResetPasswordController",
        inputs: {userName: userName, message: message},
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('showResetPasswordModal close event with result', result);
          if (!result) RouterHistoryService.navigateBackToLastMainPage();
        });
      })
    }

    function showLoginDialog() {
      logger.info('called showLoginDialog');
      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "partials/index/login-dialog.html",
        controller: "LoginController",
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('showLoginDialog close event with result', result);
          if (!result) RouterHistoryService.navigateBackToLastMainPage();
        });
      })
    }


    function showResetPasswordFailedDialog() {
      logger.info('called showResetPasswordFailedDialog');

      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "partials/index/reset-password-failed-dialog.html",
        controller: "ResetPasswordFailedController",
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('showResetPasswordFailedDialog modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('showResetPasswordFailedDialog close event with result', result);
          if (!result) RouterHistoryService.navigateBackToLastMainPage();
        });
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
      showResetPasswordModal: showResetPasswordModal,
      showResetPasswordFailedDialog: showResetPasswordFailedDialog,
      showForgotPasswordModal: showForgotPasswordModal,
      showLoginDialog: showLoginDialog,
      showMailingPreferencesDialog: showMailingPreferencesDialog
    }

  });

