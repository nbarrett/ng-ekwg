angular.module('ekwgApp')
  .controller('WalkNotificationsController', function ($log, $scope, WalkNotificationService, RamblersWalksAndEventsService) {
    $scope.dataAuditDelta = WalkNotificationService.dataAuditDelta($scope.walk, $scope.status);
    $scope.validateWalk = RamblersWalksAndEventsService.validateWalk($scope.walk);
    RamblersWalksAndEventsService.walkBaseUrl().then(function (walkBaseUrl) {
      $scope.ramblersWalkBaseUrl = walkBaseUrl;
    });
  })
  .factory('WalkNotificationService', function ($sce, $log, $timeout, $filter, $location, $rootScope, $q, $compile, $templateRequest, $routeParams,
                                                $cookieStore, URLService, MemberService, MailchimpConfig, MailchimpSegmentService, WalksReferenceService,
                                                MemberAuditService, RamblersWalksAndEventsService, MailchimpCampaignService, LoggedInMemberService, DateUtils) {

    var logger = $log.getInstance('WalkNotificationService');
    var noLogger = $log.getInstance('WalkNotificationServiceNoLog');
    $log.logLevels['WalkNotificationService'] = $log.LEVEL.OFF;
    $log.logLevels['WalkNotificationServiceNoLog'] = $log.LEVEL.OFF;
    var basePartialsUrl = 'ekwg-legacy/partials/walks/notifications';
    var auditedFields = ['grade', 'walkDate', 'walkType', 'startTime', 'briefDescriptionAndStartPoint', 'longerDescription', 'distance', 'nearestTown', 'gridReference', 'meetupEventUrl', 'meetupEventTitle', 'osMapsRoute', 'osMapsTitle', 'postcode', 'walkLeaderMemberId', 'contactPhone', 'contactEmail', 'contactId', 'displayName', 'ramblersWalkId'];

    function currentDataValues(walk) {
      return _.compactObject(_.pick(walk, auditedFields));
    }

    function previousDataValues(walk) {
      var event = latestWalkEvent(walk);
      return event && event.data || {};
    }

    function latestWalkEvent(walk) {
      return (walk.events && _.last(walk.events)) || {};
    }

    function eventsLatestFirst(walk) {
      var events = walk.events && _(walk.events).clone().reverse() || [];
      noLogger.info('eventsLatestFirst:', events);
      return events;
    }

    function latestEventWithStatusChange(walk) {
      return _(eventsLatestFirst(walk)).find(function (event) {
        return (WalksReferenceService.toEventType(event.eventType) || {}).statusChange;
      }) || {};
    }

    function dataAuditDelta(walk, status) {
      if (!walk) return {};
      var currentData = currentDataValues(walk);
      var previousData = previousDataValues(walk);
      var changedItems = calculateChangedItems();
      var eventExists = latestEventWithStatusChangeIs(walk, status);
      var dataChanged = changedItems.length > 0;
      var dataAuditDelta = {
        currentData: currentData,
        previousData: previousData,
        changedItems: changedItems,
        eventExists: eventExists,
        dataChanged: dataChanged,
        notificationRequired: dataChanged || !eventExists,
        eventType: dataChanged && eventExists ? WalksReferenceService.eventTypes.walkDetailsUpdated.eventType : status
      };
      dataAuditDelta.dataChanged && noLogger.info('dataAuditDelta', dataAuditDelta);
      return dataAuditDelta;

      function calculateChangedItems() {
        return _.compact(_.map(auditedFields, function (key) {
          var currentValue = currentData[key];
          var previousValue = previousData[key];
          noLogger.info('auditing', key, 'now:', currentValue, 'previous:', previousValue);
          if (previousValue !== currentValue) return {
            fieldName: key,
            previousValue: previousValue,
            currentValue: currentValue
          }
        }));
      }

    }

    function latestEventWithStatusChangeIs(walk, eventType) {
      if (!walk) return false;
      return latestEventWithStatusChange(walk).eventType === toEventTypeValue(eventType);
    }

    function toEventTypeValue(eventType) {
      return _.has(eventType, 'eventType') ? eventType.eventType : eventType;
    }

    function latestEventForEventType(walk, eventType) {
      if (walk) {
        var eventTypeString = toEventTypeValue(eventType);
        return eventsLatestFirst(walk).find(function (event) {
          return event.eventType === eventTypeString;
        });
      }
    }

    function populateWalkApprovedEventsIfRequired(walks) {
      return _(walks).map(function (walk) {
        if (_.isArray(walk.events)) {
          return walk
        } else {
          var event = createEventIfRequired(walk, WalksReferenceService.eventTypes.approved.eventType, 'Marking past walk as approved');
          writeEventIfRequired(walk, event);
          walk.$saveOrUpdate();
          return walk;
        }
      })
    }

    function createEventIfRequired(walk, status, reason) {
      var dataAuditDeltaInfo = dataAuditDelta(walk, status);
      logger.debug('createEventIfRequired:', dataAuditDeltaInfo);
      if (dataAuditDeltaInfo.notificationRequired) {
        var event = {
          "date": DateUtils.nowAsValue(),
          "memberId": LoggedInMemberService.loggedInMember().memberId,
          "data": dataAuditDeltaInfo.currentData,
          "eventType": dataAuditDeltaInfo.eventType
        };
        if (reason) event.reason = reason;
        if (dataAuditDeltaInfo.dataChanged) event.description = 'Changed: ' + $filter('toAuditDeltaChangedItems')(dataAuditDeltaInfo.changedItems);
        logger.debug('createEventIfRequired: event created:', event);
        return event;
      } else {
        logger.debug('createEventIfRequired: event creation not necessary');
      }
    }

    function writeEventIfRequired(walk, event) {
      if (event) {
        logger.debug('writing event', event);
        if (!_.isArray(walk.events)) walk.events = [];
        walk.events.push(event);
      } else {
        logger.debug('no event to write');
      }
    }

    function createEventAndSendNotifications(members, walk, status, notify, sendNotification, reason) {

      notify.setBusy();

      var event = createEventIfRequired(walk, status, reason);
      var notificationScope = $rootScope.$new();
      notificationScope.walk = walk;
      notificationScope.members = members;
      notificationScope.event = event;
      notificationScope.status = status;
      var eventType = event && WalksReferenceService.toEventType(event.eventType);

      if (event && sendNotification) {
        return sendNotificationsToAllRoles()
          .then(function () {
            return writeEventIfRequired(walk, event);
          })
          .then(function () {
            return true;
          })
          .catch(function (error) {
            logger.debug('failed with error', error);
            return notify.error({title: error.message, message: error.error})
          });
      } else {
        logger.debug('Not sending notification');
        return $q.when(writeEventIfRequired(walk, event))
          .then(function () {
            return false;
          });
      }

      function renderTemplateContent(templateData) {

        var task = $q.defer();
        var templateFunction = $compile(templateData);
        var templateElement = templateFunction(notificationScope);
        $timeout(function () {
          notificationScope.$digest();
          task.resolve(templateElement.html());
        });
        return task.promise;
      }


      function sendNotificationsToAllRoles() {

        return LoggedInMemberService.getMemberForMemberId(walk.walkLeaderMemberId)
          .then(function (member) {
            logger.debug('sendNotification:', 'memberId', walk.walkLeaderMemberId, 'member', member);
            var walkLeaderName = $filter('fullNameWithAlias')(member);
            var walkDate = $filter('displayDate')(walk.walkDate);

            return $q.when(notify.progress('Preparing to send email notifications'))
              .then(sendLeaderNotifications, notify.error, notify.progress)
              .then(sendCoordinatorNotifications, notify.error, notify.progress);

            function sendLeaderNotifications() {
              if (eventType.notifyLeader) return sendNotificationsTo({
                templateUrl: templateForEvent('leader', eventType.eventType),
                memberIds: [walk.walkLeaderMemberId],
                segmentType: 'walkLeader',
                segmentName: MailchimpSegmentService.formatSegmentName('Walk leader notifications for ' + walkLeaderName),
                emailSubject: 'Your walk on ' + walkDate,
                destination: 'walk leader'
              });
              logger.debug('not sending leader notification');
            }

            function sendCoordinatorNotifications() {
              if (eventType.notifyCoordinator) {
                var memberIds = MemberService.allMemberIdsWithPrivilege('walkChangeNotifications', members);
                if (memberIds.length > 0) {
                  return sendNotificationsTo({
                    templateUrl: templateForEvent('coordinator', eventType.eventType),
                    memberIds: memberIds,
                    segmentType: 'walkCoordinator',
                    segmentName: MailchimpSegmentService.formatSegmentName('Walk co-ordinator notifications for ' + walkLeaderName),
                    emailSubject: walkLeaderName + "'s walk on " + walkDate,
                    destination: 'walk co-ordinators'
                  });
                } else {
                  logger.debug('not sending coordinator notifications as none are configured with walkChangeNotifications');
                }
              } else {
                logger.debug('not sending coordinator notifications as event type is', eventType.eventType);
              }
            }

            function templateForEvent(role, eventTypeString) {
              return basePartialsUrl + '/' + role + '/' + s.dasherize(eventTypeString) + '.html';
            }

            function sendNotificationsTo(templateAndNotificationMembers) {
              if (templateAndNotificationMembers.memberIds.length === 0) throw new Error('No members have been configured as ' + templateAndNotificationMembers.destination + ' therefore notifications cannot be sent');
              var memberFullNames = $filter('memberIdsToFullNames')(templateAndNotificationMembers.memberIds, members);
              logger.debug('sendNotificationsTo:', templateAndNotificationMembers);
              var campaignName = templateAndNotificationMembers.emailSubject + ' (' + eventType.description + ')';
              var segmentName = templateAndNotificationMembers.segmentName;

              return $templateRequest($sce.getTrustedResourceUrl(templateAndNotificationMembers.templateUrl))
                .then(renderTemplateContent, notify.error)
                .then(populateContentSections, notify.error)
                .then(sendNotification(templateAndNotificationMembers), notify.error);

              function populateContentSections(walkNotificationText) {
                logger.debug('populateContentSections -> walkNotificationText', walkNotificationText);
                return {
                  sections: {
                    notification_text: walkNotificationText
                  }
                };
              }

              function sendNotification(templateAndNotificationMembers) {
                return function (contentSections) {
                  return createOrSaveMailchimpSegment()
                    .then(saveSegmentDataToMember, notify.error, notify.progress)
                    .then(sendEmailCampaign, notify.error, notify.progress)
                    .then(notifyEmailSendComplete, notify.error, notify.success);

                  function createOrSaveMailchimpSegment() {
                    return MailchimpSegmentService.saveSegment('walks', {segmentId: MailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType)}, templateAndNotificationMembers.memberIds, segmentName, members);
                  }

                  function saveSegmentDataToMember(segmentResponse) {
                    MailchimpSegmentService.setMemberSegmentId(member, templateAndNotificationMembers.segmentType, segmentResponse.segment.id);
                    return LoggedInMemberService.saveMember(member);
                  }

                  function sendEmailCampaign() {
                    notify.progress('Sending ' + campaignName);
                    return MailchimpConfig.getConfig()
                      .then(function (config) {
                        var campaignId = config.mailchimp.campaigns.walkNotification.campaignId;
                        var segmentId = MailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType);
                        logger.debug('about to send campaign', campaignName, 'campaign Id', campaignId, 'segmentId', segmentId);
                        return MailchimpCampaignService.replicateAndSendWithOptions({
                          campaignId: campaignId,
                          campaignName: campaignName,
                          contentSections: contentSections,
                          segmentId: segmentId
                        });
                      })
                      .then(function () {
                        notify.progress('Sending of ' + campaignName + ' was successful', true);
                      });
                  }

                  function notifyEmailSendComplete() {
                    notify.success('Sending of ' + campaignName + ' was successful. Check your inbox for details.');
                    return true;
                  }
                }
              }
            }
          });
      }
    }

    return {
      dataAuditDelta: dataAuditDelta,
      eventsLatestFirst: eventsLatestFirst,
      createEventIfRequired: createEventIfRequired,
      populateWalkApprovedEventsIfRequired: populateWalkApprovedEventsIfRequired,
      writeEventIfRequired: writeEventIfRequired,
      latestEventWithStatusChangeIs: latestEventWithStatusChangeIs,
      latestEventWithStatusChange: latestEventWithStatusChange,
      createEventAndSendNotifications: createEventAndSendNotifications
    }
  });
