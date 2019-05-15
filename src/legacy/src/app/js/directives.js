angular.module('ekwgApp')
  .directive('contactUs', function ($log, $compile, URLService, CommitteeReferenceData) {

    var logger = $log.getInstance('contactUs');
    $log.logLevels['contactUs'] = $log.LEVEL.OFF;

    function email(role) {
      return CommitteeReferenceData.contactUsField(role, 'email');
    }

    function description(role) {
      return CommitteeReferenceData.contactUsField(role, 'description');
    }

    function fullName(role) {
      return CommitteeReferenceData.contactUsField(role, 'fullName');
    }

    function createHref(scope, role) {
      return '<a href="mailto:' + email(role) + '">' + (scope.text || email(role)) + '</a>';
    }

    function createListItem(scope, role) {
      return '<li ' +
        'style="' +
        'font-weight: normal;' +
        'padding: 4px 0px 4px 21px;' +
        'list-style: none;' +
        'background-image: url(' + URLService.baseUrl() + '/ekwg-legacy/assets/images/ramblers/bull-green.png);' +
        'background-position: 0px 9px;' +
        'background-repeat: no-repeat no-repeat">' +
        fullName(role) + ' - ' + description(role) + ' -  ' +
        '<a href="mailto:' + email(role) + '"' +
        'style="' +
        'background-color: transparent;' +
        'color: rgb(120, 35, 39);' +
        'text-decoration: none; ' +
        'font-weight: bold; ' +
        'background-position: initial; ' +
        'background-repeat: initial;">' +
        (scope.text || email(role)) + '</a>' +
        '</li>';
    }

    function expandRoles(scope) {
      var roles = scope.role ? scope.role.split(',') : CommitteeReferenceData.contactUsRoles();
      logger.debug('role ->', scope.role, ' roles ->', roles);
      return _(roles).map(function (role) {
        if (scope.format === 'list') {
          return createListItem(scope, role);
        } else {
          return createHref(scope, role);
        }
      }).join('\n');
    }

    function wrapInUL(scope) {
      if (scope.format === 'list') {
        return '<ul style="'
          + 'margin: 10px 0 0;'
          + 'padding: 0 0 10px 10px;'
          + 'font-weight: bold;'
          + 'background-image: url(' + URLService.baseUrl() + '/ekwg-legacy/assets/images/ramblers/dot-darkgrey-hor.png);'
          + 'background-position: 0% 100%;'
          + 'background-repeat: repeat no-repeat;'
          + 'margin-bottom: 20px;"> '
          + (scope.heading || '')
          + expandRoles(scope)
          + '</ul>';
      } else {
        return expandRoles(scope);
      }
    }

    return {
      restrict: 'EA',
      replace: true,
      link: function (scope, element) {
        scope.$watch('name', function () {
          if (CommitteeReferenceData.ready) {
            var html = wrapInUL(scope);
            logger.debug('html before compile ->', html);
            element.html($compile(html)(scope));
          }
        });
      },
      scope: {
        format: '@',
        text: '@',
        role: '@',
        heading: '@'
      }
    };
  });
