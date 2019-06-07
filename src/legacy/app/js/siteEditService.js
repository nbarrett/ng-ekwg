angular.module('ekwgApp')
  .factory('SiteEditService', function ($log, $cookieStore, $rootScope) {

    var logger = $log.getInstance('SiteEditService');
    $log.logLevels['SiteEditService'] = $log.LEVEL.OFF;

    function active() {
      var active = Boolean($cookieStore.get("editSite"));
      logger.debug("active:", active);
      return active;
    }

    function toggle() {
      var priorState = active();
      var newState = !priorState;
      logger.debug("toggle:priorState", priorState, "newState", newState);
      $cookieStore.put("editSite", newState);
      return $rootScope.$broadcast("editSite", newState);
    }

    return {
      active: active,
      toggle: toggle
    }

  });
