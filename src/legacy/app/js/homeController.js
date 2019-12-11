angular.module('ekwgApp')
  .controller('HomeController', function ($log, $scope, $routeParams, MemberLoginService, ContentMetaDataService, CommitteeReferenceData, InstagramService, SiteEditService) {
    var logger = $log.getInstance('HomeController');
    $log.logLevels['HomeController'] = $log.LEVEL.OFF;

    $scope.feeds = {instagram: {recentMedia: []}, facebook: {}};

    ContentMetaDataService.getMetaData('imagesHome')
      .then(function (contentMetaData) {
        $scope.interval = 5000;
        $scope.slides = contentMetaData.files;
      });

    InstagramService.recentMedia()
      .then(function (recentMediaResponse) {
        $scope.feeds.instagram.recentMedia = _.take(recentMediaResponse.instagram, 14);
        logger.debug("Refreshed social media", $scope.feeds.instagram.recentMedia, 'count =', $scope.feeds.instagram.recentMedia.length);
      });

    $scope.mediaUrlFor = function (media) {
      logger.debug('mediaUrlFor:media', media);
      return (media && media.images) ? media.images.standard_resolution.url : "";
    };

    $scope.mediaCaptionFor = function (media) {
      logger.debug('mediaCaptionFor:media', media);
      return media ? media.caption.text : "";
    };

    $scope.allowEdits = function () {
      return SiteEditService.active() && MemberLoginService.allowContentEdits();
    };

  });



