angular.module('ekwgApp')
  .controller('MemberAdminSendEmailsController', function ($log, $q, $scope, $filter, DateUtils, DbUtils, MemberLoginService, StringUtils,
                                                           EmailSubscriptionService, MailchimpSegmentService, MailchimpCampaignService,
                                                           MailchimpConfig, Notifier, members, close) {
      var logger = $log.getInstance('MemberAdminSendEmailsController');
      $log.logLevels['MemberAdminSendEmailsController'] = $log.LEVEL.OFF;
      var notify = Notifier.createAlertInstance($scope);
      notify.setBusy();

      var CAMPAIGN_TYPE_WELCOME = "welcome";
      var CAMPAIGN_TYPE_PASSWORD_RESET = "passwordReset";
      var CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING = "expiredMembersWarning";
      var CAMPAIGN_TYPE_EXPIRED_MEMBERS = "expiredMembers";
      $scope.today = DateUtils.momentNowNoTime().valueOf();
      $scope.members = members;
      $scope.memberFilterDateCalendar = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.memberFilterDateCalendar.opened = true;
        }
      };

      $scope.showHelp = function (show) {
        $scope.display.showHelp = show;
      };

      $scope.cancel = function () {
        close();
      };

      $scope.display = {
        showHelp: false,
        selectableMembers: [],
        emailMembers: [],
        saveInProgress: false,
        monthsInPast: 1,
        memberFilterDate: undefined,
        emailType: {name: "(loading)"},
        passwordResetCaption: function () {
          return 'About to send a ' + $scope.display.emailType.name + ' to ' + $scope.display.emailMembers.length + ' member' + ($scope.display.emailMembers.length === 1 ? '' : 's');
        },
        expiryEmailsSelected: function () {
          var returnValue = $scope.display.emailType.type === CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING || $scope.display.emailType.type === CAMPAIGN_TYPE_EXPIRED_MEMBERS;
          logger.debug('expiryEmailsSelected -> ', returnValue);
          return returnValue;
        },
        recentMemberEmailsSelected: function () {
          return $scope.display.emailType.type === CAMPAIGN_TYPE_WELCOME || $scope.display.emailType.type === CAMPAIGN_TYPE_PASSWORD_RESET;
        }
      };

      $scope.populateSelectableMembers = function () {
        $scope.display.selectableMembers = _.chain($scope.members)
          .filter(function (member) {
            return EmailSubscriptionService.includeMemberInEmailList('general', member);
          })
          .map(extendWithInformation)
          .value();
        logger.debug('populateSelectableMembers:found', $scope.display.selectableMembers.length, 'members');
      };

      $scope.populateSelectableMembers();

      $scope.calculateMemberFilterDate = function () {
        $scope.display.memberFilterDate = DateUtils.momentNowNoTime().subtract($scope.display && $scope.display.emailType.monthsInPast, 'months').valueOf();
        logger.info('calculateMemberFilterDate:', $scope.display.memberFilterDate);
      };

      $scope.clearDisplayEmailMembers = function () {
        $scope.display.emailMembers = [];
        notify.warning({
          title: 'Member selection',
          message: 'current member selection was cleared'
        });
      };

      function extendWithInformation(member) {
        return $scope.display.expiryEmailsSelected() ? extendWithExpiryInformation(member) : extendWithCreatedInformation(member);
      }

      function extendWithExpiryInformation(member) {
        var expiredActive = member.membershipExpiryDate < $scope.today ? 'expired' : 'active';
        var memberGrouping = member.receivedInLastBulkLoad ? expiredActive : 'missing from last bulk load';
        var datePrefix = memberGrouping === 'expired' ? ': ' : ', ' + (member.membershipExpiryDate < $scope.today ? 'expired' : 'expiry') + ': ';
        var text = $filter('fullNameWithAlias')(member) + ' (' + memberGrouping + datePrefix + (DateUtils.displayDate(member.membershipExpiryDate) || 'not known') + ')';
        return angular.extend({}, member, {id: member.$id(), text: text, memberGrouping: memberGrouping});
      }

      function extendWithCreatedInformation(member) {
        var memberGrouping = member.membershipExpiryDate < $scope.today ? 'expired' : 'active';
        var text = $filter('fullNameWithAlias')(member) + ' (created ' + (DateUtils.displayDate(member.createdDate) || 'not known') + ')';
        return angular.extend({}, member, {id: member.$id(), text: text, memberGrouping: memberGrouping});
      }

      $scope.memberGrouping = function (member) {
        return member.memberGrouping;
      };

      function populateMembersBasedOnFilter(filter) {
        logger.debug('populateExpiredMembers: display.emailType ->', $scope.display.emailType);
        notify.setBusy();
        notify.warning({
          title: 'Automatically adding expired members',
          message: ' - please wait for list to be populated'
        });

        $scope.display.memberFilterDate = DateUtils.convertDateField($scope.display.memberFilterDate);

        $scope.display.emailMembers = _($scope.display.selectableMembers)
          .filter(filter);
        notify.warning({
          title: 'Members added to email selection',
          message: 'automatically added ' + $scope.display.emailMembers.length + ' members'
        });
        notify.clearBusy();
      }

      $scope.populateMembers = function (recalcMemberFilterDate) {
        logger.debug('$scope.display.memberSelection', $scope.display.emailType.memberSelection);
        this.populateSelectableMembers();
        switch ($scope.display.emailType.memberSelection) {
          case 'recently-added':
            $scope.populateRecentlyAddedMembers(recalcMemberFilterDate);
            break;
          case 'expired-members':
            $scope.populateExpiredMembers(recalcMemberFilterDate);
            break
        }
      };
      $scope.populateRecentlyAddedMembers = function (recalcMemberFilterDate) {
        if (recalcMemberFilterDate) {
          $scope.calculateMemberFilterDate();
        }
        populateMembersBasedOnFilter(function (member) {
          logger.debug('populateMembersBasedOnFilter:member', member);
          return member.groupMember && (member.createdDate >= $scope.display.memberFilterDate);
        });
      };

      $scope.populateExpiredMembers = function (recalcMemberFilterDate) {
        logger.debug('populateExpiredMembers:recalcMemberFilterDate', recalcMemberFilterDate);
        if (recalcMemberFilterDate) {
          $scope.calculateMemberFilterDate();
        }
        populateMembersBasedOnFilter(function (member) {
          const expirationExceeded = member.membershipExpiryDate < $scope.display.memberFilterDate;
          logger.debug('populateMembersBasedOnFilter:expirationExceeded', expirationExceeded, member);
          return member.groupMember && member.membershipExpiryDate && expirationExceeded;
        });
      };

      $scope.populateMembersMissingFromBulkLoad = function (recalcMemberFilterDate) {
        if (recalcMemberFilterDate) {
          $scope.calculateMemberFilterDate();
        }
        populateMembersBasedOnFilter(function (member) {
          logger.debug('populateMembersBasedOnFilter:member', member);
          return member.groupMember && member.membershipExpiryDate && !member.receivedInLastBulkLoad;
        })
      };

      function displayEmailMembersToMembers() {
        return _.chain($scope.display.emailMembers)
          .map(function (memberId) {
            return _.find($scope.members, function (member) {
              return member.$id() === memberId.id;
            })
          })
          .filter(function (member) {
            return member && member.email;
          }).value();
      }

      function addPasswordResetIdToMembers() {

        var saveMemberPromises = [];

        _.map(displayEmailMembersToMembers(), function (member) {
          MemberLoginService.setPasswordResetId(member);
          EmailSubscriptionService.resetUpdateStatusForMember(member);
          saveMemberPromises.push(DbUtils.auditedSaveOrUpdate(member))
        });

        return $q.all(saveMemberPromises).then(function () {
          return notify.success('Password reset prepared for ' + saveMemberPromises.length + ' member(s)');
        });

      }

      function includeInNextMailchimpListUpdate() {

        var saveMemberPromises = [];

        _.map(displayEmailMembersToMembers(), function (member) {
          EmailSubscriptionService.resetUpdateStatusForMember(member);
          saveMemberPromises.push(DbUtils.auditedSaveOrUpdate(member))
        });

        return $q.all(saveMemberPromises).then(function () {
          return notify.success('Member expiration prepared for ' + saveMemberPromises.length + ' member(s)');
        });

      }

      function noAction() {
      }

      function removeExpiredMembersFromGroup() {
        logger.debug('removing ', $scope.display.emailMembers.length, 'members from group');
        var saveMemberPromises = [];

        _($scope.display.emailMembers)
          .map(function (memberId) {
            return _.find($scope.members, function (member) {
              return member.$id() === memberId.id;
            })
          }).map(function (member) {
          member.groupMember = false;
          EmailSubscriptionService.resetUpdateStatusForMember(member);
          saveMemberPromises.push(DbUtils.auditedSaveOrUpdate(member))
        });

        return $q.all(saveMemberPromises)
          .then(function () {
            return notify.success('EKWG group membership removed for ' + saveMemberPromises.length + ' member(s)');
          })
      }

      $scope.cancelSendEmails = function () {
        $scope.cancel();
      };

      $scope.sendEmailsDisabled = function () {
        return $scope.display.emailMembers.length === 0
      };

      $scope.sendEmails = function () {
        $scope.alertTypeResetPassword = true;
        $scope.display.saveInProgress = true;
        $scope.display.duplicate = false;
        $q.when(notify.success('Preparing to email ' + $scope.display.emailMembers.length + ' member' + ($scope.display.emailMembers.length === 1 ? '' : 's'), true))
          .then($scope.display.emailType.preSend)
          .then(updateGeneralList)
          .then(createOrSaveMailchimpSegment)
          .then(saveSegmentDataToMailchimpConfig)
          .then(sendEmailCampaign)
          .then($scope.display.emailType.postSend)
          .then(notify.clearBusy.bind(notify))
          .then($scope.cancel)
          .then(resetSendFlags)
          .catch(handleSendError);

      };

      function resetSendFlags() {
        logger.debug('resetSendFlags');
        $scope.display.saveInProgress = false;
      }

      function updateGeneralList() {
        return EmailSubscriptionService.createBatchSubscriptionForList('general', $scope.members).then(function (updatedMembers) {
          $scope.members = updatedMembers;
        });
      }

      function createOrSaveMailchimpSegment() {
        return MailchimpSegmentService.saveSegment('general', {segmentId: $scope.display.emailType.segmentId}, $scope.display.emailMembers, $scope.display.emailType.name, $scope.members);
      }

      function saveSegmentDataToMailchimpConfig(segmentResponse) {
        logger.debug('saveSegmentDataToMailchimpConfig:segmentResponse', segmentResponse);
        return MailchimpConfig.getConfig()
          .then(function (config) {
            config.mailchimp.segments.general[$scope.display.emailType.type + 'SegmentId'] = segmentResponse.segment.id;
            return MailchimpConfig.saveConfig(config)
              .then(function () {
                logger.debug('saveSegmentDataToMailchimpConfig:returning segment id', segmentResponse.segment.id);
                return segmentResponse.segment.id;
              });
          });
      }

      function sendEmailCampaign(segmentId) {
        var members = $scope.display.emailMembers.length + ' member(s)';
        notify.success('Sending ' + $scope.display.emailType.name + ' email to ' + members);
        logger.debug('about to sendEmailCampaign:', $scope.display.emailType.type, 'campaign Id', $scope.display.emailType.campaignId, 'segmentId', segmentId, 'campaignName', $scope.display.emailType.name);
        return MailchimpCampaignService.replicateAndSendWithOptions({
          campaignId: $scope.display.emailType.campaignId,
          campaignName: $scope.display.emailType.name,
          segmentId: segmentId
        }).then(function () {
          notify.success('Sending of ' + $scope.display.emailType.name + ' to ' + members + ' was successful');
        });
      }

      $scope.emailMemberList = function () {
        return _($scope.display.emailMembers)
          .sortBy(function (emailMember) {
            return emailMember.text;
          }).map(function (emailMember) {
            return emailMember.text;
          }).join(', ');
      };

      function handleSendError(errorResponse) {
        $scope.display.saveInProgress = false;
        notify.error({
          title: 'Your notification could not be sent',
          message: (errorResponse.message || errorResponse) + (errorResponse.error ? ('. Error was: ' + StringUtils.stringify(errorResponse.error)) : '')
        });
        notify.clearBusy();
      }

      MailchimpConfig.getConfig()
        .then(function (config) {
          $scope.display.emailTypes = [
            {
              preSend: addPasswordResetIdToMembers,
              type: CAMPAIGN_TYPE_WELCOME,
              name: config.mailchimp.campaigns.welcome.name,
              monthsInPast: config.mailchimp.campaigns.welcome.monthsInPast,
              campaignId: config.mailchimp.campaigns.welcome.campaignId,
              segmentId: config.mailchimp.segments.general.welcomeSegmentId,
              memberSelection: 'recently-added',
              postSend: noAction,
              dateTooltip: "All members created in the last " + config.mailchimp.campaigns.welcome.monthsInPast + " month are displayed as a default, as these are most likely to need a welcome email sent"
            },
            {
              preSend: addPasswordResetIdToMembers,
              type: CAMPAIGN_TYPE_PASSWORD_RESET,
              name: config.mailchimp.campaigns.passwordReset.name,
              monthsInPast: config.mailchimp.campaigns.passwordReset.monthsInPast,
              campaignId: config.mailchimp.campaigns.passwordReset.campaignId,
              segmentId: config.mailchimp.segments.general.passwordResetSegmentId,
              memberSelection: 'recently-added',
              postSend: noAction,
              dateTooltip: "All members created in the last " + config.mailchimp.campaigns.passwordReset.monthsInPast + " month are displayed as a default"
            },
            {
              preSend: includeInNextMailchimpListUpdate,
              type: CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING,
              name: config.mailchimp.campaigns.expiredMembersWarning.name,
              monthsInPast: config.mailchimp.campaigns.expiredMembersWarning.monthsInPast,
              campaignId: config.mailchimp.campaigns.expiredMembersWarning.campaignId,
              segmentId: config.mailchimp.segments.general.expiredMembersWarningSegmentId,
              memberSelection: 'expired-members',
              postSend: noAction,
              dateTooltip: "Using the expiry date field, you can choose which members will automatically be included. " +
                "A date " + config.mailchimp.campaigns.expiredMembersWarning.monthsInPast + " months in the past has been pre-selected, to avoid including members whose membership renewal is still progress"
            },
            {
              preSend: includeInNextMailchimpListUpdate,
              type: CAMPAIGN_TYPE_EXPIRED_MEMBERS,
              name: config.mailchimp.campaigns.expiredMembers.name,
              monthsInPast: config.mailchimp.campaigns.expiredMembers.monthsInPast,
              campaignId: config.mailchimp.campaigns.expiredMembers.campaignId,
              segmentId: config.mailchimp.segments.general.expiredMembersSegmentId,
              memberSelection: 'expired-members',
              postSend: removeExpiredMembersFromGroup,
              dateTooltip: "Using the expiry date field, you can choose which members will automatically be included. " +
                "A date 3 months in the past has been pre-selected, to avoid including members whose membership renewal is still progress"
            }
          ];
          $scope.display.emailType = $scope.display.emailTypes[0];
          $scope.populateMembers(true);
        });
    }
  );
