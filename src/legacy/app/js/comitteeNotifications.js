angular.module('ekwgApp')
  .controller('CommitteeNotificationsController', function ($window, $log, $sce, $timeout, $templateRequest, $compile, $q, $rootScope, $scope, $filter, $routeParams,
                                                            $location, URLService, DateUtils, NumberUtils, LoggedInMemberService, MemberService,
                                                            ContentMetaDataService, CommitteeFileService, MailchimpSegmentService, MailchimpCampaignService,
                                                            MAILCHIMP_APP_CONSTANTS, MailchimpConfig, Notifier, CommitteeReferenceData, CommitteeQueryService, committeeFile, close) {

      var logger = $log.getInstance('CommitteeNotificationsController');
      $log.logLevels['CommitteeNotificationsController'] = $log.LEVEL.OFF;
      $scope.notify = {};
      var notify = Notifier($scope.notify);
      notify.setBusy();

      $scope.members = [];
      $scope.committeeFile = committeeFile;
      $scope.roles = {signoff: CommitteeReferenceData.contactUsRolesAsArray(), replyTo: []};
      $scope.committeeFileBaseUrl = ContentMetaDataService.baseUrl('committeeFiles');

      function loggedOnRole() {
        var memberId = LoggedInMemberService.loggedInMember().memberId;
        var loggedOnRoleData = _(CommitteeReferenceData.contactUsRolesAsArray()).find(function (role) {
          return role.memberId === memberId
        });
        logger.debug('loggedOnRole for', memberId, '->', loggedOnRoleData);
        return loggedOnRoleData || {};
      }

      $scope.fromDateCalendar = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.fromDateCalendar.opened = true;
        }
      };

      $scope.toDateCalendar = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.toDateCalendar.opened = true;
        }
      };

      $scope.populateGroupEvents = function () {
        notify.setBusy();
        populateGroupEvents().then(function () {
          notify.clearBusy();
          return true;
        })
      };

      function populateGroupEvents() {
        return CommitteeQueryService.groupEvents($scope.userEdits.groupEvents)
          .then(function (events) {
            $scope.userEdits.groupEvents.events = events;
            logger.debug('groupEvents', events);
            return events;
          });
      }

      $scope.changeGroupEventSelection = function (groupEvent) {
        groupEvent.selected = !groupEvent.selected;
      };

      $scope.notification = {
        editable: {
          text: '',
          signoffText: 'If you have any questions about the above, please don\'t hesitate to contact me.\n\nBest regards,',
        },
        destinationType: 'committee',
        includeSignoffText: true,
        addresseeType: 'Hi *|FNAME|*,',
        addingNewFile: false,
        recipients: [],
        groupEvents: function () {
          return _.filter($scope.userEdits.groupEvents.events, function (groupEvent) {
            logger.debug('notification.groupEvents ->', groupEvent);
            return groupEvent.selected;
          });
        },
        signoffAs: {
          include: true,
          value: loggedOnRole().type || 'secretary'
        },
        includeDownloadInformation: $scope.committeeFile,
        title: 'Committee Notification',
        text: function () {
          return $filter('lineFeedsToBreaks')($scope.notification.editable.text);
        },
        signoffText: function () {
          return $filter('lineFeedsToBreaks')($scope.notification.editable.signoffText);
        }
      };

      if ($scope.committeeFile) {
        $scope.notification.title = $scope.committeeFile.fileType;
        $scope.notification.editable.text = 'This is just a quick note to let you know in case you are interested, that I\'ve uploaded a new file to the EKWG website. The file information is as follows:';
      }

      logger.debug('initialised on open: committeeFile', $scope.committeeFile, ', roles', $scope.roles);
      logger.debug('initialised on open: notification ->', $scope.notification);

      $scope.userEdits = {
        sendInProgress: false,
        cancelled: false,
        groupEvents: {
          events: [],
          fromDate: DateUtils.momentNowNoTime().valueOf(),
          toDate: DateUtils.momentNowNoTime().add(2, 'weeks').valueOf(),
          includeContact: true,
          includeDescription: true,
          includeLocation: true,
          includeWalks: true,
          includeSocialEvents: true,
          includeCommitteeEvents: true
        },
        allGeneralSubscribedList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.GENERAL_MEMBERS_SUBSCRIBED)
            .map(toSelectGeneralMember).value();
        },
        allWalksSubscribedList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.WALKS_MEMBERS_SUBSCRIBED)
            .map(toSelectWalksMember).value();
        },
        allSocialSubscribedList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED)
            .map(toSelectSocialMember).value();
        },
        allCommitteeList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.COMMITTEE_MEMBERS)
            .map(toSelectGeneralMember).value();
        },
        replyToRole: function () {
          return _($scope.roles.replyTo).find(function (role) {
            return role.type === $scope.socialEvent.notification.items.replyTo.value;
          });
        },
        notReady: function () {
          return $scope.members.length === 0 || $scope.userEdits.sendInProgress || ($scope.notification.recipients.length === 0 && $scope.notification.destinationType === 'custom');
        }
      };

      function toSelectGeneralMember(member) {
        var memberGrouping;
        var order;
        if (member.groupMember && member.mailchimpLists.general.subscribed) {
          memberGrouping = 'Subscribed to general emails';
          order = 0;
        } else if (member.groupMember && !member.mailchimpLists.general.subscribed) {
          memberGrouping = 'Not subscribed to general emails';
          order = 1;
        } else if (!member.groupMember) {
          memberGrouping = 'Not a group member';
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

      function toSelectWalksMember(member) {
        var memberGrouping;
        var order;
        if (member.groupMember && member.mailchimpLists.walks.subscribed) {
          memberGrouping = 'Subscribed to walks emails';
          order = 0;
        } else if (member.groupMember && !member.mailchimpLists.walks.subscribed) {
          memberGrouping = 'Not subscribed to walks emails';
          order = 1;
        } else if (!member.groupMember) {
          memberGrouping = 'Not a group member';
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

      function toSelectSocialMember(member) {
        var memberGrouping;
        var order;
        if (member.groupMember && member.mailchimpLists.socialEvents.subscribed) {
          memberGrouping = 'Subscribed to social emails';
          order = 0;
        } else if (member.groupMember && !member.mailchimpLists.socialEvents.subscribed) {
          memberGrouping = 'Not subscribed to social emails';
          order = 1;
        } else if (!member.groupMember) {
          memberGrouping = 'Not a group member';
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

      $scope.editAllEKWGRecipients = function () {
        $scope.notification.destinationType = 'custom';
        $scope.notification.campaignId = campaignIdFor('general');
        $scope.notification.list = 'general';
        $scope.notification.recipients = $scope.userEdits.allGeneralSubscribedList();
        $scope.campaignIdChanged();
      };

      $scope.editAllWalksRecipients = function () {
        $scope.notification.destinationType = 'custom';
        $scope.notification.campaignId = campaignIdFor('walks');
        $scope.notification.list = 'walks';
        $scope.notification.recipients = $scope.userEdits.allWalksSubscribedList();
        $scope.campaignIdChanged();
      };

      $scope.editAllSocialRecipients = function () {
        $scope.notification.destinationType = 'custom';
        $scope.notification.campaignId = campaignIdFor('socialEvents');
        $scope.notification.list = 'socialEvents';
        $scope.notification.recipients = $scope.userEdits.allSocialSubscribedList();
        $scope.campaignIdChanged();
      };

      $scope.editCommitteeRecipients = function () {
        $scope.notification.destinationType = 'custom';
        $scope.notification.campaignId = campaignIdFor('committee');
        $scope.notification.list = 'general';
        $scope.notification.recipients = $scope.userEdits.allCommitteeList();
        $scope.campaignIdChanged();
      };

      $scope.clearRecipientsForCampaignOfType = function (campaignType) {
        $scope.notification.customCampaignType = campaignType;
        $scope.notification.campaignId = campaignIdFor(campaignType);
        $scope.notification.list = 'general';
        $scope.notification.recipients = [];
        $scope.campaignIdChanged();
      };

      $scope.fileUrl = function () {
        return $scope.committeeFile && $scope.committeeFile.fileNameData ? URLService.baseUrl() + $scope.committeeFileBaseUrl + '/' + $scope.committeeFile.fileNameData.awsFileName : '';
      };

      $scope.fileTitle = function () {
        return $scope.committeeFile ? DateUtils.asString($scope.committeeFile.eventDate, undefined, DateUtils.formats.displayDateTh) + ' - ' + $scope.committeeFile.fileNameData.title : '';
      };

      function campaignIdFor(campaignType) {
        switch (campaignType) {
          case 'committee':
            return $scope.config.mailchimp.campaigns.committee.campaignId;
          case 'general':
            return $scope.config.mailchimp.campaigns.newsletter.campaignId;
          case 'socialEvents':
            return $scope.config.mailchimp.campaigns.socialEvents.campaignId;
          case 'walks':
            return $scope.config.mailchimp.campaigns.walkNotification.campaignId;
          default:
            return $scope.config.mailchimp.campaigns.committee.campaignId;
        }
      }

      function campaignInfoForCampaign(campaignId) {
        return _.chain($scope.config.mailchimp.campaigns)
          .map(function (data, campaignType) {
            var campaignData = _.extend({campaignType: campaignType}, data);
            logger.debug('campaignData for', campaignType, '->', campaignData);
            return campaignData;
          }).find({campaignId: campaignId})
          .value();
      }

      $scope.campaignIdChanged = function () {
        var infoForCampaign = campaignInfoForCampaign($scope.notification.campaignId);
        logger.debug('for campaignId', $scope.notification.campaignId, 'infoForCampaign', infoForCampaign);
        if (infoForCampaign) {
          $scope.notification.title = infoForCampaign.name;
        }
      };

      $scope.confirmSendNotification = function (dontSend) {
        $scope.userEdits.sendInProgress = true;
        var campaignName = $scope.notification.title;
        notify.setBusy();
        return $q.when(templateFor('partials/committee/committee-notification.html'))
          .then(renderTemplateContent)
          .then(populateContentSections)
          .then(sendEmailCampaign)
          .then(notifyEmailSendComplete)
          .catch(handleNotificationError);

        function templateFor(template) {
          return $templateRequest($sce.getTrustedResourceUrl(template))
        }

        function handleNotificationError(errorResponse) {
          $scope.userEdits.sendInProgress = false;
          notify.clearBusy();
          notify.error({
            title: 'Your notification could not be sent',
            message: (errorResponse.message || errorResponse) + (errorResponse.error ? ('. Error was: ' + JSON.stringify(errorResponse.error)) : '')
          });
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

        function sendEmailCampaign(contentSections) {
          notify.progress(dontSend ? ('Preparing to complete ' + campaignName + ' in Mailchimp') : ('Sending ' + campaignName));
          return MailchimpConfig.getConfig()
            .then(function (config) {
              var replyToRole = $scope.notification.signoffAs.value || 'secretary';
              logger.debug('replyToRole', replyToRole);

              var members;
              var list = $scope.notification.list;
              var otherOptions = {
                from_name: CommitteeReferenceData.contactUsField(replyToRole, 'fullName'),
                from_email: CommitteeReferenceData.contactUsField(replyToRole, 'email'),
                list_id: config.mailchimp.lists[list]
              };
              logger.debug('Sending ' + campaignName, 'with otherOptions', otherOptions);
              var segmentId = config.mailchimp.segments[list].committeeSegmentId;
              var campaignId = $scope.notification.campaignId;
              switch ($scope.notification.destinationType) {
                case 'custom':
                  members = $scope.notification.recipients;
                  break;
                case 'committee':
                  members = $scope.userEdits.allCommitteeList();
                  break;
                default:
                  members = [];
                  break;
              }

              logger.debug('sendCommitteeNotification:notification->', $scope.notification);

              if (members.length === 0) {
                logger.debug('about to replicateAndSendWithOptions to', list, 'list with campaignName', campaignName, 'campaign Id', campaignId, 'dontSend', dontSend);
                return MailchimpCampaignService.replicateAndSendWithOptions({
                  campaignId: campaignId,
                  campaignName: campaignName,
                  contentSections: contentSections,
                  otherSegmentOptions: otherOptions,
                  dontSend: dontSend
                }).then(openInMailchimpIf(dontSend));
              } else {
                var segmentName = MailchimpSegmentService.formatSegmentName('Committee Notification Recipients');
                return MailchimpSegmentService.saveSegment(list, {segmentId: segmentId}, members, segmentName, $scope.members)
                  .then(function (segmentResponse) {
                    logger.debug('segmentResponse following save segment of segmentName:', segmentName, '->', segmentResponse);
                    logger.debug('about to replicateAndSendWithOptions to committee with campaignName', campaignName, 'campaign Id', campaignId, 'segmentId', segmentResponse.segment.id);
                    return MailchimpCampaignService.replicateAndSendWithOptions({
                      campaignId: campaignId,
                      campaignName: campaignName,
                      contentSections: contentSections,
                      segmentId: segmentResponse.segment.id,
                      otherSegmentOptions: otherOptions,
                      dontSend: dontSend
                    }).then(openInMailchimpIf(dontSend));
                  });
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

        function notifyEmailSendComplete() {
          if (!$scope.userEdits.cancelled) {
            notify.success('Sending of ' + campaignName + ' was successful.', false);
            $scope.userEdits.sendInProgress = false;
            $scope.cancelSendNotification();
          }
          notify.clearBusy();
        }

      };

      $scope.completeInMailchimp = function () {
        notify.warning({
          title: 'Complete in Mailchimp',
          message: 'You can close this dialog now as the message was presumably completed and sent in Mailchimp'
        });
        $scope.confirmSendNotification(true);
      };

      $scope.cancelSendNotification = function () {
        if ($scope.userEdits.sendInProgress) {
          $scope.userEdits.sendInProgress = false;
          $scope.userEdits.cancelled = true;
          notify.error({
            title: 'Cancelling during send',
            message: "Because notification sending was already in progress when you cancelled, campaign may have already been sent - check in Mailchimp if in doubt."
          });
        } else {
          logger.debug('calling cancelSendNotification');
          close();
        }
      };

      var promises = [
        MemberService.allLimitedFields(MemberService.filterFor.GROUP_MEMBERS).then(function (members) {
          $scope.members = members;
          logger.debug('refreshMembers -> populated ->', $scope.members.length, 'members');
          $scope.selectableRecipients = _.chain(members)
            .map(toSelectGeneralMember)
            .sortBy(function (member) {
              return member.order + member.text
            })
            .value();
          logger.debug('refreshMembers -> populated ->', $scope.selectableRecipients.length, 'selectableRecipients');
        }),
        MailchimpConfig.getConfig()
          .then(function (config) {
            $scope.config = config;
            logger.debug('retrieved config', $scope.config);
            $scope.clearRecipientsForCampaignOfType('committee');
          }),
        MailchimpCampaignService.list({
          limit: 1000,
          concise: true,
          status: 'save',
          title: 'Master'
        }).then(function (response) {
          $scope.campaigns = response.data;
          logger.debug('response.data', response.data);
        })];
      if (!$scope.committeeFile) promises.push(populateGroupEvents());

      $q.all(promises).then(function () {
        logger.debug('performed total of', promises.length);
        notify.clearBusy();
      });

    }
  );
