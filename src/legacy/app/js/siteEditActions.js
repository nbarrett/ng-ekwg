angular.module('ekwgApp')
  .component('siteEditActions', {
    templateUrl: 'partials/components/site-edit.html',
    controller: function ($log, SiteEditService){
  var logger = $log.getInstance('SiteEditActionsController');
  $log.logLevels['SiteEditActionsController'] = $log.LEVEL.OFF;
  var ctrl = this;
  logger.info("initialised with SiteEditService.active()", SiteEditService.active());

  ctrl.userEdits = {preview: true, saveInProgress: false, revertInProgress: false};

  ctrl.editSiteActive = function () {
    return SiteEditService.active() ? "active" : "";
  };

  ctrl.editSiteCaption = function () {
    return SiteEditService.active() ? "editing site" : "edit site";
  };

  ctrl.toggleEditSite = function () {
    SiteEditService.toggle();
  };

},
    bindings: {
      name: '@',
      description: '@',
    }
  });
