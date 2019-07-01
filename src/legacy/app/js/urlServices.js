angular.module('ekwgApp')
  .factory('URLService', function ($window, $rootScope, $timeout, $location, $routeParams, $log, PAGE_CONFIG, ContentMetaDataService) {

    var logger = $log.getInstance('URLService');
    $log.logLevels['URLService'] = $log.LEVEL.OFF;

    function baseUrl(optionalUrl) {
      return _.first((optionalUrl || $location.absUrl()).split('/'));
    }

    function relativeUrl(optionalUrl) {
      var relativeUrlValue = _.last((optionalUrl || $location.absUrl()).split("/"));
      logger.debug("relativeUrlValue:", relativeUrlValue);
      return relativeUrlValue;
    }

    function relativeUrlFirstSegment(optionalUrl) {
      var relativeUrlValue = relativeUrl(optionalUrl);
      var index = relativeUrlValue.indexOf("/", 1);
      var relativeUrlFirstSegment = index === -1 ? relativeUrlValue : relativeUrlValue.substring(0, index);
      logger.debug("relativeUrl:", relativeUrlValue, "relativeUrlFirstSegment:", relativeUrlFirstSegment);
      return relativeUrlFirstSegment;
    }

    function resourceUrl(area, type, id) {
      return baseUrl() + '/' + area + '/' + type + 'Id/' + id;
    }

    function notificationHref(ctrl) {
      var href = (ctrl.name) ? resourceUrlForAWSFileName(ctrl.name) : resourceUrl(ctrl.area, ctrl.type, ctrl.id);
      logger.debug("href:", href);
      return href;
    }

    function resourceUrlForAWSFileName(fileName) {
      return baseUrl() + ContentMetaDataService.baseUrl(fileName);
    }

    function hasRouteParameter(parameter) {
      var hasRouteParameter = !!($routeParams[parameter]);
      logger.debug('hasRouteParameter', parameter, hasRouteParameter);
      return hasRouteParameter;
    }

    function isArea(areas) {
      logger.debug('isArea:areas', areas, '$routeParams', $routeParams);
      return _.some(_.isArray(areas) ? areas : [areas], function (area) {
        var matched = area === $routeParams.area;
        logger.debug('isArea', area, 'matched =', matched);
        return matched;
      });

    }

    let pageUrl = function (page) {
      var pageOrEmpty = (page ? page : "");
      return s.startsWith(pageOrEmpty, "/") ? pageOrEmpty : "/" + pageOrEmpty;
    };

    function navigateTo(page, area) {
      $timeout(function () {
        var url = pageUrl(page) + (area ? "/" + area : "");
        logger.info("navigating to page:", page, "area:", area, "->", url);
        $location.path(url);
        logger.info("$location.path is now", $location.path())
      }, 1);
    }

    function navigateBackToLastMainPage() {
      var lastPage = _.chain($rootScope.pageHistory.reverse())
        .find(function (page) {
          return _.contains(_.values(PAGE_CONFIG.mainPages), relativeUrlFirstSegment(page));
        })
        .value();

      logger.info("navigateBackToLastMainPage:$rootScope.pageHistory", $rootScope.pageHistory, "lastPage->", lastPage);
      navigateTo(lastPage || "/")
    }

    function noArea() {
      return !$routeParams.area;
    }

    function setRoot() {
      return navigateTo();
    }

    function area() {
      return $routeParams.area;
    }

    return {
      setRoot: setRoot,
      navigateBackToLastMainPage: navigateBackToLastMainPage,
      navigateTo: navigateTo,
      hasRouteParameter: hasRouteParameter,
      noArea: noArea,
      isArea: isArea,
      baseUrl: baseUrl,
      area: area,
      resourceUrlForAWSFileName: resourceUrlForAWSFileName,
      notificationHref: notificationHref,
      resourceUrl: resourceUrl,
      relativeUrlFirstSegment: relativeUrlFirstSegment,
      relativeUrl: relativeUrl
    }

  });

