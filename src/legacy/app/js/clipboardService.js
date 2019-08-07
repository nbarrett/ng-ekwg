angular.module('ekwgApp')
  .factory('ClipboardService', function ($compile, $rootScope, $document, $log) {
    return {
      copyToClipboard: function (element) {
        var logger = $log.getInstance("ClipboardService");
        $log.logLevels['ClipboardService'] = $log.LEVEL.OFF;

        var copyElement = angular.element('<span id="clipboard-service-copy-id">' + element + '</span>');
        var body = $document.find('body').eq(0);
        body.append($compile(copyElement)($rootScope));

        var clipboardServiceElement = angular.element(document.getElementById('clipboard-service-copy-id'));
        logger.debug(clipboardServiceElement);
        var range = document.createRange();

        range.selectNode(clipboardServiceElement[0]);

        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        var successful = document.execCommand('copy');

        var msg = successful ? 'successful' : 'unsuccessful';
        logger.debug('Copying text command was ' + msg);
        window.getSelection().removeAllRanges();

        copyElement.remove();
      }
    }
  });
