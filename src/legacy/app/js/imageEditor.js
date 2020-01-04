angular.module('ekwgApp')
  .controller('ImageEditController', function ($scope, $location, Upload, $http, $q, $routeParams, $window, SiteEditService, MemberLoginService, ContentMetaDataService, BroadcastService, Notifier, EKWGFileUpload) {
    var notify = Notifier.createAlertInstance($scope);

    $scope.imageSource = $routeParams.imageSource;

    applyAllowEdits();
    SiteEditService.events.subscribe(item => applyAllowEdits(item));
    $scope.onFileSelect = function (file) {
      if (file) {
        $scope.uploadedFile = file;
        EKWGFileUpload.onFileSelect(file, notify, $scope.imageSource).then(function (fileNameData) {
          $scope.currentImageMetaDataItem.image = $scope.imageMetaData.baseUrl + '/' + fileNameData.awsFileName;
          console.log(' $scope.currentImageMetaDataItem.image', $scope.currentImageMetaDataItem.image);
        });
      }
    };

    $scope.refreshImageMetaData = function (imageSource) {
      notify.setBusy();
      $scope.imageSource = imageSource;
      ContentMetaDataService.getMetaData(imageSource).then(function (contentMetaData) {
        $scope.imageMetaData = contentMetaData;
        notify.clearBusy();
      }, function (response) {
        notify.error(response);
      });
    };

    $scope.refreshImageMetaData($scope.imageSource);

    BroadcastService.on('memberLoginComplete', function () {
      applyAllowEdits();
    });

    BroadcastService.on('memberLogoutComplete', function () {
      applyAllowEdits();
    });


    $scope.exitBackToPreviousWindow = function () {
      $window.history.back();
    };

    $scope.reverseSortOrder = function () {
      $scope.imageMetaData.files = $scope.imageMetaData.files.reverse();
    };

    $scope.imageTitleLength = function () {
      if ($scope.imageSource === 'imagesHome') {
        return 50;
      } else {
        return 20
      }
    };

    $scope.replace = function (imageMetaDataItem) {
      $scope.files = [];
      $scope.currentImageMetaDataItem = imageMetaDataItem;
      $('#hidden-input').click();
    };

    $scope.moveUp = function (imageMetaDataItem) {
      var currentIndex = $scope.imageMetaData.files.indexOf(imageMetaDataItem);
      if (currentIndex > 0) {
        $scope.delete(imageMetaDataItem);
        $scope.imageMetaData.files.splice(currentIndex - 1, 0, imageMetaDataItem);
      }
    };

    $scope.moveDown = function (imageMetaDataItem) {
      var currentIndex = $scope.imageMetaData.files.indexOf(imageMetaDataItem);
      if (currentIndex < $scope.imageMetaData.files.length) {
        $scope.delete(imageMetaDataItem);
        $scope.imageMetaData.files.splice(currentIndex + 1, 0, imageMetaDataItem);
      }
    };

    $scope.delete = function (imageMetaDataItem) {
      $scope.imageMetaData.files = _.without($scope.imageMetaData.files, imageMetaDataItem);
    };

    $scope.insertHere = function (imageMetaDataItem) {
      var insertedImageMetaDataItem = new ContentMetaDataService.createNewMetaData(true);
      var currentIndex = $scope.imageMetaData.files.indexOf(imageMetaDataItem);
      $scope.imageMetaData.files.splice(currentIndex, 0, insertedImageMetaDataItem);
      $scope.replace(insertedImageMetaDataItem);
    };

    $scope.currentImageMetaDataItemBeingUploaded = function (imageMetaDataItem) {
      return ($scope.currentImageMetaDataItem && $scope.currentImageMetaDataItem.$$hashKey === imageMetaDataItem.$$hashKey);
    };


    $scope.saveAll = function () {
      ContentMetaDataService.saveMetaData($scope.imageMetaData, saveOrUpdateSuccessful, notify.error.bind(notify))
        .then(function (contentMetaData) {
          $scope.exitBackToPreviousWindow();
        }, function (response) {
          notify.error(response);
        });
    };

    function applyAllowEdits() {
      $scope.allowEdits = MemberLoginService.allowContentEdits();
    }

    function saveOrUpdateSuccessful() {
      notify.success('data for ' + $scope.imageMetaData.files.length + ' images was saved successfully.');
    }

  });



