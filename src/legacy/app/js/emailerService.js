angular.module('ekwgApp')
  .factory('EmailSubscriptionService', function ($rootScope, $log, $http, $q, MemberService, DateUtils, MailchimpErrorParserService) {
    var logger = $log.getInstance('EmailSubscriptionService');
    $log.logLevels['EmailSubscriptionService'] = $log.LEVEL.OFF;

    var resetAllBatchSubscriptions = function (members, subscribedState) {
      var deferredTask = $q.defer();
      var savePromises = [];
      deferredTask.notify('Resetting Mailchimp subscriptions for ' + members.length + ' members');
      _.each(members, function (member) {
        defaultMailchimpSettings(member, subscribedState);
        savePromises.push(member.$saveOrUpdate());
      });

      $q.all(savePromises).then(function () {
        deferredTask.notify('Reset of Mailchimp subscriptions completed. Next member save will resend all lists to Mailchimp');
        MemberService.all().then(function (refreshedMembers) {
          deferredTask.resolve(refreshedMembers);
        })
      });
    };

    function defaultMailchimpSettings(member, subscribedState) {
      member.mailchimpLists = {
        "walks": {"subscribed": subscribedState},
        "socialEvents": {"subscribed": subscribedState},
        "general": {"subscribed": subscribedState}
      }
    }

    function booleanToString(value) {
      return String(value || false);
    }

    function addMailchimpIdentifiersToRequest(member, listType, request) {
      var mailchimpIdentifiers = {email: {}};
      mailchimpIdentifiers.email.email = member.email;
      if (member.mailchimpLists[listType].leid) {
        mailchimpIdentifiers.email.leid = member.mailchimpLists[listType].leid;
      }
      if (request) {
        return angular.extend(request, mailchimpIdentifiers);
      } else {
        return mailchimpIdentifiers.email;
      }
    }

    var createBatchSubscriptionForList = function (listType, members) {
      var deferredTask = $q.defer();
      var progress = 'Sending ' + listType + ' member data to Mailchimp';
      deferredTask.notify(progress);
      var batchedMembers = [];
      var subscriptionEntries = _.chain(members)
        .filter(function (member) {
          return includeMemberInSubscription(listType, member);
        })
        .map(function (member) {
          batchedMembers.push(member);
          var request = {
            "merge_vars": {
              "FNAME": member.firstName,
              "LNAME": member.lastName,
              "MEMBER_NUM": member.membershipNumber,
              "MEMBER_EXP": DateUtils.displayDate(member.membershipExpiryDate),
              "USERNAME": member.userName,
              "PW_RESET": member.passwordResetId || ''
            }
          };
          return addMailchimpIdentifiersToRequest(member, listType, request);
        }).value();

      if (subscriptionEntries.length > 0) {
        var url = '/api/mailchimp/lists/' + listType + '/batchSubscribe';
        logger.debug('sending', subscriptionEntries.length, listType, 'subscriptions to mailchimp', subscriptionEntries);
        $http({method: 'POST', url: url, data: subscriptionEntries})
          .then(function (response) {
            var responseData = response.data;
            logger.debug('received response', responseData);
            var errorObject = MailchimpErrorParserService.extractError(responseData);
            if (errorObject.error) {
              var errorResponse = {
                message: 'Sending of ' + listType + ' list subscription to Mailchimp was not successful',
                error: errorObject.error
              };
              deferredTask.reject(errorResponse);
            } else {
              var totalResponseCount = responseData.updates.concat(responseData.adds).concat(responseData.errors).length;
              deferredTask.notify('Send of ' + subscriptionEntries.length + ' ' + listType + ' members completed - processing ' + totalResponseCount + ' Mailchimp response(s)');
              var savePromises = [];
              processValidResponses(listType, responseData.updates.concat(responseData.adds), batchedMembers, savePromises, deferredTask);
              processErrorResponses(listType, responseData.errors, batchedMembers, savePromises, deferredTask);
              $q.all(savePromises).then(function () {
                MemberService.all().then(function (refreshedMembers) {
                  deferredTask.notify('Send of ' + subscriptionEntries.length + ' members to ' + listType + ' list completed with ' + responseData.add_count + ' member(s) added, ' + responseData.update_count + ' updated and ' + responseData.error_count + ' error(s)');
                  deferredTask.resolve(refreshedMembers);
                })
              });
            }
          }).catch(function (response) {
          var data = response.data;
          var errorMessage = 'Sending of ' + listType + ' member data to Mailchimp was not successful due to response: ' + data.trim();
          logger.error(errorMessage);
          deferredTask.reject(errorMessage);
        })
      } else {
        deferredTask.notify('No ' + listType + ' updates to send Mailchimp');
        MemberService.all().then(function (refreshedMembers) {
          deferredTask.resolve(refreshedMembers);
        });
      }
      return deferredTask.promise;
    };

    function includeMemberInEmailList(listType, member) {
      if (member.email && member.mailchimpLists[listType].subscribed) {
        if (listType === 'socialEvents') {
          return member.groupMember && member.socialMember;
        } else {
          return member.groupMember;
        }
      } else {
        return false;
      }
    }

    function includeMemberInSubscription(listType, member) {
      return includeMemberInEmailList(listType, member) && !member.mailchimpLists[listType].updated;
    }

    function includeMemberInUnsubscription(listType, member) {
      if (!member || !member.groupMember) {
        return true;
      } else if (member.mailchimpLists) {
        if (listType === 'socialEvents') {
          return (!member.socialMember && member.mailchimpLists[listType].subscribed);
        } else {
          return (!member.mailchimpLists[listType].subscribed);
        }
      } else {
        return false;
      }
    }

    function includeSubscriberInUnsubscription(listType, allMembers, subscriber) {
      return includeMemberInUnsubscription(listType, responseToMember(listType, allMembers, subscriber));
    }

    function resetUpdateStatusForMember(member) {
      // updated == false means not up to date with mail e.g. next list update will send this data to mailchimo
      member.mailchimpLists.walks.updated = false;
      member.mailchimpLists.socialEvents.updated = false;
      member.mailchimpLists.general.updated = false;
    }

    function responseToMember(listType, allMembers, mailchimpResponse) {
      return _(allMembers).find(function (member) {
        var matchedOnListSubscriberId = mailchimpResponse.leid && member.mailchimpLists[listType].leid && (mailchimpResponse.leid.toString() === member.mailchimpLists[listType].leid.toString());
        var matchedOnLastReturnedEmail = member.mailchimpLists[listType].email && (mailchimpResponse.email.toLowerCase() === member.mailchimpLists[listType].email.toLowerCase());
        var matchedOnCurrentEmail = member.email && mailchimpResponse.email.toLowerCase() === member.email.toLowerCase();
        return (matchedOnListSubscriberId || matchedOnLastReturnedEmail || matchedOnCurrentEmail);
      });
    }

    function findMemberAndMarkAsUpdated(listType, batchedMembers, response, deferredTask) {
      var member = responseToMember(listType, batchedMembers, response);
      if (member) {
        member.mailchimpLists[listType].leid = response.leid;
        member.mailchimpLists[listType].updated = true; // updated == true means up to date e.g. nothing to send to mailchimo
        member.mailchimpLists[listType].lastUpdated = DateUtils.nowAsValue();
        member.mailchimpLists[listType].email = member.email;
      } else {
        deferredTask.notify('From ' + batchedMembers.length + ' members, could not find any member related to response ' + JSON.stringify(response));
      }
      return member;
    }

    function processValidResponses(listType, validResponses, batchedMembers, savePromises, deferredTask) {
      _.each(validResponses, function (response) {
        var member = findMemberAndMarkAsUpdated(listType, batchedMembers, response, deferredTask);
        if (member) {
          delete member.mailchimpLists[listType].code;
          delete member.mailchimpLists[listType].error;
          deferredTask.notify('processing valid response for member ' + member.email);
          savePromises.push(member.$saveOrUpdate());
        }
      });
    }

    function processErrorResponses(listType, errorResponses, batchedMembers, savePromises, deferredTask) {
      _.each(errorResponses, function (response) {
        var member = findMemberAndMarkAsUpdated(listType, batchedMembers, response.email, deferredTask);
        if (member) {
          deferredTask.notify('processing error response for member ' + member.email);
          member.mailchimpLists[listType].code = response.code;
          member.mailchimpLists[listType].error = response.error;
          if (_.contains([210, 211, 212, 213, 214, 215, 220, 250], response.code)) member.mailchimpLists[listType].subscribed = false;
          savePromises.push(member.$saveOrUpdate());
        }
      });
    }

    return {
      responseToMember: responseToMember,
      defaultMailchimpSettings: defaultMailchimpSettings,
      createBatchSubscriptionForList: createBatchSubscriptionForList,
      resetAllBatchSubscriptions: resetAllBatchSubscriptions,
      resetUpdateStatusForMember: resetUpdateStatusForMember,
      addMailchimpIdentifiersToRequest: addMailchimpIdentifiersToRequest,
      includeMemberInSubscription: includeMemberInSubscription,
      includeMemberInEmailList: includeMemberInEmailList,
      includeSubscriberInUnsubscription: includeSubscriberInUnsubscription
    }
  });
