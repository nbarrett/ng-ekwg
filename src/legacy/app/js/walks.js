angular.module('ekwgApp')
  .factory('WalksService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('walks')
  })
  .factory('WalksQueryService', function (WalkNotificationService, WalksReferenceService) {

    function activeWalks(walks) {
      return _.filter(walks, function (walk) {
        return !WalkNotificationService.latestEventWithStatusChangeIs(walk, WalksReferenceService.eventTypes.deleted)
      })
    }

    return {
      activeWalks: activeWalks
    }
  })
  .factory('WalksReferenceService', function () {

    var eventTypes = {
      awaitingLeader: {
        statusChange: true,
        eventType: 'awaitingLeader',
        description: 'Awaiting walk leader'
      },
      awaitingWalkDetails: {
        mustHaveLeader: true,
        statusChange: true,
        eventType: 'awaitingWalkDetails',
        description: 'Awaiting walk details from leader',
        notifyLeader: true,
        notifyCoordinator: true
      },
      walkDetailsRequested: {
        mustHaveLeader: true,
        eventType: 'walkDetailsRequested',
        description: 'Walk details requested from leader',
        notifyLeader: true,
        notifyCoordinator: true
      },
      walkDetailsUpdated: {
        eventType: 'walkDetailsUpdated',
        description: 'Walk details updated',
        notifyLeader: true,
        notifyCoordinator: true
      },
      walkDetailsCopied: {
        eventType: 'walkDetailsCopied',
        description: 'Walk details copied'
      },
      awaitingApproval: {
        mustHaveLeader: true,
        mustPassValidation: true,
        statusChange: true,
        eventType: 'awaitingApproval',
        readyToBe: 'approved',
        description: 'Awaiting confirmation of walk details',
        notifyLeader: true,
        notifyCoordinator: true
      },
      approved: {
        mustHaveLeader: true,
        mustPassValidation: true,
        showDetails: true,
        statusChange: true,
        eventType: 'approved',
        readyToBe: 'published',
        description: 'Approved',
        notifyLeader: true,
        notifyCoordinator: true
      },
      deleted: {
        statusChange: true,
        eventType: 'deleted',
        description: 'Deleted',
        notifyLeader: true,
        notifyCoordinator: true
      }
    };

    return {
      toEventType: function (eventTypeString) {
        if (eventTypeString) {
          if (_.includes(eventTypeString, ' ')) eventTypeString = s.camelcase(eventTypeString.toLowerCase());
          var eventType = eventTypes[eventTypeString];
          if (!eventType) throw new Error("Event Type '" + eventTypeString + "' does not exist. Must be one of: " + _.keys(eventTypes).join(', '));
          return eventType;
        }
      },
      walkEditModes: {
        add: {caption: 'add', title: 'Add new'},
        edit: {caption: 'edit', title: 'Edit existing', editEnabled: true},
        more: {caption: 'more', title: 'View'},
        lead: {caption: 'lead', title: 'Lead this', initialiseWalkLeader: true}
      },
      eventTypes: eventTypes,
      walkStatuses: _(eventTypes).filter(function (eventType) {
        return eventType.statusChange;
      })
    }
  })
  .controller('WalksController', function ($sce, $log, $routeParams, $interval, $rootScope, $location, $scope, $filter, $q, RamblersUploadAudit, WalksService, WalksQueryService, URLService,
                                           ClipboardService, WalksReferenceService, WalkNotificationService, LoggedInMemberService, MemberService, DateUtils, BatchGeoExportService,
                                           RamblersWalksAndEventsService, Notifier, CommitteeReferenceData, GoogleMapsConfig, MeetupService) {

      var logger = $log.getInstance('WalksController');
      var noLogger = $log.getInstance('WalksControllerNoLogger');
      $log.logLevels['WalksControllerNoLogger'] = $log.LEVEL.OFF;
      $log.logLevels['WalksController'] = $log.LEVEL.OFF;

      $scope.$watch('filterParameters.quickSearch', function (quickSearch, oldQuery) {
        refreshFilteredWalks();
      });

      $scope.finalStatusError = function () {
        return _.findWhere($scope.ramblersUploadAudit, {status: "error"});
      };

      $scope.fileNameChanged = function () {
        logger.debug('filename changed to', $scope.userEdits.fileName);
        $scope.refreshRamblersUploadAudit();
      };

      $scope.refreshRamblersUploadAudit = function (stop) {
        logger.debug('refreshing audit trail records related to', $scope.userEdits.fileName);
        return RamblersUploadAudit.query({fileName: $scope.userEdits.fileName}, {sort: {auditTime: -1}})
          .then(function (auditItems) {
            logger.debug('Filtering', auditItems.length, 'audit trail records related to', $scope.userEdits.fileName);
            $scope.ramblersUploadAudit = _.chain(auditItems)
              .filter(function (auditItem) {
                return $scope.userEdits.showDetail || auditItem.type !== "detail";
              })
              .map(function (auditItem) {
                if (auditItem.status === "complete") {
                  logger.debug('Upload complete');
                  notifyWalkExport.success("Ramblers upload completed");
                  $interval.cancel(stop);
                  $scope.userEdits.saveInProgress = false;
                }
                return auditItem;
              })
              .value();
          });
      };

      $scope.ramblersUploadAudit = [];
      $scope.walksForExport = [];
      $scope.walkEditModes = WalksReferenceService.walkEditModes;
      $scope.walkStatuses = WalksReferenceService.walkStatuses;
      $scope.walkAlert = {};
      $scope.walkExport = {};
      var notify = Notifier($scope);
      var notifyWalkExport = Notifier($scope.walkExport);
      var notifyWalkEdit = Notifier($scope.walkAlert);
      var SHOW_START_POINT = "show-start-point";
      var SHOW_DRIVING_DIRECTIONS = "show-driving-directions";
      notify.setBusy();
      $scope.copyFrom = {walkTemplates: [], walkTemplate: {}};
      $scope.userEdits = {
        copyToClipboard: ClipboardService.copyToClipboard,
        meetupEvent: {},
        copySource: 'copy-selected-walk-leader',
        copySourceFromWalkLeaderMemberId: undefined,
        expandedWalks: [],
        mapDisplay: SHOW_START_POINT,
        longerDescriptionPreview: true,
        walkExportActive: function (activeTab) {
          return activeTab === $scope.walkExportActive;
        },
        walkExportTab0Active: true,
        walkExportTab1Active: false,
        walkExportTabActive: 0,
        status: undefined,
        sendNotifications: true,
        saveInProgress: false,
        fileNames: [],
        walkLink: function (walk) {
          return walk && walk.$id() ? URLService.notificationHref({
            type: "walk",
            area: "walks",
            id: walk.$id()
          }) : undefined
        }
      };
      $scope.walks = [];
      $scope.busy = false;
      $scope.walksProgrammeOpen = URLService.isArea('walks');
      $scope.walksInformationOpen = URLService.isSubArea('information');
      $scope.walksMapViewOpen = URLService.isSubArea('mapview');

      $scope.todayValue = DateUtils.momentNowNoTime().valueOf();

      $scope.userEdits.walkDateCalendar = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.userEdits.walkDateCalendar.opened = true;
        }
      };

      $scope.addWalk = function () {
        showWalkDialog(new WalksService({
          status: WalksReferenceService.eventTypes.awaitingLeader.eventType,
          walkType: $scope.type[0],
          walkDate: $scope.todayValue
        }), WalksReferenceService.walkEditModes.add);
      };

      $scope.addWalkSlotsDialog = function () {
        $rootScope.$broadcast('addWalkSlotsDialogOpen');
      };

      $scope.unlinkRamblersDataFromCurrentWalk = function () {
        delete $scope.currentWalk.ramblersWalkId;
        notify.progress('Previous Ramblers walk has now been unlinked.')
      };

      $scope.canUnlinkRamblers = function () {
        return LoggedInMemberService.allowWalkAdminEdits() && $scope.ramblersWalkExists();
      };

      $scope.unlinkMeetup = function () {
        delete $scope.currentWalk.meetupEventTitle;
        delete $scope.currentWalk.meetupEventUrl;
        notify.progress('Previous Meetup link has now been removed.')
      };

      $scope.canUnlinkMeetup = function () {
        return LoggedInMemberService.allowWalkAdminEdits() && $scope.currentWalk && $scope.currentWalk.meetupEventUrl;
      };

      $scope.notUploadedToRamblersYet = function () {
        return !$scope.ramblersWalkExists();
      };

      $scope.insufficientDataToUploadToRamblers = function () {
        return LoggedInMemberService.allowWalkAdminEdits() && $scope.currentWalk && !($scope.currentWalk.gridReference || $scope.currentWalk.postcode);
      };

      $scope.canExportToRamblers = function () {
        return LoggedInMemberService.allowWalkAdminEdits() && $scope.validateWalk().selected;
      };

      $scope.validateWalk = function () {
        return RamblersWalksAndEventsService.validateWalk($scope.currentWalk, $scope.members);
      };

      $scope.walkValidations = function () {
        var walkValidations = $scope.validateWalk().walkValidations;
        return 'This walk cannot be included in the Ramblers Walks and Events Manager export due to the following ' + walkValidations.length + ' problem(s): ' + walkValidations.join(", ") + '.';
      };

      $scope.grades = ['Easy access', 'Easy', 'Leisurely', 'Moderate', 'Strenuous', 'Technical'];
      $scope.walkTypes = ['Circular', 'Linear'];

      $scope.meetupEventUrlChange = function (walk) {
        walk.meetupEventTitle = $scope.userEdits.meetupEvent.title;
        walk.meetupEventUrl = $scope.userEdits.meetupEvent.url;
      };

      $scope.meetupSelectSync = function (walk) {
        $scope.userEdits.meetupEvent = _.findWhere($scope.meetupEvents, {url: walk.meetupEventUrl});
      };

      $scope.ramblersWalkExists = function () {
        return $scope.validateWalk().publishedOnRamblers
      };

      function loggedInMemberIsLeadingWalk(walk) {
        return walk && walk.walkLeaderMemberId === LoggedInMemberService.loggedInMember().memberId
      }

      $scope.loggedIn = function () {
        return LoggedInMemberService.memberLoggedIn();
      };

      $scope.toWalkEditMode = function (walk) {
        if (LoggedInMemberService.memberLoggedIn()) {
          if (loggedInMemberIsLeadingWalk(walk) || LoggedInMemberService.allowWalkAdminEdits()) {
            return WalksReferenceService.walkEditModes.edit;
          } else if (!walk.walkLeaderMemberId) {
            return WalksReferenceService.walkEditModes.lead;
          }
        }
      };

      $scope.actionWalk = function (walk) {
        showWalkDialog(walk, $scope.toWalkEditMode(walk));
      };

      $scope.deleteWalkDetails = function () {
        $scope.confirmAction = {delete: true};
        notifyWalkEdit.warning({
          title: 'Confirm delete of walk details.',
          message: 'If you confirm this, the slot for ' + $filter('displayDate')($scope.currentWalk.walkDate) + ' will be deleted from the site.'
        });
      };

      $scope.cancelWalkDetails = function () {
        $scope.confirmAction = {cancel: true};
        notifyWalkEdit.warning({
          title: 'Cancel changes.',
          message: 'Click Confirm to lose any changes you\'ve just made for ' + $filter('displayDate')($scope.currentWalk.walkDate) + ', or Cancel to carry on editing.'
        });
      };

      $scope.confirmCancelWalkDetails = function () {
        hideWalkDialogAndRefreshWalks();
      };

      function isWalkReadyForStatusChangeTo(eventType) {
        notifyWalkEdit.hide();
        logger.info('isWalkReadyForStatusChangeTo ->', eventType);
        var walkValidations = $scope.validateWalk().walkValidations;
        if (eventType.mustHaveLeader && !$scope.currentWalk.walkLeaderMemberId) {
          notifyWalkEdit.warning(
            {
              title: 'Walk leader needed',
              message: ' - this walk cannot be changed to ' + eventType.description + ' yet.'
            });
          revertToPriorWalkStatus();
          return false;
        } else if (eventType.mustPassValidation && walkValidations.length > 0) {
          notifyWalkEdit.warning(
            {
              title: 'This walk is not ready to be ' + eventType.readyToBe + ' yet due to the following ' + walkValidations.length + ' problem(s): ',
              message: walkValidations.join(", ") + '. You can still save this walk, then come back later on to complete the rest of the details.'
            });
          revertToPriorWalkStatus();
          return false;
        } else {
          return true;
        }
      }

      function initiateEvent() {
        $scope.userEdits.saveInProgress = true;
        var walk = DateUtils.convertDateFieldInObject($scope.currentWalk, 'walkDate');
        return WalkNotificationService.createEventAndSendNotifications($scope.members, walk, $scope.userEdits.status, notifyWalkEdit, $scope.userEdits.sendNotifications && walk.walkLeaderMemberId);
      }

      $scope.confirmDeleteWalkDetails = function () {
        $scope.userEdits.status = WalksReferenceService.eventTypes.deleted.eventType;
        return initiateEvent()
          .then(function () {
            return $scope.currentWalk.$saveOrUpdate(hideWalkDialogAndRefreshWalks, hideWalkDialogAndRefreshWalks);
          })
          .catch(function () {
            $scope.userEdits.saveInProgress = false;
          });
      };

      $scope.saveWalkDetails = function () {
        return initiateEvent()
          .then(function (notificationSent) {
            return $scope.currentWalk.$saveOrUpdate(afterSaveWith(notificationSent), afterSaveWith(notificationSent));
          })
          .catch(function () {
            $scope.userEdits.saveInProgress = false;
          });
      };

      $scope.requestApproval = function () {
        logger.info('requestApproval called with current status:', $scope.userEdits.status);
        if (isWalkReadyForStatusChangeTo(WalksReferenceService.eventTypes.awaitingApproval)) {
          $scope.confirmAction = {requestApproval: true};
          notifyWalkEdit.warning({
            title: 'Confirm walk details complete.',
            message: 'If you confirm this, your walk details will be emailed to ' + walksCoordinatorName() + ' and they will publish these to the site.'
          });
        }
      };

      $scope.contactOther = function () {
        notifyWalkEdit.warning({
          title: 'Confirm walk details complete.',
          message: 'If you confirm this, your walk details will be emailed to ' + walksCoordinatorName() + ' and they will publish these to the site.'
        });
      };

      $scope.walkStatusChange = function (status) {
        $scope.userEdits.priorStatus = status;
        notifyWalkEdit.hide();
        logger.info('walkStatusChange - was:', status, 'now:', $scope.userEdits.status);
        if (isWalkReadyForStatusChangeTo(WalksReferenceService.toEventType($scope.userEdits.status)))
          switch ($scope.userEdits.status) {
            case WalksReferenceService.eventTypes.awaitingLeader.eventType: {
              var walkDate = $scope.currentWalk.walkDate;
              $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingLeader.eventType;
              $scope.currentWalk = new WalksService(_.pick($scope.currentWalk, ['_id', 'events', 'walkDate']));
              return notifyWalkEdit.success({
                title: 'Walk details reset for ' + $filter('displayDate')(walkDate) + '.',
                message: 'Status is now ' + WalksReferenceService.eventTypes.awaitingLeader.description
              });
            }
            case WalksReferenceService.eventTypes.approved.eventType: {
              return $scope.approveWalkDetails();
            }
          }

      };

      $scope.approveWalkDetails = function () {
        var walkValidations = $scope.validateWalk().walkValidations;
        if (walkValidations.length > 0) {
          notifyWalkEdit.warning({
            title: 'This walk still has the following ' + walkValidations.length + ' field(s) that need attention: ',
            message: walkValidations.join(", ") +
              '. You\'ll have to get the rest of these details completed before you mark the walk as approved.'
          });
          revertToPriorWalkStatus();
        } else {
          notifyWalkEdit.success({
            title: 'Ready to publish walk details!',
            message: 'All fields appear to be filled in okay, so next time you save this walk it will be published.'
          });
        }
      };

      $scope.confirmRequestApproval = function () {
        $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingApproval.eventType;
        $scope.saveWalkDetails();
      };

      $scope.cancelConfirmableAction = function () {
        delete $scope.confirmAction;
        notify.hide();
        notifyWalkEdit.hide();
      };

      function revertToPriorWalkStatus() {
        logger.info('revertToPriorWalkStatus:', $scope.userEdits.status, '->', $scope.userEdits.priorStatus);
        if ($scope.userEdits.priorStatus) $scope.userEdits.status = $scope.userEdits.priorStatus;
      }

      $scope.populateCurrentWalkFromTemplate = function () {
        var walkTemplate = _.clone($scope.copyFrom.walkTemplate);
        if (walkTemplate) {
          var templateDate = $filter('displayDate')(walkTemplate.walkDate);
          delete walkTemplate._id;
          delete walkTemplate.events;
          delete walkTemplate.ramblersWalkId;
          delete walkTemplate.walkDate;
          delete walkTemplate.displayName;
          delete walkTemplate.contactPhone;
          delete walkTemplate.contactEmail;
          angular.extend($scope.currentWalk, walkTemplate);
          var event = WalkNotificationService.createEventIfRequired($scope.currentWalk, WalksReferenceService.eventTypes.walkDetailsCopied.eventType, 'Copied from previous walk on ' + templateDate);
          WalkNotificationService.writeEventIfRequired($scope.currentWalk, event);
          notifyWalkEdit.success({
            title: 'Walk details were copied from ' + templateDate + '.',
            message: 'Make any further changes here and save when you are done.'
          });
        }
      };

      $scope.filterParameters = {
        quickSearch: '',
        selectType: '1',
        ascending: "true"
      };

      $scope.selectCopySelectedLeader = function () {
        $scope.userEdits.copySource = 'copy-selected-walk-leader';
        $scope.populateWalkTemplates();
      };

      $scope.populateWalkTemplates = function (injectedMemberId) {
        var memberId = $scope.currentWalk.walkLeaderMemberId || injectedMemberId;
        var criteria;
        switch ($scope.userEdits.copySource) {
          case "copy-selected-walk-leader": {
            criteria = {
              walkLeaderMemberId: $scope.userEdits.copySourceFromWalkLeaderMemberId,
              briefDescriptionAndStartPoint: {$exists: true}
            };
            break
          }
          case "copy-with-os-maps-route-selected": {
            criteria = {osMapsRoute: {$exists: true}};
            break
          }
          default: {
            criteria = {walkLeaderMemberId: memberId};
          }
        }
        logger.info('selecting walks', $scope.userEdits.copySource, criteria);
        WalksService.query(criteria, {sort: {walkDate: -1}})
          .then(function (walks) {
            $scope.copyFrom.walkTemplates = walks;
          });
      };

      $scope.walkLeaderMemberIdChanged = function () {
        notifyWalkEdit.hide();
        var walk = $scope.currentWalk;
        var memberId = walk.walkLeaderMemberId;
        if (!memberId) {
          $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingLeader.eventType;
          delete walk.walkLeaderMemberId;
          delete walk.contactId;
          delete walk.displayName;
          delete walk.contactPhone;
          delete walk.contactEmail;
        } else {
          var selectedMember = _.find($scope.members, function (member) {
            return member.$id() === memberId;
          });
          if (selectedMember) {
            $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingWalkDetails.eventType;
            walk.contactId = selectedMember.contactId;
            walk.displayName = selectedMember.displayName;
            walk.contactPhone = selectedMember.mobileNumber;
            walk.contactEmail = selectedMember.email;
            $scope.populateWalkTemplates(memberId);
          }
        }
      };

      $scope.myOrWalkLeader = function () {
        return loggedInMemberIsLeadingWalk($scope.currentWalk) ? 'my' : $scope.currentWalk && $scope.currentWalk.displayName + "'s";
      };

      $scope.meOrWalkLeader = function () {
        return loggedInMemberIsLeadingWalk($scope.currentWalk) ? 'me' : $scope.currentWalk && $scope.currentWalk.displayName;
      };

      $scope.personToNotify = function () {
        return loggedInMemberIsLeadingWalk($scope.currentWalk) ? walksCoordinatorName() : $scope.currentWalk && $scope.currentWalk.displayName;
      };

      function walksCoordinatorName() {
        return CommitteeReferenceData.contactUsField('walks', 'fullName');
      }

      function convertWalkDateIfNotNumeric(walk) {
        var walkDate = DateUtils.asValueNoTime(walk.walkDate);
        if (walkDate !== walk.walkDate) {
          logger.info('Converting date from', walk.walkDate, '(' + $filter('displayDateAndTime')(walk.walkDate) + ') to', walkDate, '(' + $filter('displayDateAndTime')(walkDate) + ')');
          walk.walkDate = walkDate;
        } else {
          logger.info('Walk date', walk.walkDate, 'is already in correct format');
        }
        return walk;
      }

      function latestEventWithStatusChangeIs(eventType) {
        return WalkNotificationService.latestEventWithStatusChangeIs($scope.currentWalk, eventType);
      }

      $scope.dataHasChanged = function () {
        var dataAuditDelta = WalkNotificationService.dataAuditDelta($scope.currentWalk, $scope.userEdits.status);
        var notificationRequired = dataAuditDelta.notificationRequired;
        dataAuditDelta.notificationRequired && noLogger.info('dataAuditDelta - eventExists:', dataAuditDelta.eventExists, 'dataChanged:', dataAuditDelta.dataChanged, $filter('toAuditDeltaChangedItems')(dataAuditDelta.changedItems));
        dataAuditDelta.dataChanged && noLogger.info('dataAuditDelta - previousData:', dataAuditDelta.previousData, 'currentData:', dataAuditDelta.currentData);
        return notificationRequired;
      };

      function ownedAndAwaitingWalkDetails() {
        return loggedInMemberIsLeadingWalk($scope.currentWalk) && $scope.userEdits.status === WalksReferenceService.eventTypes.awaitingWalkDetails.eventType;
      }

      function editable() {
        return !$scope.confirmAction && (LoggedInMemberService.allowWalkAdminEdits() || loggedInMemberIsLeadingWalk($scope.currentWalk));
      }

      function allowSave() {
        return editable() && $scope.dataHasChanged();
      }

      $scope.allow = {
        close: function () {
          return !$scope.userEdits.saveInProgress && !$scope.confirmAction && !allowSave()
        },
        save: allowSave,
        cancel: function () {
          return !$scope.userEdits.saveInProgress && editable() && $scope.dataHasChanged();
        },
        delete: function () {
          return !$scope.confirmAction && LoggedInMemberService.allowWalkAdminEdits() && $scope.walkEditMode && $scope.walkEditMode.editEnabled;
        },
        notifyConfirmation: function () {
          return (allowSave() || $scope.confirmAction && $scope.confirmAction.delete) && $scope.currentWalk.walkLeaderMemberId;
        },
        adminEdits: function () {
          return LoggedInMemberService.allowWalkAdminEdits();
        },
        edits: editable,
        historyView: function () {
          return loggedInMemberIsLeadingWalk($scope.currentWalk) || LoggedInMemberService.allowWalkAdminEdits();
        },
        detailView: function () {
          return LoggedInMemberService.memberLoggedIn();
        },
        approve: function () {
          return !$scope.confirmAction && LoggedInMemberService.allowWalkAdminEdits() && latestEventWithStatusChangeIs(WalksReferenceService.eventTypes.awaitingApproval);
        },
        requestApproval: function () {
          return !$scope.confirmAction && ownedAndAwaitingWalkDetails();
        }
      };

      $scope.previewLongerDescription = function () {
        logger.debug('previewLongerDescription');
        $scope.userEdits.longerDescriptionPreview = true;
      };

      $scope.editLongerDescription = function () {
        logger.debug('editLongerDescription');
        $scope.userEdits.longerDescriptionPreview = false;
      };
      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      };

      $scope.showAllWalks = function () {
        $scope.expensesOpen = true;
        $location.path('/walks/programme')
      };

      $scope.googleMaps = function (walk) {
        return $scope.userEdits.mapDisplay === SHOW_DRIVING_DIRECTIONS ?
          "https://www.google.com/maps/embed/v1/directions?origin=" + $scope.userEdits.fromPostcode + "&destination=" + walk.postcode + "&key=" + $scope.googleMapsConfig.apiKey :
          "https://www.google.com/maps/embed/v1/place?q=" + walk.postcode + "&zoom=" + $scope.googleMapsConfig.zoomLevel + "&key=" + $scope.googleMapsConfig.apiKey;
      };

      $scope.autoSelectMapDisplay = function () {
        var switchToShowStartPoint = $scope.drivingDirectionsDisabled() && $scope.userEdits.mapDisplay === SHOW_DRIVING_DIRECTIONS;
        var switchToShowDrivingDirections = !$scope.drivingDirectionsDisabled() && $scope.userEdits.mapDisplay === SHOW_START_POINT;
        if (switchToShowStartPoint) {
          $scope.userEdits.mapDisplay = SHOW_START_POINT;
        } else if (switchToShowDrivingDirections) {
          $scope.userEdits.mapDisplay = SHOW_DRIVING_DIRECTIONS;
        }
      };

      $scope.drivingDirectionsDisabled = function () {
        return $scope.userEdits.fromPostcode.length < 3;
      };

      $scope.eventTypeFor = function (walk) {
        var latestEventWithStatusChange = WalkNotificationService.latestEventWithStatusChange(walk);
        var eventType = WalksReferenceService.toEventType(latestEventWithStatusChange.eventType) || walk.status || WalksReferenceService.eventTypes.awaitingWalkDetails.eventType;
        noLogger.info('latestEventWithStatusChange', latestEventWithStatusChange, 'eventType', eventType, 'walk.events', walk.events);
        return eventType;
      };

      $scope.viewWalkField = function (walk, field) {
        var eventType = $scope.eventTypeFor(walk);
        if (eventType.showDetails) {
          return walk[field] || '';
        } else if (field === 'briefDescriptionAndStartPoint') {
          return eventType.description;
        } else {
          return '';
        }
      };

      function showWalkDialog(walk, walkEditMode) {
        delete $scope.confirmAction;
        $scope.userEdits.sendNotifications = true;
        $scope.walkEditMode = walkEditMode;
        $scope.currentWalk = walk;
        if (walkEditMode.initialiseWalkLeader) {
          $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingWalkDetails.eventType;
          walk.walkLeaderMemberId = LoggedInMemberService.loggedInMember().memberId;
          $scope.walkLeaderMemberIdChanged();
          notifyWalkEdit.success({
            title: 'Thanks for offering to lead this walk ' + LoggedInMemberService.loggedInMember().firstName + '!',
            message: 'Please complete as many details you can, then save to allocate this slot on the walks programme. ' +
              'It will be published to the public once it\'s approved. If you want to release this slot again, just click cancel.'
          });
        } else {
          var eventTypeIfExists = WalkNotificationService.latestEventWithStatusChange($scope.currentWalk).eventType;
          if (eventTypeIfExists) {
            $scope.userEdits.status = eventTypeIfExists
          }
          $scope.userEdits.copySourceFromWalkLeaderMemberId = walk.walkLeaderMemberId || LoggedInMemberService.loggedInMember().memberId;
          $scope.populateWalkTemplates();
          $scope.meetupSelectSync($scope.currentWalk);
          notifyWalkEdit.hide();
        }
        $('#walk-dialog').modal();
      }

      function walksCriteriaObject() {
        switch ($scope.filterParameters.selectType) {
          case '1':
            return {walkDate: {$gte: $scope.todayValue}};
          case '2':
            return {walkDate: {$lt: $scope.todayValue}};
          case '3':
            return {};
          case '4':
            return {displayName: {$exists: false}};
          case '5':
            return {briefDescriptionAndStartPoint: {$exists: false}};
        }
      }

      function walksSortObject() {
        switch ($scope.filterParameters.ascending) {
          case 'true':
            return {sort: {walkDate: 1}};
          case 'false':
            return {sort: {walkDate: -1}};
        }
      }


      function query() {
        if (URLService.hasRouteParameter('walkId')) {
          return WalksService.getById($routeParams.walkId)
            .then(function (walk) {
              if (!walk) notify.error('Walk could not be found. Try opening again from the link in the notification email, or choose the Show All Walks button');
              return [walk];
            });
        } else {
          return WalksService.query(walksCriteriaObject(), walksSortObject());
        }
      }

      function refreshFilteredWalks() {
        notify.setBusy();
        $scope.filteredWalks = $filter('filter')($scope.walks, $scope.filterParameters.quickSearch);
        var walksCount = ($scope.filteredWalks && $scope.filteredWalks.length) || 0;
        notify.progress('Showing ' + walksCount + ' walk(s)');
        if ($scope.filteredWalks.length > 0) {
          $scope.userEdits.expandedWalks = [$scope.filteredWalks[0].$id()];
        }
        notify.clearBusy();
      }

      $scope.showTableHeader = function (walk) {
        return $scope.filteredWalks.indexOf(walk) === 0 || $scope.isExpandedFor($scope.filteredWalks[$scope.filteredWalks.indexOf(walk) - 1]);
      };

      $scope.nextWalk = function (walk) {
        return walk && walk.$id() === $scope.nextWalkId;
      };

      $scope.durationInFutureFor = function (walk) {
        return walk && walk.walkDate === $scope.todayValue ? 'today' : (DateUtils.asMoment(walk.walkDate).fromNow());
      };

      $scope.toggleViewFor = function (walk) {

        function arrayRemove(arr, value) {

          return arr.filter(function (ele) {
            return ele !== value;
          });

        }

        var walkId = walk.$id();
        if (_.contains($scope.userEdits.expandedWalks, walkId)) {
          $scope.userEdits.expandedWalks = arrayRemove($scope.userEdits.expandedWalks, walkId);
          logger.debug('toggleViewFor:', walkId, '-> collapsing');
        } else {
          $scope.userEdits.expandedWalks.push(walkId);
          logger.debug('toggleViewFor:', walkId, '-> expanding');
        }
        logger.debug('toggleViewFor:', walkId, '-> expandedWalks contains', $scope.userEdits.expandedWalks)
      };

      $scope.isExpandedFor = function (walk) {
        return _.contains($scope.userEdits.expandedWalks, walk.$id());
      };

      $scope.tableRowOdd = function (walk) {
        return $scope.filteredWalks.indexOf(walk) % 2 === 0;
      };

      function getNextWalkId(walks) {
        var nextWalk = _.chain(walks).sortBy('walkDate').find(function (walk) {
          return walk.walkDate >= $scope.todayValue;
        }).value();

        return nextWalk && nextWalk.$id();
      }

      $scope.refreshWalks = function (notificationSent) {
        notify.setBusy();
        notify.progress('Refreshing walks...');
        return query()
          .then(function (walks) {
            $scope.nextWalkId = URLService.hasRouteParameter('walkId') ? undefined : getNextWalkId(walks);
            $scope.walks = URLService.hasRouteParameter('walkId') ? walks : WalksQueryService.activeWalks(walks);
            refreshFilteredWalks();
            notify.clearBusy();
            if (!notificationSent) {
              notifyWalkEdit.hide();
            }
            $scope.userEdits.saveInProgress = false;
          });
      };

      $scope.hideWalkDialog = function () {
        $('#walk-dialog').modal('hide');
        delete $scope.confirmAction;
      };

      function hideWalkDialogAndRefreshWalks() {
        logger.info('hideWalkDialogAndRefreshWalks');
        $scope.hideWalkDialog();
        $scope.refreshWalks();
      }

      function afterSaveWith(notificationSent) {
        return function () {
          if (!notificationSent) $('#walk-dialog').modal('hide');
          notifyWalkEdit.clearBusy();
          delete $scope.confirmAction;
          $scope.refreshWalks(notificationSent);
          $scope.userEdits.saveInProgress = false;
        }
      }

      function refreshRamblersConfig() {
        RamblersWalksAndEventsService.walkBaseUrl().then(function (walkBaseUrl) {
          $scope.ramblersWalkBaseUrl = walkBaseUrl;
        });
      }

      function refreshGoogleMapsConfig() {
        GoogleMapsConfig.getConfig().then(function (googleMapsConfig) {
          $scope.googleMapsConfig = googleMapsConfig;
          $scope.googleMapsConfig.zoomLevel = 12;
        });
      }

      function refreshMeetupData() {
        MeetupService.config().then(function (meetupConfig) {
          $scope.meetupConfig = meetupConfig;
        });

        MeetupService.eventsForStatus('past')
          .then(function (pastEvents) {
            MeetupService.eventsForStatus('upcoming')
              .then(function (futureEvents) {
                $scope.meetupEvents = _.sortBy(pastEvents.concat(futureEvents), 'date,').reverse();
              });
          })
      }

      function refreshHomePostcode() {
        $scope.userEdits.fromPostcode = LoggedInMemberService.memberLoggedIn() ? LoggedInMemberService.loggedInMember().postcode : "";
        logger.debug('set from postcode to', $scope.userEdits.fromPostcode);
        $scope.autoSelectMapDisplay();
      }

      $scope.$on('memberLoginComplete', function () {
        refreshMembers();
        refreshHomePostcode();
      });

      $scope.$on('walkSlotsCreated', function () {
        $scope.refreshWalks();
      });

      function refreshMembers() {
        if (LoggedInMemberService.memberLoggedIn()) MemberService.allLimitedFields(MemberService.filterFor.GROUP_MEMBERS)
          .then(function (members) {
            $scope.members = members;
            return members;
          });
      }

      $scope.batchGeoDownloadFile = function () {
        return BatchGeoExportService.exportWalks($scope.walks, $scope.members);
      };

      $scope.batchGeoDownloadFileName = function () {
        return BatchGeoExportService.exportWalksFileName();
      };

      $scope.batchGeoDownloadHeader = function () {
        return BatchGeoExportService.exportColumnHeadings();
      };

      $scope.exportableWalks = function () {
        return RamblersWalksAndEventsService.exportableWalks($scope.walksForExport);
      };

      $scope.walksDownloadFile = function () {
        return RamblersWalksAndEventsService.exportWalks($scope.exportableWalks(), $scope.members);
      };

      $scope.uploadToRamblers = function () {
        $scope.ramblersUploadAudit = [];
        $scope.userEdits.walkExportTab0Active = false;
        $scope.userEdits.walkExportTab1Active = true;
        $scope.userEdits.saveInProgress = true;
        RamblersWalksAndEventsService.uploadToRamblers($scope.walksForExport, $scope.members, notifyWalkExport).then(function (fileName) {
          $scope.userEdits.fileName = fileName;
          var stop = $interval(callAtInterval, 2000, false);
          if (!_.contains($scope.userEdits.fileNames, $scope.userEdits.fileName)) {
            $scope.userEdits.fileNames.push($scope.userEdits.fileName);
            logger.debug('added', $scope.userEdits.fileName, 'to filenames of', $scope.userEdits.fileNames.length, 'audit trail records');
          }
          delete $scope.finalStatusError;

          function callAtInterval() {
            logger.debug("Refreshing audit trail for file", $scope.userEdits.fileName, 'count =', $scope.ramblersUploadAudit.length);
            $scope.refreshRamblersUploadAudit(stop);
          }

        });
      };

      $scope.walksDownloadFileName = function () {
        return RamblersWalksAndEventsService.exportWalksFileName();
      };

      $scope.walksDownloadHeader = function () {
        return RamblersWalksAndEventsService.exportColumnHeadings();
      };

      $scope.selectWalksForExport = function () {
        showWalkExportDialog();
      };

      $scope.changeWalkExportSelection = function (walk) {
        if (walk.walkValidations.length === 0) {
          walk.selected = !walk.selected;
          notifyWalkExport.hide();
        } else {
          notifyWalkExport.error({
            title: 'You can\'t export the walk for ' + $filter('displayDate')(walk.walk.walkDate),
            message: walk.walkValidations.join(', ')
          });
        }
      };

      $scope.cancelExportWalkDetails = function () {
        $('#walk-export-dialog').modal('hide');
      };

      function populateWalkExport(walksForExport) {
        $scope.walksForExport = walksForExport;
        notifyWalkExport.success('Found total of ' + $scope.walksForExport.length + ' walk(s), ' + $scope.walksDownloadFile().length + ' preselected for export');
        notifyWalkExport.clearBusy();
      }


      function showWalkExportDialog() {
        $scope.walksForExport = [];
        notifyWalkExport.warning('Determining which walks to export', true);
        RamblersUploadAudit.all({limit: 1000, sort: {auditTime: -1}})
          .then(function (auditItems) {
            logger.debug('found total of', auditItems.length, 'audit trail records');
            $scope.userEdits.fileNames = _.chain(auditItems).pluck('fileName').unique().value();
            logger.debug('unique total of', $scope.userEdits.fileNames.length, 'audit trail records');
          });
        RamblersWalksAndEventsService.createWalksForExportPrompt($scope.walks, $scope.members)
          .then(populateWalkExport)
          .catch(function (error) {
            logger.debug('error->', error);
            notifyWalkExport.error({title: 'Problem with Ramblers export preparation', message: JSON.stringify(error)});
          });
        $('#walk-export-dialog').modal();
      }

      refreshMembers();
      $scope.refreshWalks();
      refreshRamblersConfig();
      refreshGoogleMapsConfig();
      refreshMeetupData();
      refreshHomePostcode();
    }
  )
;
