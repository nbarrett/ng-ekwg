angular.module('ekwgApp')
  .controller('SocialEventNotificationsController', function (MAILCHIMP_APP_CONSTANTS, $window, $log, $sce, $timeout, $templateRequest, $compile, $q, $rootScope, $scope, $filter, $routeParams,
                                                              $location, URLService, DateUtils, NumberUtils, LoggedInMemberService, MemberService,
                                                              ContentMetaDataService, CommitteeFileService, MailchimpSegmentService, MailchimpCampaignService,
                                                              MailchimpConfig, Notifier, CommitteeReferenceData, socialEvent, close) {
      var logger = $log.getInstance('SocialEventNotificationsController');
      $log.logLevels['SocialEventNotificationsController'] = $log.LEVEL.OFF;
      $scope.notify = {};
      var notify = Notifier($scope.notify);
      notify.setBusy();
      logger.debug('created with social event', socialEvent);
      $scope.attachmentBaseUrl = ContentMetaDataService.baseUrl('socialEvents');
      $scope.destinationType = '';
      $scope.members = [];
      $scope.selectableRecipients = [];
      $scope.committeeFiles = [];
      $scope.alertMessages = [];
      $scope.allowConfirmDelete = false;
      $scope.latestYearOpen = true;
      $scope.roles = {signoff: [], replyTo: []};
      $scope.showAlertMessage = function () {
        return ($scope.notify.alert.class === 'alert-danger') || $scope.userEdits.sendInProgress;
      };

      function initialiseNotification(socialEvent) {

        if (socialEvent) {
          $scope.socialEvent = socialEvent;
          onFirstNotificationOnly();
          forEveryNotification();
        } else {
          logger.error('no socialEvent - problem!');
        }

        function onFirstNotificationOnly() {
          if (!$scope.socialEvent.notification) {
            $scope.socialEvent.notification = {
              destinationType: 'all-ekwg-social',
              recipients: [],
              addresseeType: 'Hi *|FNAME|*,',
              items: {
                title: {include: true},
                notificationText: {include: true, value: ''},
                description: {include: true},
                attendees: {include: socialEvent.attendees.length > 0},
                attachment: {include: socialEvent.attachment},
                replyTo: {
                  include: $scope.socialEvent.displayName,
                  value: $scope.socialEvent.displayName ? 'organiser' : 'social'
                },
                signoffText: {
                  include: true,
                  value: 'If you have any questions about the above, please don\'t hesitate to contact me.\n\nBest regards,'
                }
              }
            };
            logger.debug('onFirstNotificationOnly - creating $scope.socialEvent.notification ->', $scope.socialEvent.notification);
          }
        }

        function forEveryNotification() {
          $scope.socialEvent.notification.items.signoffAs = {
            include: true,
            value: loggedOnRole().type || 'social'
          };
          logger.debug('forEveryNotification - $scope.socialEvent.notification.signoffAs ->', $scope.socialEvent.notification.signoffAs);
        }
      }

      function loggedOnRole() {
        var memberId = LoggedInMemberService.loggedInMember().memberId;
        var loggedOnRoleData = _(CommitteeReferenceData.committeeMembers()).find(function (role) {
          return role.memberId === memberId
        });
        logger.debug('loggedOnRole for', memberId, '->', loggedOnRoleData);
        return loggedOnRoleData || {};
      }

      function roleForType(type) {
        var role = _($scope.roles.replyTo).find(function (role) {
          return role.type === type;
        });
        logger.debug('roleForType for', type, '->', role);
        return role;
      }

      function initialiseRoles() {
        $scope.roles.signoff = CommitteeReferenceData.committeeMembers();
        $scope.roles.replyTo = _.clone($scope.roles.signoff);
        if ($scope.socialEvent.eventContactMemberId) {
          $scope.roles.replyTo.unshift({
            type: 'organiser',
            fullName: $scope.socialEvent.displayName,
            memberId: $scope.socialEvent.eventContactMemberId,
            description: 'Organiser (' + $scope.socialEvent.displayName + ')',
            email: $scope.socialEvent.contactEmail
          });
        }
        logger.debug('initialiseRoles -> $scope.roles ->', $scope.roles);
      }

      $scope.formattedText = function () {
        return $filter('lineFeedsToBreaks')($scope.socialEvent.notification.items.notificationText.value);
      };

      $scope.attachmentTitle = function (socialEvent) {
        return socialEvent && socialEvent.attachment ? (socialEvent.attachment.title || socialEvent.attachmentTitle || 'Attachment: ' + socialEvent.attachment.originalFileName) : '';
      };

      $scope.attachmentUrl = function (socialEvent) {
        return socialEvent && socialEvent.attachment ? URLService.baseUrl() + $scope.attachmentBaseUrl + '/' + socialEvent.attachment.awsFileName : '';
      };

      $scope.editAllSocialRecipients = function () {
        $scope.socialEvent.notification.destinationType = 'custom';
        $scope.socialEvent.notification.recipients = $scope.userEdits.socialList();
      };

      $scope.editAttendeeRecipients = function () {
        $scope.socialEvent.notification.destinationType = 'custom';
        $scope.socialEvent.notification.recipients = $scope.socialEvent.attendees;
      };

      $scope.clearRecipients = function () {
        $scope.socialEvent.notification.recipients = [];
      };

      $scope.formattedSignoffText = function () {
        return $filter('lineFeedsToBreaks')($scope.socialEvent.notification.items.signoffText.value);
      };

      $scope.attendeeList = function () {
        return _($scope.socialEvent.notification && $scope.socialEvent.attendees)
          .sortBy(function (attendee) {
            return attendee.text;
          }).map(function (attendee) {
            return attendee.text;
          }).join(', ');
      };

      $scope.memberGrouping = function (member) {
        return member.memberGrouping;
      };

      function toSelectMember(member) {
        var memberGrouping;
        var order;
        if (member.socialMember && member.mailchimpLists.socialEvents.subscribed) {
          memberGrouping = 'Subscribed to social emails';
          order = 0;
        } else if (member.socialMember && !member.mailchimpLists.socialEvents.subscribed) {
          memberGrouping = 'Not subscribed to social emails';
          order = 1;
        } else if (!member.socialMember) {
          memberGrouping = 'Not a social member';
          order = 2;
        } else {
          memberGrouping = 'Unexpected state';
          order = 3;
        }
        return {
          id: member.$id(),
          order: order,
          memberGrouping: memberGrouping,
          text: $filter('fullNameWithAlias')(member)
        };
      }

      function refreshMembers() {
        if (LoggedInMemberService.memberLoggedIn()) {
          MemberService.allLimitedFields(MemberService.filterFor.GROUP_MEMBERS).then(function (members) {
            $scope.members = members;
            logger.debug('refreshMembers -> populated ->', $scope.members.length, 'members');
            $scope.selectableRecipients = _.chain(members)
              .map(toSelectMember)
              .sortBy(function (member) {
                return member.order + member.text
              })
              .value();
            logger.debug('refreshMembers -> populated ->', $scope.selectableRecipients.length, 'selectableRecipients');
            notify.clearBusy();
          });
        }
      }


      $scope.userEdits = {
        sendInProgress: false,
        cancelFlow: false,
        socialList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED)
            .map(toSelectMember).value();
        },
        replyToRole: function () {
          return _($scope.roles.replyTo).find(function (role) {
            return role.type === $scope.socialEvent.notification.items.replyTo.value;
          });
        },
        notReady: function () {
          return $scope.members.length === 0 || $scope.userEdits.sendInProgress;
        }
      };

      $scope.cancelSendNotification = function () {
        close();
        $('#social-event-dialog').modal('show');
      };

      $scope.completeInMailchimp = function () {
        notify.warning({
          title: 'Complete in Mailchimp',
          message: 'You can close this dialog now as the message was presumably completed and sent in Mailchimp'
        });
        $scope.confirmSendNotification(true);
      };

      $scope.confirmSendNotification = function (dontSend) {
        notify.setBusy();
        var campaignName = $scope.socialEvent.briefDescription;
        logger.debug('sendSocialNotification:notification->', $scope.socialEvent.notification);
        notify.progress({title: campaignName, message: 'preparing and sending notification'});
        $scope.userEdits.sendInProgress = true;
        $scope.userEdits.cancelFlow = false;

        function getTemplate() {
          return $templateRequest($sce.getTrustedResourceUrl('partials/socialEvents/social-notification.html'))
        }

        return $q.when(createOrSaveMailchimpSegment())
          .then(getTemplate)
          .then(renderTemplateContent)
          .then(populateContentSections)
          .then(sendEmailCampaign)
          .then(saveSocialEvent)
          .then(notifyEmailSendComplete)
          .catch(handleError);

        function handleError(errorResponse) {
          $scope.userEdits.sendInProgress = false;
          notify.error({
            title: 'Your notification could not be sent',
            message: (errorResponse.message || errorResponse) + (errorResponse.error ? ('. Error was: ' + JSON.stringify(errorResponse.error)) : '')
          });
          notify.clearBusy();
        }

        function renderTemplateContent(templateData) {
          var task = $q.defer();
          var templateFunction = $compile(templateData);
          var templateElement = templateFunction($scope);
          $timeout(function () {
            $scope.$digest();
            task.resolve(templateElement.html());
          });
          return task.promise;
        }

        function populateContentSections(notificationText) {
          logger.debug('populateContentSections -> notificationText', notificationText);
          return {
            sections: {
              notification_text: notificationText
            }
          };
        }

        function writeSegmentResponseDataToEvent(segmentResponse) {
          $scope.socialEvent.mailchimp = {
            segmentId: segmentResponse.segment.id
          };

          if (segmentResponse.members) $scope.socialEvent.mailchimp.members = segmentResponse.members;

        }

        function createOrSaveMailchimpSegment() {
          var members = segmentMembers();
          if (members.length > 0) {
            return MailchimpSegmentService.saveSegment('socialEvents', $scope.socialEvent.mailchimp, members, MailchimpSegmentService.formatSegmentName($scope.socialEvent.briefDescription), $scope.members)
              .then(writeSegmentResponseDataToEvent)
              .catch(handleError);
          } else {
            logger.debug('not saving segment data as destination type is whole mailing list ->', $scope.socialEvent.notification.destinationType);
            return true;
          }
        }

        function segmentMembers() {
          switch ($scope.socialEvent.notification.destinationType) {
            case 'attendees':
              return $scope.socialEvent.attendees;
            case 'custom':
              return $scope.socialEvent.notification.recipients;
            default:
              return [];
          }
        }

        function sendEmailCampaign(contentSections) {
          var replyToRole = roleForType($scope.socialEvent.notification.items.replyTo.value || 'social');
          var otherOptions = ($scope.socialEvent.notification.items.replyTo.include && replyToRole.fullName && replyToRole.email) ? {
            from_name: replyToRole.fullName,
            from_email: replyToRole.email
          } : {};
          notify.progress(dontSend ? ('Preparing to complete ' + campaignName + ' in Mailchimp') : ('Sending ' + campaignName));
          logger.debug('Sending ' + campaignName, 'with otherOptions', otherOptions);
          return MailchimpConfig.getConfig()
            .then(function (config) {
              var campaignId = config.mailchimp.campaigns.socialEvents.campaignId;
              switch ($scope.socialEvent.notification.destinationType) {
                case 'all-ekwg-social':
                  logger.debug('about to replicateAndSendWithOptions to all-ekwg-social with campaignName', campaignName, 'campaign Id', campaignId);
                  return MailchimpCampaignService.replicateAndSendWithOptions({
                    campaignId: campaignId,
                    campaignName: campaignName,
                    contentSections: contentSections,
                    otherSegmentOptions: otherOptions,
                    dontSend: dontSend
                  }).then(openInMailchimpIf(dontSend));
                default:
                  if (!$scope.socialEvent.mailchimp) notify.warning('Cant send campaign due to previous request failing. This could be due to network problems - please try this again');
                  var segmentId = $scope.socialEvent.mailchimp.segmentId;
                  logger.debug('about to replicateAndSendWithOptions to social with campaignName', campaignName, 'campaign Id', campaignId, 'segmentId', segmentId);
                  return MailchimpCampaignService.replicateAndSendWithOptions({
                    campaignId: campaignId,
                    campaignName: campaignName,
                    contentSections: contentSections,
                    segmentId: segmentId,
                    otherSegmentOptions: otherOptions,
                    dontSend: dontSend
                  }).then(openInMailchimpIf(dontSend));
              }
            })
        }

        function openInMailchimpIf(dontSend) {
          return function (replicateCampaignResponse) {
            logger.debug('openInMailchimpIf:replicateCampaignResponse', replicateCampaignResponse, 'dontSend', dontSend);
            if (dontSend) {
              return $window.open(MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns/wizard/neapolitan?id=" + replicateCampaignResponse.web_id, '_blank');
            } else {
              return true;
            }
          }
        }

        function saveSocialEvent() {
          return $scope.socialEvent.$saveOrUpdate();
        }

        function notifyEmailSendComplete() {
          notify.success('Sending of ' + campaignName + ' was successful.', false);
          $scope.userEdits.sendInProgress = false;
          if (!$scope.userEdits.cancelFlow) {
            close();
          }
          notify.clearBusy();
        }
      };

      refreshMembers();
      initialiseNotification(socialEvent);
      initialiseRoles(CommitteeReferenceData);
    }
  );
