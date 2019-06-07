angular.module('ekwgApp')
  .component('markdownEditor', {
    templateUrl: 'ekwg-legacy/partials/components/markdown-editor.html',
    controller: function ($cookieStore, $log, $rootScope, $scope, $element, $attrs, ContentText) {
      var logger = $log.getInstance('MarkdownEditorController');
      $log.logLevels['MarkdownEditorController'] = $log.LEVEL.OFF;
      var ctrl = this;
      ctrl.userEdits = {preview: true, saveInProgress: false, revertInProgress: false};

      function assignData(data) {
        ctrl.data = data;
        ctrl.originalData = _.clone(data);
        logger.debug(ctrl.name, 'content retrieved:', data);
        return data;
      }

      function populateContent(type) {
        if (type) ctrl.userEdits[type + 'InProgress'] = true;
        return ContentText.forName(ctrl.name).then(function (data) {
          data = assignData(data);
          if (type) ctrl.userEdits[type + 'InProgress'] = false;
          return data;
        });
      }

      ctrl.edit = function () {
        ctrl.userEdits.preview = false;
      };

      ctrl.revert = function () {
        logger.debug('reverting ' + ctrl.name, 'content');
        ctrl.data = _.clone(ctrl.originalData);
      };

      ctrl.dirty = function () {
        var dirty = ctrl.data && ctrl.originalData && (ctrl.data.text !== ctrl.originalData.text);
        logger.debug(ctrl.name, 'dirty ->', dirty);
        return dirty;
      };

      ctrl.revertGlyph = function () {
        return ctrl.userEdits.revertInProgress ? "fa fa-spinner fa-spin" : "glyphicon glyphicon-remove markdown-preview-icon"
      };

      ctrl.saveGlyph = function () {
        return ctrl.userEdits.saveInProgress ? "fa fa-spinner fa-spin" : "glyphicon glyphicon-ok markdown-preview-icon"
      };

      ctrl.save = function () {
        ctrl.userEdits.saveInProgress = true;
        logger.info('saving', ctrl.name, 'content', ctrl.data, $element, $attrs);
        ctrl.data.$saveOrUpdate().then(function (data) {
          ctrl.userEdits.saveInProgress = false;
          assignData(data);
        })
      };

      ctrl.editSite = function () {
        return $cookieStore.get('editSite');
      };

      ctrl.rows = function () {
        var text = _.property(["data", "text"])(ctrl);
        var rows = text ? text.split(/\r*\n/).length + 1 : 1;
        logger.info('number of rows in text ', text, '->', rows);
        return rows;
      };


      ctrl.preview = function () {
        logger.info('previewing ' + ctrl.name, 'content', $element, $attrs);
        ctrl.userEdits.preview = true;
      };

      ctrl.$onInit = function () {
        logger.debug('initialising:', ctrl.name, 'content, editSite:', ctrl.editSite());
        if (!ctrl.description) {
          ctrl.description = ctrl.name;
        }
        populateContent();
      };

    },
    bindings: {
      name: '@',
      description: '@',
    }
  });
