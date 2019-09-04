angular.module('ekwgApp')
  .controller('CommitteeController', function ($rootScope, $window, $log, $sce, $timeout, $templateRequest, $compile, $q, $scope, $filter, $routeParams,
                                               $location, URLService, DateUtils, NumberUtils, LoggedInMemberService, MemberService,
                                               ContentMetaDataService, CommitteeFileService, MailchimpSegmentService, MailchimpCampaignService,
                                               MAILCHIMP_APP_CONSTANTS, MailchimpConfig, Notifier, EKWGFileUpload, CommitteeQueryService, CommitteeReferenceData, ModalService) {

    var logger = $log.getInstance('CommitteeController');
    $log.logLevels['CommitteeController'] = $log.LEVEL.OFF;

    var notify = Notifier.createAlertInstance($scope);
    notify.setBusy();

    $scope.emailingInProgress = false;
    $scope.committeeFileBaseUrl = ContentMetaDataService.baseUrl('committeeFiles');
    $scope.destinationType = '';
    $scope.members = [];
    $scope.committeeFiles = [];
    $scope.alertMessages = [];
    $scope.allowConfirmDelete = false;
    $scope.latestYearOpen = true;
    $scope.committeeReferenceData = CommitteeReferenceData;

    $scope.selected = {
      addingNewFile: false,
      committeeFiles: []
    };

    CommitteeReferenceData.events.subscribe(function (referenceData) {
      $scope.fileTypes = referenceData && CommitteeReferenceData.fileTypes();
      logger.info('fileTypes ->', $scope.fileTypes);
    });

    $scope.userEdits = {
      saveInProgress: false
    };

    $scope.showAlertMessage = function () {
      return ($scope.alert.class === 'alert-danger') || $scope.emailingInProgress;
    };

    $scope.latestYear = function () {
      return CommitteeQueryService.latestYear($scope.committeeFiles)
    };

    $scope.committeeFilesForYear = function (year) {
      return CommitteeQueryService.committeeFilesForYear(year, $scope.committeeFiles)
    };

    $scope.isActive = function (committeeFile) {
      return committeeFile === $scope.selected.committeeFile;
    };

    $scope.eventDateCalendar = {
      open: function ($event) {
        $scope.eventDateCalendar.opened = true;
      }
    };

    $scope.allowSend = function () {
      return LoggedInMemberService.allowFileAdmin();
    };

    $scope.allowAddCommitteeFile = function () {
      return $scope.fileTypes && LoggedInMemberService.allowFileAdmin();
    };

    $scope.allowEditCommitteeFile = function (committeeFile) {
      return $scope.allowAddCommitteeFile() && committeeFile && committeeFile.$id();
    };

    $scope.allowDeleteCommitteeFile = function (committeeFile) {
      return $scope.allowEditCommitteeFile(committeeFile);
    };

    $scope.cancelFileChange = function () {
      $q.when($scope.hideCommitteeFileDialog()).then(refreshCommitteeFiles).then(notify.clearBusy.bind(notify));
    };

    $scope.saveCommitteeFile = function () {
      $scope.userEdits.saveInProgress = true;
      $scope.selected.committeeFile.eventDate = DateUtils.asValueNoTime($scope.selected.committeeFile.eventDate);
      logger.debug('saveCommitteeFile ->', $scope.selected.committeeFile);
      return $scope.selected.committeeFile.$saveOrUpdate(notify.success.bind(notify), notify.success.bind(notify), notify.error.bind(notify), notify.error.bind(notify))
        .then($scope.hideCommitteeFileDialog)
        .then(refreshCommitteeFiles)
        .then(notify.clearBusy.bind(notify))
        .catch(handleError);

      function handleError(errorResponse) {
        $scope.userEdits.saveInProgress = false;
        notify.error({
          title: 'Your changes could not be saved',
          message: (errorResponse && errorResponse.error ? ('. Error was: ' + JSON.stringify(errorResponse.error)) : '')
        });
        notify.clearBusy();
      }

    };


    var defaultCommitteeFile = function () {
      return _.clone({
        "createdDate": DateUtils.nowAsValue(),
        "fileType": $scope.fileTypes && $scope.fileTypes[0].description,
        "fileNameData": {}
      })
    };

    function removeDeleteOrAddOrInProgressFlags() {
      $scope.allowConfirmDelete = false;
      $scope.selected.addingNewFile = false;
      $scope.userEdits.saveInProgress = false;
    }

    $scope.deleteCommitteeFile = function () {
      $scope.allowConfirmDelete = true;
    };

    $scope.cancelDeleteCommitteeFile = function () {
      removeDeleteOrAddOrInProgressFlags();
    };

    $scope.confirmDeleteCommitteeFile = function () {

      $scope.userEdits.saveInProgress = true;

      function showCommitteeFileDeleted() {
        return notify.success('File was deleted successfully');
      }

      $scope.selected.committeeFile.$remove(showCommitteeFileDeleted, showCommitteeFileDeleted, notify.error.bind(notify), notify.error.bind(notify))
        .then($scope.hideCommitteeFileDialog)
        .then(refreshCommitteeFiles)
        .then(removeDeleteOrAddOrInProgressFlags)
        .then(notify.clearBusy.bind(notify));
    };

    $scope.selectCommitteeFile = function (committeeFile, committeeFiles) {
      if (!$scope.selected.addingNewFile) {
        $scope.selected.committeeFile = committeeFile;
        $scope.selected.committeeFiles = committeeFiles;
      }
    };

    $scope.editCommitteeFile = function () {
      removeDeleteOrAddOrInProgressFlags();
      delete $scope.uploadedFile;
      $('#file-detail-dialog').modal('show');
    };

    $scope.openMailchimp = function () {
      $window.open(MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns", '_blank');
    };

    $scope.openSettings = function () {
      ModalService.showModal({
        templateUrl: "partials/committee/notification-settings-dialog.html",
        controller: "CommitteeNotificationSettingsController",
        preClose: function (modal) {
          logger.debug('preClose event with modal', modal);
          modal.element.modal('hide');
        },
      }).then(function (modal) {
        logger.debug('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.debug('close event with result', result);
        });
      })
    };

    $scope.sendNotification = function (committeeFile) {
      ModalService.showModal({
        templateUrl: "partials/committee/send-notification-dialog.html",
        controller: "CommitteeNotificationsController",
        preClose: function (modal) {
          logger.debug('preClose event with modal', modal);
          modal.element.modal('hide');
        },
        inputs: {
          committeeFile: committeeFile
        }
      }).then(function (modal) {
        logger.debug('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.debug('close event with result', result);
        });
      })
    };

    $scope.cancelSendNotification = function () {
      $('#send-notification-dialog').modal('hide');
      $scope.resubmit = false;
    };

    $scope.addCommitteeFile = function ($event) {
      $event.stopPropagation();
      $scope.selected.addingNewFile = true;
      var committeeFile = new CommitteeFileService(defaultCommitteeFile());
      $scope.selected.committeeFiles.push(committeeFile);
      $scope.selected.committeeFile = committeeFile;
      logger.debug('addCommitteeFile:', committeeFile, 'of', $scope.selected.committeeFiles.length, 'files');
      $scope.editCommitteeFile();
    };

    $scope.hideCommitteeFileDialog = function () {
      removeDeleteOrAddOrInProgressFlags();
      $('#file-detail-dialog').modal('hide');
    };

    $scope.attachFile = function (file) {
      $scope.oldTitle = $scope.selected.committeeFile.fileNameData ? $scope.selected.committeeFile.fileNameData.title : file.name;
      logger.debug('then:attachFile:oldTitle', $scope.oldTitle);
      $('#hidden-input').click();
    };

    $scope.onFileSelect = function (file) {
      if (file) {
        $scope.userEdits.saveInProgress = true;
        logger.debug('onFileSelect:file:about to upload ->', file);
        $scope.uploadedFile = file;
        EKWGFileUpload.onFileSelect(file, notify, 'committeeFiles')
          .then(function (fileNameData) {
            logger.debug('onFileSelect:file:upload complete -> fileNameData', fileNameData);
            $scope.selected.committeeFile.fileNameData = fileNameData;
            $scope.selected.committeeFile.fileNameData.title = $scope.oldTitle || file.name;
            $scope.userEdits.saveInProgress = false;
          });
      }
    };

    $scope.attachmentTitle = function () {
      return ($scope.selected.committeeFile && _.isEmpty($scope.selected.committeeFile.fileNameData) ? 'Attach' : 'Replace') + ' File';
    };

    $scope.fileUrl = function (committeeFile) {
      return committeeFile && committeeFile.fileNameData ? URLService.baseUrl() + $scope.committeeFileBaseUrl + '/' + committeeFile.fileNameData.awsFileName : '';
    };

    $scope.fileTitle = function (committeeFile) {
      return committeeFile ? DateUtils.asString(committeeFile.eventDate, undefined, DateUtils.formats.displayDateTh) + ' - ' + committeeFile.fileNameData.title : '';
    };

    $scope.iconFile = function (committeeFile) {
      if (!committeeFile.fileNameData) return undefined;

      function fileExtensionIs(fileName, extensions) {
        return _.contains(extensions, fileExtension(fileName));
      }

      function fileExtension(fileName) {
        return fileName ? _.last(fileName.split('.')).toLowerCase() : '';
      }

      if (fileExtensionIs(committeeFile.fileNameData.awsFileName, ['doc', 'docx', 'jpg', 'pdf', 'ppt', 'png', 'txt', 'xls', 'xlsx'])) {
        return 'icon-' + fileExtension(committeeFile.fileNameData.awsFileName).substring(0, 3) + '.jpg';
      } else {
        return 'icon-default.jpg';
      }
    };

    $scope.$on('memberLoginComplete', function () {
      refreshAll();
    });

    $scope.$on('memberLogoutComplete', function () {
      refreshAll();
    });


    function refreshMembers() {

      function assignMembersToScope(members) {
        $scope.members = members;
        return $scope.members;
      }

      if (LoggedInMemberService.allowFileAdmin()) {
        return MemberService.all()
          .then(assignMembersToScope);

      }
    }

    function refreshCommitteeFiles() {
      CommitteeQueryService.committeeFiles(notify).then(function (files) {
        logger.debug('committeeFiles', files);
        if (URLService.hasRouteParameter('committeeFileId')) {
          $scope.committeeFiles = _.filter(files, function (file) {
            return file.$id() === $routeParams.committeeFileId;
          });
        } else {
          $scope.committeeFiles = files;
        }
        $scope.committeeFileYears = CommitteeQueryService.committeeFileYears($scope.committeeFiles);
      });
    }

    function refreshAll() {
      refreshCommitteeFiles();
      refreshMembers();
    }

    refreshAll();

  });
