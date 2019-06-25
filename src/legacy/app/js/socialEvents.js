angular.module('ekwgApp')
  .factory('SocialEventsService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('socialEvents');
  })
  .factory('SocialEventAttendeeService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('socialEventAttendees');
  })
  .controller('SocialEventsController', function ($routeParams, $log, $q, $scope, $filter, URLService, Upload,
                                                  SocialEventsService, SiteEditService,
                                                  SocialEventAttendeeService, LoggedInMemberService, MemberService,
                                                  AWSConfig, ContentMetaDataService, DateUtils, MailchimpSegmentService,
                                                  ClipboardService, Notifier, EKWGFileUpload, CommitteeReferenceData, ModalService) {
    $scope.userEdits = {
      copyToClipboard: ClipboardService.copyToClipboard,
      longerDescriptionPreview: true,
      socialEventLink: function (socialEvent) {
        return socialEvent && socialEvent.$id() ? URLService.notificationHref({
          type: "socialEvent",
          area: "social",
          id: socialEvent.$id()
        }) : undefined;
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

    $scope.contactUs = {
      ready: function () {
        return CommitteeReferenceData.ready;
      }
    };

    var logger = $log.getInstance('SocialEventsController');
    $log.logLevels['SocialEventsController'] = $log.LEVEL.INFO;
    var notify = Notifier($scope);

    $scope.attachmentBaseUrl = ContentMetaDataService.baseUrl('socialEvents');
    $scope.selectMembers = [];
    $scope.display = {attendees: []};

    $scope.socialEventsDetailProgrammeOpen = true;
    $scope.socialEventsBriefProgrammeOpen = true;
    $scope.socialEventsInformationOpen = true;
    $scope.todayValue = DateUtils.momentNowNoTime().valueOf();
    applyAllowEdits('controllerInitialisation');

    $scope.eventDateCalendar = {
      open: function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.eventDateCalendar.opened = true;
      }
    };

    $scope.$on('memberLoginComplete', function () {
      applyAllowEdits('memberLoginComplete');
      refreshMembers();
      refreshSocialEvents();
    });

    $scope.$on('memberLogoutComplete', function () {
      applyAllowEdits('memberLogoutComplete');
    });

    $scope.$on('editSite', function () {
      applyAllowEdits('editSite');
    });

    $scope.addSocialEvent = function () {
      showSocialEventDialog(new SocialEventsService({eventDate: $scope.todayValue, attendees: []}), 'Add New');
    };

    $scope.viewSocialEvent = function (socialEvent) {
      showSocialEventDialog(socialEvent, 'View');
    };

    $scope.editSocialEvent = function (socialEvent) {
      showSocialEventDialog(socialEvent, 'Edit Existing');
    };

    $scope.deleteSocialEventDetails = function () {
      $scope.allowDelete = false;
      $scope.allowConfirmDelete = true;
    };

    $scope.cancelSocialEventDetails = function () {
      hideSocialEventDialogAndRefreshSocialEvents();
    };

    $scope.saveSocialEventDetails = function () {
      $q.when(notify.progress({title: 'Save in progress', message: 'Saving social event'}, true))
        .then(prepareToSave, notify.error, notify.progress)
        .then(saveSocialEvent, notify.error, notify.progress)
        .then(notify.clearBusy, notify.error, notify.progress)
        .catch(notify.error);
    };

    function prepareToSave() {
      DateUtils.convertDateFieldInObject($scope.currentSocialEvent, 'eventDate');
    }

    function saveSocialEvent() {
      return $scope.currentSocialEvent.$saveOrUpdate(hideSocialEventDialogAndRefreshSocialEvents, hideSocialEventDialogAndRefreshSocialEvents);
    }

    $scope.confirmDeleteSocialEventDetails = function () {
      $q.when(notify.progress('Deleting social event', true))
        .then(deleteMailchimpSegment, notify.error, notify.progress)
        .then(removeSocialEventHideSocialEventDialogAndRefreshSocialEvents, notify.error, notify.progress)
        .then(notify.clearBusy, notify.error, notify.progress)
        .catch(notify.error);
    };

    var deleteMailchimpSegment = function () {
      if ($scope.currentSocialEvent.mailchimp && $scope.currentSocialEvent.mailchimp.segmentId) {
        return MailchimpSegmentService.deleteSegment('socialEvents', $scope.currentSocialEvent.mailchimp.segmentId);
      }
    };

    var removeSocialEventHideSocialEventDialogAndRefreshSocialEvents = function () {
      $scope.currentSocialEvent.$remove(hideSocialEventDialogAndRefreshSocialEvents)
    };

    $scope.copyDetailsToNewSocialEvent = function () {
      var copiedSocialEvent = new SocialEventsService($scope.currentSocialEvent);
      delete copiedSocialEvent._id;
      delete copiedSocialEvent.mailchimp;
      DateUtils.convertDateFieldInObject(copiedSocialEvent, 'eventDate');
      showSocialEventDialog(copiedSocialEvent, 'Copy Existing');
      notify.success({
        title: 'Existing social event copied!',
        message: 'Make changes here and save to create a new social event.'
      });
    };

    $scope.selectMemberContactDetails = function () {
      var socialEvent = $scope.currentSocialEvent;
      var memberId = socialEvent.eventContactMemberId;
      if (memberId === null) {
        delete socialEvent.eventContactMemberId;
        delete socialEvent.displayName;
        delete socialEvent.contactPhone;
        delete socialEvent.contactEmail;
        // console.log('deleted contact details from', socialEvent);
      } else {
        var selectedMember = _.find($scope.members, function (member) {
          return member.$id() === memberId;
        });
        socialEvent.displayName = selectedMember.displayName;
        socialEvent.contactPhone = selectedMember.mobileNumber;
        socialEvent.contactEmail = selectedMember.email;
        // console.log('set contact details on', socialEvent);
      }
    };

    $scope.dataQueryParameters = {
      query: '',
      selectType: '1',
      newestFirst: 'false'
    };

    $scope.removeAttachment = function () {
      delete $scope.currentSocialEvent.attachment;
      delete $scope.currentSocialEvent.attachmentTitle;
      $scope.uploadedFile = undefined;
    };

    $scope.resetMailchimpData = function () {
      delete $scope.currentSocialEvent.mailchimp;
    };

    $scope.addOrReplaceAttachment = function () {
      $('#hidden-input').click();
    };

    $scope.attachmentTitle = function (socialEvent) {
      return socialEvent && socialEvent.attachment ? (socialEvent.attachment.title || socialEvent.attachmentTitle || 'Attachment: ' + socialEvent.attachment.originalFileName) : '';
    };

    $scope.attachmentUrl = function (socialEvent) {
      return socialEvent && socialEvent.attachment ? $scope.attachmentBaseUrl + '/' + socialEvent.attachment.awsFileName : '';
    };

    $scope.onFileSelect = function (file) {
      if (file) {
        $scope.uploadedFile = file;
        EKWGFileUpload.onFileSelect(file, notify, 'socialEvents').then(function (fileNameData) {
          $scope.currentSocialEvent.attachment = fileNameData;
        });
      }
    };

    function allowSummaryView() {
      return (LoggedInMemberService.allowSocialAdminEdits() || !LoggedInMemberService.allowSocialDetailView());
    }

    function applyAllowEdits(event) {
      $scope.allowDelete = false;
      $scope.allowConfirmDelete = false;
      $scope.allowDetailView = LoggedInMemberService.allowSocialDetailView();
      $scope.allowEdits = LoggedInMemberService.allowSocialAdminEdits();
      $scope.allowCopy = LoggedInMemberService.allowSocialAdminEdits();
      $scope.allowContentEdits = SiteEditService.active() && LoggedInMemberService.allowContentEdits();
      logger.info("SiteEditService.active()", SiteEditService.active());
      $scope.allowSummaryView = allowSummaryView();
    }

    $scope.showLoginTooltip = function () {
      return !LoggedInMemberService.memberLoggedIn();
    };

    $scope.login = function () {
      if (!LoggedInMemberService.memberLoggedIn()) {
        URLService.navigateTo("login");
      }
    };

    function showSocialEventDialog(socialEvent, socialEventEditMode) {
      $scope.uploadedFile = undefined;
      $scope.showAlert = false;
      $scope.allowConfirmDelete = false;
      if (!socialEvent.attendees) socialEvent.attendees = [];
      $scope.allowEdits = LoggedInMemberService.allowSocialAdminEdits();
      var existingRecordEditEnabled = $scope.allowEdits && s.startsWith(socialEventEditMode, 'Edit');
      $scope.allowCopy = existingRecordEditEnabled;
      $scope.allowDelete = existingRecordEditEnabled;
      $scope.socialEventEditMode = socialEventEditMode;
      $scope.currentSocialEvent = socialEvent;
      $('#social-event-dialog').modal('show');
    }

    $scope.attendeeCaption = function () {
      return $scope.currentSocialEvent && $scope.currentSocialEvent.attendees.length + ($scope.currentSocialEvent.attendees.length === 1 ? ' member is attending' : ' members are attending');
    };

    $scope.attendeeList = function () {
      return _($scope.display.attendees)
        .sortBy(function (attendee) {
          return attendee.text;
        }).map(function (attendee) {
          return attendee.text;
        }).join(', ');
    };

    function hideSocialEventDialogAndRefreshSocialEvents() {
      $('#social-event-dialog').modal('hide');
      refreshSocialEvents();
    }

    function refreshMembers() {
      if (LoggedInMemberService.memberLoggedIn()) {
        MemberService.allLimitedFields(MemberService.filterFor.SOCIAL_MEMBERS).then(function (members) {
          $scope.members = members;
          logger.debug('found', $scope.members.length, 'members');
          $scope.selectMembers = _($scope.members).map(function (member) {
            return {id: member.$id(), text: $filter('fullNameWithAlias')(member)};
          })
        });
      }
    }

    $scope.sendSocialEventNotification = function () {
      $('#social-event-dialog').modal('hide');
      ModalService.showModal({
        templateUrl: "partials/socialEvents/send-notification-dialog.html",
        controller: "SocialEventNotificationsController",
        preClose: function (modal) {
          logger.debug('preClose event with modal', modal);
          modal.element.modal('hide');
        },
        inputs: {
          socialEvent: $scope.currentSocialEvent
        }
      }).then(function (modal) {
        logger.debug('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.debug('close event with result', result);
        });
      })
    };

    function refreshSocialEvents() {
      if (URLService.hasRouteParameter('socialEventId')) {
        return SocialEventsService.getById($routeParams.socialEventId)
          .then(function (socialEvent) {
            if (!socialEvent) notify.error('Social event could not be found');
            $scope.socialEvents = [socialEvent];
          });
      } else {
        var socialEvents = LoggedInMemberService.allowSocialDetailView() ? SocialEventsService.all() : SocialEventsService.all({
          fields: {
            briefDescription: 1,
            eventDate: 1,
            thumbnail: 1
          }
        });
        socialEvents.then(function (socialEvents) {
          $scope.socialEvents = _.chain(socialEvents)
            .filter(function (socialEvent) {
              return socialEvent.eventDate >= $scope.todayValue
            })
            .sortBy(function (socialEvent) {
              return socialEvent.eventDate;
            })
            .value();
          logger.debug('found', $scope.socialEvents.length, 'social events');
        });
      }
    }

    $q.when(refreshSocialEvents())
      .then(refreshMembers)
      .then(refreshImages);

    function refreshImages() {
      ContentMetaDataService.getMetaData('imagesSocialEvents').then(function (contentMetaData) {
        $scope.interval = 5000;
        $scope.slides = contentMetaData.files;
        logger.debug('found', $scope.slides.length, 'slides');
      }, function (response) {
        throw new Error(response);
      });
    }

  });
