angular.module('ekwgApp')
  .factory('Notifier', function ($log, ErrorMessageService) {

    var ALERT_ERROR = {class: 'alert-danger', icon: 'glyphicon-exclamation-sign', failure: true};
    var ALERT_WARNING = {class: 'alert-warning', icon: 'glyphicon-info-sign'};
    var ALERT_INFO = {class: 'alert-success', icon: 'glyphicon-info-sign'};
    var ALERT_SUCCESS = {class: 'alert-success', icon: 'glyphicon-ok'};

    var logger = $log.getInstance('Notifier');
    $log.logLevels['Notifier'] = $log.LEVEL.OFF;

    return function (scope) {

      scope.alertClass = ALERT_SUCCESS.class;
      scope.alert = ALERT_SUCCESS;
      scope.alertMessages = [];
      scope.alertHeading = [];
      scope.ready = false;

      function setReady() {
        clearBusy();
        return scope.ready = true;
      }

      function clearBusy() {
        logger.debug('clearing busy');
        return scope.busy = false;
      }

      function setBusy() {
        logger.debug('setting busy');
        return scope.busy = true;
      }

      function showContactUs(state) {
        logger.debug('setting showContactUs', state);
        return scope.showContactUs = state;
      }

      function notifyAlertMessage(alertType, message, append, busy) {
        var messageText = message && ErrorMessageService.stringify(_.has(message, 'message') ? message.message : message);
        if (busy) setBusy();
        if (!append || alertType === ALERT_ERROR) scope.alertMessages = [];
        if (messageText) scope.alertMessages.push(messageText);
        scope.alertTitle = message && _.has(message, 'title') ? message.title : undefined;
        scope.alert = alertType;
        scope.alertClass = alertType.class;
        scope.showAlert = scope.alertMessages.length > 0;
        scope.alertMessage = scope.alertMessages.join(', ');
        if (alertType === ALERT_ERROR && !_.has(message, 'continue')) {
          logger.error('notifyAlertMessage:', 'class =', alertType, 'messageText =', messageText, 'append =', append);
          clearBusy();
          throw message;
        } else {
          return logger.debug('notifyAlertMessage:', 'class =', alertType, 'messageText =', messageText, 'append =', append, 'showAlert =', scope.showAlert);
        }
      }


      function progress(message, busy) {
        return notifyAlertMessage(ALERT_INFO, message, false, busy)
      }

      function hide() {
        notifyAlertMessage(ALERT_SUCCESS);
        return clearBusy();
      }

      function success(message, busy) {
        return notifyAlertMessage(ALERT_SUCCESS, message, false, busy)
      }

      function successWithAppend(message, busy) {
        return notifyAlertMessage(ALERT_SUCCESS, message, true, busy)
      }

      function error(message, append, busy) {
        return notifyAlertMessage(ALERT_ERROR, message, append, busy)
      }

      function warning(message, append, busy) {
        return notifyAlertMessage(ALERT_WARNING, message, append, busy)
      }

      return {
        success: success,
        successWithAppend: successWithAppend,
        progress: progress,
        progressWithAppend: successWithAppend,
        error: error,
        warning: warning,
        showContactUs: showContactUs,
        setBusy: setBusy,
        clearBusy: clearBusy,
        setReady: setReady,
        hide: hide
      }
    }

  });