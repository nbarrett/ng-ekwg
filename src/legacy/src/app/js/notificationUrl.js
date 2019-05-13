angular.module("ekwgApp")
  .component("notificationUrl", {
    templateUrl: "partials/components/notification-url.html",
    controller: function ($log, URLService, FileUtils) {
      var ctrl = this;
      var logger = $log.getInstance("NotificationUrlController");
      $log.logLevels['NotificationUrlController'] = $log.LEVEL.OFF;

      ctrl.anchor_href = function () {
        return URLService.notificationHref(ctrl);
      };

      ctrl.anchor_target = function () {
        return "_blank";
      };

      ctrl.anchor_text = function () {
        var text = (!ctrl.text && ctrl.name) ? FileUtils.basename(ctrl.name) : ctrl.text || ctrl.anchor_href();
        logger.debug("text", text);
        return text;
      };

    },
    bindings: {
      name: "@",
      text: "@",
      type: "@",
      id: "@",
      area: "@"
    }
  });