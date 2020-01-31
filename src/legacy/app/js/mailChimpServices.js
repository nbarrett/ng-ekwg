angular.module('ekwgApp')
  .factory('MailchimpConfig', function (Config) {

    function getConfig() {
      return Config.getConfig('mailchimp', {
        mailchimp: {
          interestGroups: {
            walks: {interestGroupingId: undefined},
            socialEvents: {interestGroupingId: undefined},
            general: {interestGroupingId: undefined}
          },
          segments: {
            walks: {segmentId: undefined},
            socialEvents: {segmentId: undefined},
            general: {
              passwordResetSegmentId: undefined,
              forgottenPasswordSegmentId: undefined,
              committeeSegmentId: undefined
            }
          }
        }
      })
    }

    function saveConfig(config, key, saveCallback, errorSaveCallback) {
      return Config.saveConfig('mailchimp', config, key, saveCallback, errorSaveCallback);
    }

    return {
      getConfig: getConfig,
      saveConfig: saveConfig
    }

  })
  .factory('MailchimpHttpService', function ($log, $q, $http, MailchimpErrorParserService) {

    var logger = $log.getInstance('MailchimpHttpService');
    $log.logLevels['MailchimpHttpService'] = $log.LEVEL.OFF;

    function call(serviceCallType, method, url, data, params) {
      var deferredTask = $q.defer();
      deferredTask.notify(serviceCallType);
      logger.debug(serviceCallType);
      $http({
        method: method,
        data: data,
        params: params,
        url: url
      }).then(function (response) {
        var responseData = response.data;
        var errorObject = MailchimpErrorParserService.extractError(responseData);
        if (errorObject.error) {
          var errorResponse = {message: serviceCallType + ' was not successful', error: errorObject.error};
          logger.debug(errorResponse);
          deferredTask.reject(errorResponse);
        } else {
          logger.debug('success', responseData);
          deferredTask.resolve(responseData);
          return responseData;
        }
      }).catch(function (response) {
        var responseData = response.data;
        var errorObject = MailchimpErrorParserService.extractError(responseData);
        var errorResponse = {message: serviceCallType + ' was not successful', error: errorObject.error};
        logger.debug(errorResponse);
        deferredTask.reject(errorResponse);
      });
      return deferredTask.promise;
    }

    return {
      call: call
    }

  })
  .factory('MailchimpLinkService', function ($log, MAILCHIMP_APP_CONSTANTS) {

    var logger = $log.getInstance('MailchimpLinkService');
    $log.logLevels['MailchimpLinkService'] = $log.LEVEL.OFF;

    function campaignPreview(webId) {
      return MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns/preview-content-html?id=" + webId;
    }

    function campaignEdit(webId) {
      return MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns/preview-content-html?id=" + webId;
    }

    return {
      campaignPreview: campaignPreview
    }

  })
  .factory('MailchimpGroupService', function ($log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService) {

    var logger = $log.getInstance('MailchimpGroupService');
    $log.logLevels['MailchimpGroupService'] = $log.LEVEL.OFF;

    var addInterestGroup = function (listType, interestGroupName, interestGroupingId) {
      return MailchimpHttpService.call('Adding Mailchimp Interest Group for ' + listType, 'POST', 'api/mailchimp/lists/' + listType + '/interestGroupAdd', {
        interestGroupingId: interestGroupingId,
        interestGroupName: interestGroupName
      });
    };

    var deleteInterestGroup = function (listType, interestGroupName, interestGroupingId) {
      return MailchimpHttpService.call('Deleting Mailchimp Interest Group for ' + listType, 'DELETE', 'api/mailchimp/lists/' + listType + '/interestGroupDel', {
        interestGroupingId: interestGroupingId,
        interestGroupName: interestGroupName
      });
    };

    var addInterestGrouping = function (listType, interestGroupingName, groups) {
      return MailchimpHttpService.call('Adding Mailchimp Interest Grouping for ' + listType, 'POST', 'api/mailchimp/lists/' + listType + '/interestGroupingAdd', {
        groups: groups,
        interestGroupingName: interestGroupingName
      });
    };

    var deleteInterestGrouping = function (listType, interestGroupingId) {
      return MailchimpHttpService.call('Deleting Mailchimp Interest Grouping for ' + listType, 'DELETE', 'api/mailchimp/lists/' + listType + '/interestGroupingDel', {interestGroupingId: interestGroupingId});
    };

    var listInterestGroupings = function (listType) {
      return MailchimpHttpService.call('Listing Mailchimp Interest Groupings for ' + listType, 'GET', 'api/mailchimp/lists/' + listType + '/interestGroupings');
    };

    var updateInterestGrouping = function (listType, interestGroupingId, interestGroupingName, interestGroupingValue) {
      return MailchimpHttpService.call('Updating Mailchimp Interest Groupings for ' + listType, 'PUT', 'api/mailchimp/lists/' + listType + '/interestGroupingUpdate',
        {
          interestGroupingId: interestGroupingId,
          interestGroupingName: interestGroupingName,
          interestGroupingValue: interestGroupingValue
        });
    };

    var updateInterestGroup = function (listType, oldName, newName) {
      return function (config) {
        var interestGroupingId = config.mailchimp.interestGroups[listType].interestGroupingId;
        return MailchimpHttpService.call('Updating Mailchimp Interest Group for ' + listType, 'PUT', 'api/mailchimp/lists/' + listType + '/interestGroupUpdate',
          {
            interestGroupingId: interestGroupingId,
            oldName: oldName,
            newName: newName
          })
          .then(returnInterestGroupingId(interestGroupingId));
      }
    };

    var saveInterestGroup = function (listType, oldName, newName) {
      oldName = oldName.substring(0, 60);
      newName = newName.substring(0, 60);
      return MailchimpConfig.getConfig()
        .then(updateInterestGroup(listType, oldName, newName))
        .then(findInterestGroup(listType, newName));
    };

    var createInterestGroup = function (listType, interestGroupName) {
      return MailchimpConfig.getConfig()
        .then(createOrUpdateInterestGroup(listType, interestGroupName))
        .then(findInterestGroup(listType, interestGroupName));
    };

    var createOrUpdateInterestGroup = function (listType, interestGroupName) {
      return function (config) {
        logger.debug('createOrUpdateInterestGroup using config', config);
        var interestGroupingName = s.titleize(s.humanize(listType));
        var interestGroupingId = config.mailchimp.interestGroups[listType].interestGroupingId;
        if (interestGroupingId) {
          return addInterestGroup(listType, interestGroupName, interestGroupingId)
            .then(returnInterestGroupingId(interestGroupingId));
        } else {
          return addInterestGrouping(listType, interestGroupingName + ' Interest Groups', [interestGroupName])
            .then(saveInterestGroupConfigAndReturnInterestGroupingId(listType, config));
        }
      }
    };

    var returnInterestGroupingId = function (interestGroupingId) {
      return function (response) {
        logger.debug('received', response, 'returning', interestGroupingId);
        return interestGroupingId;
      }
    };

    var saveInterestGroupConfigAndReturnInterestGroupingId = function (listType, config) {
      return function (response) {
        config.mailchimp.interestGroups[listType].interestGroupingId = response.id;
        logger.debug('saving config', config);
        return MailchimpConfig.saveConfig(config, function () {
          logger.debug('config save was successful');
          return response.id;
        }, function (error) {
          throw Error('config save was not successful. ' + error)
        });
      }
    };

    var findInterestGroup = function (listType, interestGroupName) {
      return function (interestGroupingId) {
        logger.debug('finding findInterestGroup ', interestGroupingId);
        return listInterestGroupings(listType)
          .then(filterInterestGroupings(interestGroupingId, interestGroupName));
      }
    };


    var filterInterestGroupings = function (interestGroupingId, interestGroupName) {
      return function (interestGroupings) {
        logger.debug('filterInterestGroupings: interestGroupings passed in ', interestGroupings, 'for interestGroupingId', interestGroupingId);

        var interestGrouping = _.find(interestGroupings, function (interestGrouping) {
          return interestGrouping.id === interestGroupingId;
        });

        logger.debug('filterInterestGroupings: interestGrouping returned ', interestGrouping);

        var interestGroup = _.find(interestGrouping.groups, function (group) {
          return group.name === interestGroupName;
        });

        logger.debug('filterInterestGroupings: interestGroup returned', interestGroup);
        return interestGroup;
      }
    };

    return {
      createInterestGroup: createInterestGroup,
      saveInterestGroup: saveInterestGroup
    }
  })
  .factory('MailchimpSegmentService', function ($log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService, EmailSubscriptionService, MemberService, StringUtils) {

    var logger = $log.getInstance('MailchimpSegmentService');
    $log.logLevels['MailchimpSegmentService'] = $log.LEVEL.OFF;

    function addSegment(listType, segmentName) {
      return MailchimpHttpService.call('Adding Mailchimp segment for ' + listType, 'POST', 'api/mailchimp/lists/' + listType + '/segmentAdd', {segmentName: segmentName});
    }

    function resetSegment(listType, segmentId) {
      return MailchimpHttpService.call('Resetting Mailchimp segment for ' + listType, 'PUT', 'api/mailchimp/lists/' + listType + '/segmentReset', {segmentId: segmentId});
    }

    function deleteSegment(listType, segmentId) {
      return MailchimpHttpService.call('Deleting Mailchimp segment for ' + listType, 'DELETE', 'api/mailchimp/lists/' + listType + '/segmentDel/' + segmentId);
    }

    function callRenameSegment(listType, segmentId, segmentName) {
      return function () {
        return renameSegment(listType, segmentId, segmentName);
      }
    }

    function renameSegment(listType, segmentId, segmentNameInput) {
      var segmentName = StringUtils.stripLineBreaks(StringUtils.left(segmentNameInput, 99), true);
      logger.debug('renaming segment with name=\'' + segmentName + '\' length=' + segmentName.length);
      return MailchimpHttpService.call('Renaming Mailchimp segment for ' + listType, 'POST', 'api/mailchimp/lists/' + listType + '/segmentRename', {
        segmentId: segmentId,
        segmentName: segmentName
      });
    }

    function callAddSegmentMembers(listType, segmentId, segmentMembers) {
      return function () {
        return addSegmentMembers(listType, segmentId, segmentMembers);
      }
    }

    function addSegmentMembers(listType, segmentId, segmentMembers) {
      return MailchimpHttpService.call('Adding Mailchimp segment members ' + JSON.stringify(segmentMembers) + ' for ' + listType, 'POST', 'api/mailchimp/lists/' + listType + '/segmentMembersAdd', {
        segmentId: segmentId,
        segmentMembers: segmentMembers
      });
    }

    function callDeleteSegmentMembers(listType, segmentId, segmentMembers) {
      return function () {
        return deleteSegmentMembers(listType, segmentId, segmentMembers);
      }
    }

    function deleteSegmentMembers(listType, segmentId, segmentMembers) {
      return MailchimpHttpService.call('Deleting Mailchimp segment members ' + segmentMembers + ' for ' + listType, 'DELETE', 'api/mailchimp/lists/' + listType + '/segmentMembersDel', {
        segmentId: segmentId,
        segmentMembers: segmentMembers
      });
    }

    function listSegments(listType) {
      return MailchimpHttpService.call('Listing Mailchimp segments for ' + listType, 'GET', 'api/mailchimp/lists/' + listType + '/segments');
    }


    function buildSegmentMemberData(listType, memberIds, members) {
      var segmentMembers = _.chain(memberIds)
        .map(function (memberId) {
          return MemberService.toMember(memberId, members)
        })
        .filter(function (member) {
          return member && member.email;
        })
        .map(function (member) {
          return EmailSubscriptionService.addMailchimpIdentifiersToRequest(member, listType);
        })
        .value();
      if (!segmentMembers || segmentMembers.length === 0) throw new Error('No members were added to the ' + listType + ' email segment from the ' + memberIds.length + ' supplied members. Please check that they have a valid email address and are subscribed to ' + listType);

      return segmentMembers;
    }

    function saveSegment(listType, mailchimpConfig, memberIds, segmentName, members) {
      var segmentMembers = buildSegmentMemberData(listType, memberIds, members);
      logger.debug('saveSegment:buildSegmentMemberData:', listType, memberIds, segmentMembers);
      if (mailchimpConfig && mailchimpConfig.segmentId) {
        var segmentId = mailchimpConfig.segmentId;
        logger.debug('saveSegment:segmentId', mailchimpConfig);
        return resetSegment(listType, segmentId)
          .then(callRenameSegment(listType, segmentId, segmentName))
          .then(addSegmentMembersDuringUpdate(listType, segmentId, segmentMembers))
          .then(returnAddSegmentResponse({id: segmentId}));
      } else {
        return addSegment(listType, segmentName)
          .then(addSegmentMembersDuringAdd(listType, segmentMembers))
      }
    }

    function returnAddSegmentResponse(addSegmentResponse) {
      return function (addSegmentMembersResponse) {
        return {members: addSegmentMembersResponse.members, segment: addSegmentResponse};
      };
    }

    function returnAddSegmentAndMemberResponse(addSegmentResponse) {
      return function (addMemberResponse) {
        return ({segment: addSegmentResponse, members: addMemberResponse});
      };
    }

    function addSegmentMembersDuringUpdate(listType, segmentId, segmentMembers) {
      return function (renameSegmentResponse) {
        if (segmentMembers.length > 0) {
          return addSegmentMembers(listType, segmentId, segmentMembers)
            .then(returnAddSegmentAndMemberResponse(renameSegmentResponse));
        } else {
          return {segment: renameSegmentResponse.id, members: {}};
        }
      }
    }

    function addSegmentMembersDuringAdd(listType, segmentMembers) {
      return function (addSegmentResponse) {
        if (segmentMembers.length > 0) {
          return addSegmentMembers(listType, addSegmentResponse.id, segmentMembers)
            .then(returnAddSegmentAndMemberResponse(addSegmentResponse));
        } else {
          return {segment: addSegmentResponse, members: {}};
        }
      }
    }

    function getMemberSegmentId(member, segmentType) {
      if (member.mailchimpSegmentIds) return member.mailchimpSegmentIds[segmentType];
    }

    function setMemberSegmentId(member, segmentType, segmentId) {
      if (!member.mailchimpSegmentIds) member.mailchimpSegmentIds = {};
      member.mailchimpSegmentIds[segmentType] = segmentId;
    }

    function formatSegmentName(prefix) {
      var date = ' (' + DateUtils.nowAsValue() + ')';
      var segmentName = prefix.substring(0, 99 - date.length) + date;
      logger.debug('segmentName', segmentName, 'length', segmentName.length);
      return segmentName;
    }

    return {
      formatSegmentName: formatSegmentName,
      saveSegment: saveSegment,
      deleteSegment: deleteSegment,
      getMemberSegmentId: getMemberSegmentId,
      setMemberSegmentId: setMemberSegmentId
    }

  })
  .factory('MailchimpListService', function ($log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService, EmailSubscriptionService, MemberService) {

    var logger = $log.getInstance('MailchimpListService');
    $log.logLevels['MailchimpListService'] = $log.LEVEL.OFF;

    var listSubscribers = function (listType) {
      return MailchimpHttpService.call('Listing Mailchimp subscribers for ' + listType, 'GET', 'api/mailchimp/lists/' + listType);
    };

    var batchUnsubscribe = function (listType, subscribers) {
      return MailchimpHttpService.call('Batch unsubscribing members from Mailchimp List for ' + listType, 'POST', 'api/mailchimp/lists/' + listType + '/batchUnsubscribe', subscribers);
    };

    var batchUnsubscribeMembers = function (listType, allMembers, notificationCallback) {
      return listSubscribers(listType)
        .then(filterSubscriberResponsesForUnsubscriptions(listType, allMembers))
        .then(batchUnsubscribeForListType(listType, allMembers, notificationCallback))
        .then(returnUpdatedMembers);
    };

    function returnUpdatedMembers() {
      return MemberService.all();
    }

    function batchUnsubscribeForListType(listType, allMembers, notificationCallback) {
      return function (subscribers) {
        if (subscribers.length > 0) {
          return batchUnsubscribe(listType, subscribers)
            .then(removeSubscriberDetailsFromMembers(listType, allMembers, subscribers, notificationCallback));
        } else {
          notificationCallback('No members needed to be unsubscribed from ' + listType + ' list');
        }
      }
    }

    function removeSubscriberDetailsFromMembers(listType, allMembers, subscribers, notificationCallback) {
      return function () {
        var updatedMembers = _.chain(subscribers)
          .map(function (subscriber) {
            var member = EmailSubscriptionService.responseToMember(listType, allMembers, subscriber);
            if (member) {
              member.mailchimpLists[listType] = {subscribed: false, updated: true};
              member.$saveOrUpdate();
            } else {
              notificationCallback('Could not find member from ' + listType + ' response containing data ' + JSON.stringify(subscriber));
            }
            return member;
          })
          .filter(function (member) {
            return member;
          })
          .value();
        $q.all(updatedMembers).then(function () {
          notificationCallback('Successfully unsubscribed ' + updatedMembers.length + ' member(s) from ' + listType + ' list');
          return updatedMembers;
        })
      }
    }

    function filterSubscriberResponsesForUnsubscriptions(listType, allMembers) {
      return function (listResponse) {
        return _.chain(listResponse.data)
          .filter(function (subscriber) {
            return EmailSubscriptionService.includeSubscriberInUnsubscription(listType, allMembers, subscriber);
          })
          .map(function (subscriber) {
            return {
              email: subscriber.email,
              euid: subscriber.euid,
              leid: subscriber.leid
            };
          })
          .value();
      }
    }

    return {
      batchUnsubscribeMembers: batchUnsubscribeMembers
    }

  })
  .factory('MailchimpCampaignService', function (MAILCHIMP_APP_CONSTANTS, $log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService) {

    var logger = $log.getInstance('MailchimpCampaignService');
    $log.logLevels['MailchimpCampaignService'] = $log.LEVEL.OFF;

    function addCampaign(campaignId, campaignName) {
      return MailchimpHttpService.call('Adding Mailchimp campaign ' + campaignId + ' with name ' + campaignName, 'POST', 'api/mailchimp/campaigns/' + campaignId + '/campaignAdd', {campaignName: campaignName});
    }

    function deleteCampaign(campaignId) {
      return MailchimpHttpService.call('Deleting Mailchimp campaign ' + campaignId, 'DELETE', 'api/mailchimp/campaigns/' + campaignId + '/delete');
    }

    function getContent(campaignId) {
      return MailchimpHttpService.call('Getting Mailchimp content for campaign ' + campaignId, 'GET', 'api/mailchimp/campaigns/' + campaignId + '/content');
    }

    function list(options) {
      return MailchimpHttpService.call('Listing Mailchimp campaigns', 'GET', 'api/mailchimp/campaigns/list', {}, options);
    }

    function setContent(campaignId, contentSections) {
      return contentSections ? MailchimpHttpService.call('Setting Mailchimp content for campaign ' + campaignId, 'POST', 'api/mailchimp/campaigns/' + campaignId + '/update', {
        updates: {
          name: "content",
          value: contentSections
        }
      }) : $q.when({
        result: "success",
        campaignId: campaignId,
        message: "setContent skipped as no content provided"
      })
    }

    function setOrClearSegment(replicatedCampaignId, optionalSegmentId) {
      if (optionalSegmentId) {
        return setSegmentId(replicatedCampaignId, optionalSegmentId);
      } else {
        return clearSegment(replicatedCampaignId)
      }
    }

    function setSegmentId(campaignId, segmentId) {
      return setSegmentOpts(campaignId, {saved_segment_id: segmentId});
    }

    function clearSegment(campaignId) {
      return setSegmentOpts(campaignId, []);
    }

    function setSegmentOpts(campaignId, value) {
      return MailchimpHttpService.call('Setting Mailchimp segment opts for campaign ' + campaignId + ' with value ' + JSON.stringify(value), 'POST', 'api/mailchimp/campaigns/' + campaignId + '/update', {
        updates: {
          name: "segment_opts",
          value: value
        }
      });
    }

    function setCampaignOptions(campaignId, campaignName, otherOptions) {
      var value = angular.extend({}, {
        title: campaignName.substring(0, 99),
        subject: campaignName
      }, otherOptions);

      return MailchimpHttpService.call('Setting Mailchimp campaign options for id ' + campaignId + ' with ' + JSON.stringify(value), 'POST', 'api/mailchimp/campaigns/' + campaignId + '/update', {
        updates: {
          name: "options",
          value: value
        }
      });
    }

    function replicateCampaign(campaignId) {
      return MailchimpHttpService.call('Replicating Mailchimp campaign ' + campaignId, 'POST', 'api/mailchimp/campaigns/' + campaignId + '/replicate');
    }

    function sendCampaign(campaignId) {
      if (!MAILCHIMP_APP_CONSTANTS.allowSendCampaign) throw new Error('You cannot send campaigns as sending has been disabled in this release of the application');
      return MailchimpHttpService.call('Sending Mailchimp campaign ' + campaignId, 'POST', 'api/mailchimp/campaigns/' + campaignId + '/send');
    }

    function listCampaigns() {
      return MailchimpHttpService.call('Listing Mailchimp campaigns', 'GET', 'api/mailchimp/campaigns/list');
    }

    function replicateAndSendWithOptions(options) {
      logger.debug('replicateAndSendWithOptions:options', options);
      return replicateCampaign(options.campaignId)
        .then(function (replicateCampaignResponse) {
          logger.debug('replicateCampaignResponse', replicateCampaignResponse);
          var replicatedCampaignId = replicateCampaignResponse.id;
          return setCampaignOptions(replicatedCampaignId, options.campaignName, options.otherSegmentOptions)
            .then(function (renameResponse) {
              logger.debug('renameResponse', renameResponse);
              return setContent(replicatedCampaignId, options.contentSections)
                .then(function (setContentResponse) {
                  logger.debug('setContentResponse', setContentResponse);
                  return setOrClearSegment(replicatedCampaignId, options.segmentId)
                    .then(function (setSegmentResponse) {
                      logger.debug('setSegmentResponse', setSegmentResponse);
                      return options.dontSend ? replicateCampaignResponse : sendCampaign(replicatedCampaignId)
                    })
                })
            })
        });
    }

    return {
      replicateAndSendWithOptions: replicateAndSendWithOptions,
      list: list
    }

  });
