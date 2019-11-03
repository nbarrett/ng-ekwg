angular.module('ekwgApp')
  .controller('MemberAdminController',
    function ($timeout, $location, $window, $log, $q, $rootScope, $routeParams, $scope, ModalService, Upload, DbUtils, LegacyUrlService, URLService, LoggedInMemberService, MemberService, MemberAuditService,
              MemberBulkLoadAuditService, MemberUpdateAuditService, ProfileConfirmationService, EmailSubscriptionService, DateUtils, MailchimpConfig, MailchimpSegmentService, MemberNamingService,
              MailchimpCampaignService, MailchimpListService, Notifier, StringUtils, MemberBulkUploadService, ContentMetaDataService, MONGOLAB_CONFIG, MAILCHIMP_APP_CONSTANTS) {

      var logger = $log.getInstance('MemberAdminController');
      $log.logLevels['MemberAdminController'] = $log.LEVEL.OFF;
      $scope.memberAdminBaseUrl = ContentMetaDataService.baseUrl('memberAdmin');

      $scope.notify = {};
      var notify = Notifier.createAlertInstance($scope.notify);
      notify.setBusy();

      var DESCENDING = '▼';
      var ASCENDING = '▲';

      $scope.today = DateUtils.momentNowNoTime().valueOf();
      $scope.currentMember = {};

      $scope.display = {
        saveInProgress: false
      };

      $scope.calculateMemberFilterDate = function () {
        $scope.display.memberFilterDate = DateUtils.momentNowNoTime().subtract($scope.display && $scope.display.emailType.monthsInPast, 'months').valueOf();
      };

      $scope.showArea = function (area) {
        LegacyUrlService.navigateTo('admin', area)
      };

      $scope.display.emailTypes = [$scope.display.emailType];
      $scope.dropSupported = true;
      $scope.memberAdminOpen = !URLService.hasRouteParameter('expenseId') && (URLService.isSubArea('member-admin') || URLService.noArea());
      $scope.memberBulkLoadOpen = URLService.isSubArea('member-bulk-load');
      $scope.memberAuditOpen = URLService.isSubArea('member-audit');

      LoggedInMemberService.showLoginPromptWithRouteParameter('expenseId');

      if (LoggedInMemberService.memberLoggedIn()) {
        refreshMembers()
          .then(refreshMemberAudit)
          .then(refreshMemberBulkLoadAudit)
          .then(refreshMemberUpdateAudit)
          .then(notify.clearBusy.bind(notify));
      } else {
        notify.clearBusy();
      }

      $scope.currentMemberBulkLoadDisplayDate = function () {
        return DateUtils.currentMemberBulkLoadDisplayDate();
      };

      $scope.viewMailchimpListEntry = function (item) {
        $window.open(MAILCHIMP_APP_CONSTANTS.apiServer + "/lists/members/view?id=" + item, '_blank');
      };


      $scope.showSendEmailsDialog = function () {
        $scope.alertTypeResetPassword = false;
        $scope.display.emailMembers = [];
        ModalService.showModal({
          templateUrl: "partials/admin/send-emails-dialog.html",
          controller: "MemberAdminSendEmailsController",
          preClose: function (modal) {
            logger.debug('preClose event with modal', modal);
            modal.element.modal('hide');
          },
          inputs: {
            members: $scope.members
          }
        }).then(function (modal) {
          logger.debug('modal event with modal', modal);
          modal.element.modal();
          modal.close.then(function (result) {
            logger.debug('close event with result', result);
          });
        })
      };


      function handleSaveError(errorResponse) {
        $scope.display.saveInProgress = false;
        applyAllowEdits();
        var message = StringUtils.stringify(errorResponse);
        var duplicate = s.include(message, 'duplicate');
        logger.debug('errorResponse', errorResponse, 'duplicate', duplicate);
        if (duplicate) {
          message = 'Duplicate data was detected. A member record must have a unique Email Address, Display Name, Ramblers Membership Number and combination of First Name, Last Name and Alias. Please amend the current member and try again.';
          $scope.display.duplicate = true;
        }
        notify.clearBusy();
        notify.error({
          title: 'Member could not be saved',
          message: message
        });
      }

      function resetSendFlags() {
        logger.debug('resetSendFlags');
        $scope.display.saveInProgress = false;
        return applyAllowEdits();
      }

      $scope.uploadSessionStatuses = [
        {title: "All"},
        {status: "created", title: "Created"},
        {status: "summary", title: "Summary"},
        {status: "skipped", title: "Skipped"},
        {status: "updated", title: "Updated"},
        {status: "error", title: "Error"}];


      $scope.filters = {
        uploadSession: {selected: undefined},
        memberUpdateAudit: {
          query: $scope.uploadSessionStatuses[0],
          orderByField: 'updateTime',
          reverseSort: true,
          sortDirection: DESCENDING
        },
        membersUploaded: {
          query: '',
          orderByField: 'email',
          reverseSort: true,
          sortDirection: DESCENDING
        }
      };

      function applySortTo(field, filterSource) {
        logger.debug('sorting by field', field, 'current value of filterSource', filterSource);
        if (field === 'member') {
          filterSource.orderByField = 'memberId | memberIdToFullName : members : "" : true';
        } else {
          filterSource.orderByField = field;
        }
        filterSource.reverseSort = !filterSource.reverseSort;
        filterSource.sortDirection = filterSource.reverseSort ? DESCENDING : ASCENDING;
        logger.debug('sorting by field', field, 'new value of filterSource', filterSource);
      }

      $scope.uploadSessionChanged = function () {
        notify.setBusy();
        notify.hide();
        refreshMemberUpdateAudit().then(notify.clearBusy.bind(notify));
      };

      $scope.sortMembersUploadedBy = function (field) {
        applySortTo(field, $scope.filters.membersUploaded);
      };

      $scope.sortMemberUpdateAuditBy = function (field) {
        applySortTo(field, $scope.filters.memberUpdateAudit);
      };

      $scope.showMemberUpdateAuditColumn = function (field) {
        return s.startsWith($scope.filters.memberUpdateAudit.orderByField, field);
      };

      $scope.showMembersUploadedColumn = function (field) {
        return $scope.filters.membersUploaded.orderByField === field;
      };

      $scope.sortMembersBy = function (field) {
        applySortTo(field, $scope.filters.members);
      };

      $scope.showMembersColumn = function (field) {
        return s.startsWith($scope.filters.members.orderByField, field);
      };

      $scope.toGlyphicon = function (status) {
        if (status === 'created') return "glyphicon glyphicon-plus green-icon";
        if (status === 'complete' || status === 'summary') return "glyphicon-ok green-icon";
        if (status === 'success') return "glyphicon-ok-circle green-icon";
        if (status === 'info') return "glyphicon-info-sign blue-icon";
        if (status === 'updated') return "glyphicon glyphicon-pencil green-icon";
        if (status === 'error') return "glyphicon-remove-circle red-icon";
        if (status === 'skipped') return "glyphicon glyphicon-thumbs-up green-icon";
      };

      $scope.filters.members = {
        query: '',
        orderByField: 'firstName',
        reverseSort: false,
        sortDirection: ASCENDING,
        filterBy: [
          {
            title: "Active Group Member", group: 'Group Settings', filter: function (member) {
              return member.groupMember;
            }
          },
          {
            title: "All Members", filter: function () {
              return true;
            }
          },
          {
            title: "Active Social Member", group: 'Group Settings', filter: MemberService.filterFor.SOCIAL_MEMBERS
          },
          {
            title: "Membership Date Active/Not set",
            group: 'From Ramblers Supplied Datas',
            filter: function (member) {
              return !member.membershipExpiryDate || (member.membershipExpiryDate >= $scope.today);
            }
          },
          {
            title: "Membership Date Expired", group: 'From Ramblers Supplied Data', filter: function (member) {
              return member.membershipExpiryDate < $scope.today;
            }
          },
          {
            title: "Not received in last Ramblers Bulk Load",
            group: 'From Ramblers Supplied Data',
            filter: function (member) {
              return !member.receivedInLastBulkLoad;
            }
          },
          {
            title: "Was received in last Ramblers Bulk Load",
            group: 'From Ramblers Supplied Data',
            filter: function (member) {
              return member.receivedInLastBulkLoad;
            }
          },
          {
            title: "Password Expired", group: 'Other Settings', filter: function (member) {
              return member.expiredPassword;
            }
          },
          {
            title: "Walk Admin", group: 'Administrators', filter: function (member) {
              return member.walkAdmin;
            }
          },
          {
            title: "Walk Change Notifications", group: 'Administrators', filter: function (member) {
              return member.walkChangeNotifications;
            }
          },
          {
            title: "Social Admin", group: 'Administrators', filter: function (member) {
              return member.socialAdmin;
            }
          },
          {
            title: "Member Admin", group: 'Administrators', filter: function (member) {
              return member.memberAdmin;
            }
          },
          {
            title: "Finance Admin", group: 'Administrators', filter: function (member) {
              return member.financeAdmin;
            }
          },
          {
            title: "File Admin", group: 'Administrators', filter: function (member) {
              return member.fileAdmin;
            }
          },
          {
            title: "Treasury Admin", group: 'Administrators', filter: function (member) {
              return member.treasuryAdmin;
            }
          },
          {
            title: "Content Admin", group: 'Administrators', filter: function (member) {
              return member.contentAdmin;
            }
          },
          {
            title: "Committee Member", group: 'Administrators', filter: function (member) {
              return member.committee;
            }
          },
          {
            title: "Subscribed to the General emails list",
            group: 'Email Subscriptions',
            filter: MemberService.filterFor.GENERAL_MEMBERS_SUBSCRIBED
          },
          {
            title: "Subscribed to the Walks email list",
            group: 'Email Subscriptions',
            filter: MemberService.filterFor.WALKS_MEMBERS_SUBSCRIBED
          },
          {
            title: "Subscribed to the Social email list",
            group: 'Email Subscriptions',
            filter: MemberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED
          }
        ]
      };

      $scope.filters.members.filterSelection = $scope.filters.members.filterBy[0].filter;

      $scope.memberAuditTabs = [
        {title: "All Member Logins", active: true}
      ];

      applyAllowEdits();
      $scope.allowConfirmDelete = false;
      $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      $scope.members = [];
      $scope.memberAudit = [];
      $scope.memberUpdateAudit = [];
      $scope.membersUploaded = [];

      $scope.resetAllBatchSubscriptions = function () {
        // careful with calling this - it resets all batch subscriptions to default values
        return EmailSubscriptionService.resetAllBatchSubscriptions($scope.members, false);
      };

      function updateWalksList(members) {
        return EmailSubscriptionService.createBatchSubscriptionForList('walks', members);
      }

      function updateSocialEventsList(members) {
        return EmailSubscriptionService.createBatchSubscriptionForList('socialEvents', members);
      }

      function updateGeneralList(members) {
        return EmailSubscriptionService.createBatchSubscriptionForList('general', members);
      }

      function notifyUpdatesComplete(members) {
        notify.success({title: 'Mailchimp updates', message: 'Mailchimp lists were updated successfully'});
        $scope.members = members;
        notify.clearBusy();
      }

      $scope.deleteMemberAudit = function (filteredMemberAudit) {
        removeAllRecordsAndRefresh(filteredMemberAudit, refreshMemberAudit, 'member audit');
      };

      $scope.deleteMemberUpdateAudit = function (filteredMemberUpdateAudit) {
        removeAllRecordsAndRefresh(filteredMemberUpdateAudit, refreshMemberUpdateAudit, 'member update audit');
      };

      function removeAllRecordsAndRefresh(records, refreshFunction, type) {
        notify.success('Deleting ' + records.length + ' ' + type + ' record(s)');
        var removePromises = [];
        angular.forEach(records, function (record) {
          removePromises.push(record.$remove())
        });

        $q.all(removePromises).then(function () {
          notify.success('Deleted ' + records.length + ' ' + type + ' record(s)');
          refreshFunction.apply();
        });
      }

      $scope.$on('memberLoginComplete', function () {
        applyAllowEdits('memberLoginComplete');
        refreshMembers();
        refreshMemberAudit();
        refreshMemberBulkLoadAudit()
          .then(refreshMemberUpdateAudit);
      });

      $scope.$on('memberSaveComplete', function () {
        refreshMembers();
      });

      $scope.$on('memberLogoutComplete', function () {
        applyAllowEdits('memberLogoutComplete');
      });

      $scope.createMemberFromAudit = function (memberFromAudit) {
        var member = new MemberService(memberFromAudit);
        EmailSubscriptionService.defaultMailchimpSettings(member, true);
        member.groupMember = true;
        showMemberDialog(member, 'Add New');
        notify.warning({
          title: 'Recreating Member',
          message: "Note that clicking Save immediately on this member is likely to cause the same error to occur as was originally logged in the audit. Therefore make the necessary changes here to allow the member record to be saved successfully"
        })
      };

      $scope.addMember = function () {
        var member = new MemberService();
        EmailSubscriptionService.defaultMailchimpSettings(member, true);
        member.groupMember = true;
        showMemberDialog(member, 'Add New');
      };

      $scope.viewMember = function (member) {
        showMemberDialog(member, 'View');
      };

      $scope.editMember = function (member) {
        showMemberDialog(member, 'Edit Existing');
      };

      $scope.deleteMemberDetails = function () {
        $scope.allowDelete = false;
        $scope.allowConfirmDelete = true;
      };

      function unsubscribeWalksList() {
        return MailchimpListService.batchUnsubscribeMembers('walks', $scope.members, notify.success.bind(notify));
      }

      function unsubscribeSocialEventsList(members) {
        return MailchimpListService.batchUnsubscribeMembers('socialEvents', members, notify.success.bind(notify));
      }

      function unsubscribeGeneralList(members) {
        return MailchimpListService.batchUnsubscribeMembers('general', members, notify.success.bind(notify));
      }

      $scope.updateMailchimpLists = function () {
        $scope.display.saveInProgress = true;
        return $q.when(notify.success('Sending updates to Mailchimp lists', true))
          .then(refreshMembers, notify.error.bind(notify), notify.success.bind(notify))
          .then(updateWalksList, notify.error.bind(notify), notify.success.bind(notify))
          .then(updateSocialEventsList, notify.error.bind(notify), notify.success.bind(notify))
          .then(updateGeneralList, notify.error.bind(notify), notify.success.bind(notify))
          .then(unsubscribeWalksList, notify.error.bind(notify), notify.success.bind(notify))
          .then(unsubscribeSocialEventsList, notify.error.bind(notify), notify.success.bind(notify))
          .then(unsubscribeGeneralList, notify.error.bind(notify), notify.success.bind(notify))
          .then(notifyUpdatesComplete, notify.error.bind(notify), notify.success.bind(notify))
          .then(resetSendFlags)
          .catch(mailchimpError);
      };

      function mailchimpError(errorResponse) {
        resetSendFlags();
        notify.error({
          title: 'Mailchimp updates failed',
          message: (errorResponse.message || errorResponse) + (errorResponse.error ? ('. Error was: ' + StringUtils.stringify(errorResponse.error)) : '')
        });
        notify.clearBusy();
      }

      $scope.confirmDeleteMemberDetails = function () {
        $scope.currentMember.$remove(hideMemberDialogAndRefreshMembers);
      };

      $scope.cancelMemberDetails = function () {
        hideMemberDialogAndRefreshMembers();
      };

      $scope.profileSettingsConfirmedChecked = function () {
        ProfileConfirmationService.processMember($scope.currentMember);
      };

      $scope.refreshMemberAudit = refreshMemberAudit;

      $scope.memberUrl = function () {
        return $scope.currentMember && $scope.currentMember.$id && (MONGOLAB_CONFIG.baseUrl + MONGOLAB_CONFIG.database + '/collections/members/' + $scope.currentMember.$id());
      };

      $scope.saveMemberDetails = function () {
        var member = DateUtils.convertDateFieldInObject($scope.currentMember, 'membershipExpiryDate');
        $scope.display.saveInProgress = true;

        if (!member.userName) {
          member.userName = MemberNamingService.createUniqueUserName(member, $scope.members);
          logger.debug('creating username', member.userName);
        }

        if (!member.displayName) {
          member.displayName = MemberNamingService.createUniqueDisplayName(member, $scope.members);
          logger.debug('creating displayName', member.displayName);
        }

        function preProcessMemberBeforeSave() {
          DbUtils.removeEmptyFieldsIn(member);
          return EmailSubscriptionService.resetUpdateStatusForMember(member);
        }

        function removeEmptyFieldsIn(obj) {
          _.each(obj, function (value, field) {
            logger.debug('processing', typeof (field), 'field', field, 'value', value);
            if (_.contains([null, undefined, ""], value)) {
              logger.debug('removing non-populated', typeof (field), 'field', field);
              delete obj[field];
            }
          });
        }

        function saveAndHide() {
          return DbUtils.auditedSaveOrUpdate(member, hideMemberDialogAndRefreshMembers, notify.error.bind(notify))
        }

        $q.when(notify.success('Saving member', true))
          .then(preProcessMemberBeforeSave, notify.error.bind(notify), notify.success.bind(notify))
          .then(saveAndHide, notify.error.bind(notify), notify.success.bind(notify))
          .then(resetSendFlags)
          .then(function () {
            return notify.success('Member saved successfully');
          })
          .catch(handleSaveError)
      };

      $scope.copyDetailsToNewMember = function () {
        var copiedMember = new MemberService($scope.currentMember);
        delete copiedMember._id;
        EmailSubscriptionService.defaultMailchimpSettings(copiedMember, true);
        ProfileConfirmationService.unconfirmProfile(copiedMember);
        showMemberDialog(copiedMember, 'Copy Existing');
        notify.success('Existing Member copied! Make changes here and save to create new member.')
      };

      function applyAllowEdits() {
        $scope.allowEdits = LoggedInMemberService.allowMemberAdminEdits();
        $scope.allowCopy = LoggedInMemberService.allowMemberAdminEdits();
        return true;
      }

      function findLastLoginTimeForMember(member) {
        var memberAudit = _.chain($scope.memberAudit)
          .filter(function (memberAudit) {
            return memberAudit.userName === member.userName;
          })
          .sortBy(function (memberAudit) {
            return memberAudit.lastLoggedIn;
          })
          .last()
          .value();
        return memberAudit === undefined ? undefined : memberAudit.loginTime;
      }


      $scope.bulkUploadRamblersDataStart = function () {
        $('#select-bulk-load-file').click();
      };

      $scope.resetSendFlagsAndNotifyError = function (error) {
        logger.error('resetSendFlagsAndNotifyError', error);
        resetSendFlags();
        return notify.error(error);
      };

      $scope.bulkUploadRamblersDataOpenFile = function (file) {
        if (file) {
          var fileUpload = file;
          $scope.display.saveInProgress = true;

          function bulkUploadRamblersResponse(memberBulkLoadServerResponse) {
            return MemberBulkUploadService.processMembershipRecords(file, memberBulkLoadServerResponse, $scope.members, notify)
          }

          function bulkUploadRamblersProgress(evt) {
            fileUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
            logger.debug("bulkUploadRamblersProgress:progress event", evt);
          }

          $scope.uploadedFile = Upload.upload({
            url: 'api/ramblers/monthly-reports/upload',
            method: 'POST',
            file: file
          }).then(bulkUploadRamblersResponse, $scope.resetSendFlagsAndNotifyError, bulkUploadRamblersProgress)
            .then(refreshMemberBulkLoadAudit)
            .then(refreshMemberUpdateAudit)
            .then(validateBulkUploadProcessingBeforeMailchimpUpdates)
            .catch($scope.resetSendFlagsAndNotifyError);
        }
      };

      function showMemberDialog(member, memberEditMode) {
        logger.debug('showMemberDialog:', memberEditMode, member);
        $scope.alertTypeResetPassword = false;
        var existingRecordEditEnabled = $scope.allowEdits && s.startsWith(memberEditMode, 'Edit');
        $scope.allowConfirmDelete = false;
        $scope.allowCopy = existingRecordEditEnabled;
        $scope.allowDelete = existingRecordEditEnabled;
        $scope.memberEditMode = memberEditMode;
        $scope.currentMember = member;
        $scope.currentMemberUpdateAudit = [];
        if ($scope.currentMember.$id()) {
          logger.debug('querying MemberUpdateAuditService for memberId', $scope.currentMember.$id());
          MemberUpdateAuditService.query({memberId: $scope.currentMember.$id()}, {sort: {updateTime: -1}})
            .then(function (data) {
              logger.debug('MemberUpdateAuditService:', data.length, 'events', data);
              $scope.currentMemberUpdateAudit = data;
            });

          $scope.lastLoggedIn = findLastLoginTimeForMember(member);
        } else {
          logger.debug('new member with default values', $scope.currentMember);
        }
        $('#member-admin-dialog').modal();

      }

      function hideMemberDialogAndRefreshMembers() {
        $q.when($('#member-admin-dialog').modal('hide'))
          .then(refreshMembers)
          .then(notify.clearBusy.bind(notify))
          .then(notify.hide.bind(notify))
      }

      function refreshMembers() {
        if (LoggedInMemberService.allowMemberAdminEdits()) {
          return MemberService.all()
            .then(function (refreshedMembers) {
              $scope.members = refreshedMembers;
              return $scope.members;
            });

        }
      }

      function refreshMemberAudit() {
        if (LoggedInMemberService.allowMemberAdminEdits()) {
          MemberAuditService.all({limit: 100, sort: {loginTime: -1}}).then(function (memberAudit) {
            logger.debug('refreshed', memberAudit && memberAudit.length, 'member audit records');
            $scope.memberAudit = memberAudit;
          });
        }
        return true;
      }

      function refreshMemberBulkLoadAudit() {
        if (LoggedInMemberService.allowMemberAdminEdits()) {
          return MemberBulkLoadAuditService.all({
            limit: 100,
            sort: {createdDate: -1}
          }).then(function (uploadSessions) {
            logger.debug('refreshed', uploadSessions && uploadSessions.length, 'upload sessions');
            $scope.uploadSessions = uploadSessions;
            $scope.filters.uploadSession.selected = _.first(uploadSessions);
            return $scope.filters.uploadSession.selected;
          });
        } else {
          return true;
        }
      }

      function migrateAudits() {
        // temp - remove this!
        MemberUpdateAuditService.all({
          limit: 10000,
          sort: {updateTime: -1}
        }).then(function (allMemberUpdateAudit) {

          logger.debug('temp queried all', allMemberUpdateAudit && allMemberUpdateAudit.length, 'member audit records');
          var keys = [];
          var memberUpdateAuditServicePromises = [];
          var memberBulkLoadAuditServicePromises = [];
          var bulkAudits = _.chain(allMemberUpdateAudit)
          // .filter(function (audit) {
          //   return !audit.uploadSessionId;
          // })
            .map(function (audit) {
              var auditLog = {
                fileName: audit.fileName,
                createdDate: DateUtils.asValueNoTime(audit.updateTime),
                auditLog: [
                  {
                    "status": "complete",
                    "message": "Migrated audit log for upload of file " + audit.fileName
                  }
                ]
              };

              return auditLog;
            })
            .uniq(JSON.stringify)
            .map(function (auditLog) {
              return new MemberBulkLoadAuditService(auditLog).$save()
                .then(function (auditResponse) {
                  memberBulkLoadAuditServicePromises.push(auditResponse);
                  logger.debug('saved bulk load session id', auditResponse.$id(), 'number', memberBulkLoadAuditServicePromises.length);
                  return auditResponse;
                });
            })
            .value();

          function saveAudit(audit) {
            memberUpdateAuditServicePromises.push(audit.$saveOrUpdate());
            logger.debug('saved', audit.uploadSessionId, 'to audit number', memberUpdateAuditServicePromises.length);
          }

          $q.all(bulkAudits).then(function (savedBulkAuditRecords) {
            logger.debug('saved bulk load sessions', savedBulkAuditRecords);
            _.each(allMemberUpdateAudit, function (audit) {
              var parentBulkAudit = _.findWhere(savedBulkAuditRecords, {
                fileName: audit.fileName,
                createdDate: DateUtils.asValueNoTime(audit.updateTime)
              });
              if (parentBulkAudit) {
                audit.uploadSessionId = parentBulkAudit.$id();
                saveAudit(audit);
              } else {
                logger.error('no match for audit record', audit);
              }
            });
            $q.all(memberUpdateAuditServicePromises).then(function (values) {
              logger.debug('saved', values.length, 'audit records');
            });
          });
        });
      }

      function refreshMemberUpdateAudit() {
        if (LoggedInMemberService.allowMemberAdminEdits()) {
          // migrateAudits();
          if ($scope.filters.uploadSession.selected && $scope.filters.uploadSession.selected.$id) {
            var uploadSessionId = $scope.filters.uploadSession.selected.$id();
            var query = {uploadSessionId: uploadSessionId};
            if ($scope.filters.memberUpdateAudit.query.status) {
              angular.extend(query, {memberAction: $scope.filters.memberUpdateAudit.query.status})
            }
            logger.debug('querying member audit records with', query);
            return MemberUpdateAuditService.query(query, {sort: {updateTime: -1}}).then(function (memberUpdateAudit) {
              $scope.memberUpdateAudit = memberUpdateAudit;
              logger.debug('refreshed', memberUpdateAudit && memberUpdateAudit.length, 'member audit records');
              return $scope.memberUpdateAudit;
            });
          } else {
            $scope.memberUpdateAudit = [];
            logger.debug('no member audit records');
            return $q.when($scope.memberUpdateAudit);
          }
        }
      }

      function auditSummary() {
        return _.groupBy($scope.memberUpdateAudit, function (auditItem) {
          return auditItem.memberAction || 'unknown';
        });
      }

      function auditSummaryFormatted(auditSummary) {

        var total = _.reduce(auditSummary, function (memo, value) {
          return memo + value.length;
        }, 0);

        var summary = _.map(auditSummary, function (items, key) {
          return items.length + ':' + key;
        }).join(', ');

        return total + " Member audits " + (total ? '(' + summary + ')' : '');
      }

      $scope.memberUpdateAuditSummary = function () {
        return auditSummaryFormatted(auditSummary());
      };

      function validateBulkUploadProcessingBeforeMailchimpUpdates() {
        logger.debug('validateBulkUploadProcessing:$scope.filters.uploadSession', $scope.filters.uploadSession);
        if ($scope.filters.uploadSession.selected.error) {
          notify.error({title: 'Bulk upload failed', message: $scope.filters.uploadSession.selected.error});
        } else {

          var summary = auditSummary();
          var summaryFormatted = auditSummaryFormatted(summary);

          logger.debug('summary', summary, 'summaryFormatted', summaryFormatted);
          if (summary.error) {
            notify.error({
              title: "Bulk upload was not successful",
              message: "One or more errors occurred - " + summaryFormatted
            });
            return false;
          } else return $scope.updateMailchimpLists();
        }
      }
    }
  )
;
