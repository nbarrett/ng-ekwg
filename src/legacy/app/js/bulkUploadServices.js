angular.module('ekwgApp')
  .factory('MemberBulkUploadService', function ($log, $q, $filter, MemberService, MemberUpdateAuditService, MemberBulkLoadAuditService, EmailSubscriptionService, DateUtils, DbUtils, MemberNamingService) {

    var logger = $log.getInstance('MemberBulkUploadService');
    var noLogger = $log.getInstance('NoLogger');
    $log.logLevels['MemberBulkUploadService'] = $log.LEVEL.OFF;
    $log.logLevels['NoLogger'] = $log.LEVEL.OFF;
    var RESET_PASSWORD = 'changeme';

    function processMembershipRecords(file, memberBulkLoadServerResponse, members, notify) {
      notify.setBusy();
      var today = DateUtils.momentNowNoTime().valueOf();
      var promises = [];
      var memberBulkLoadResponse = memberBulkLoadServerResponse.data;
      logger.debug('received', memberBulkLoadResponse);
      return DbUtils.auditedSaveOrUpdate(new MemberBulkLoadAuditService(memberBulkLoadResponse))
        .then(function (auditResponse) {
          var uploadSessionId = auditResponse.$id();
          return processBulkLoadResponses(promises, uploadSessionId);
        });

      function updateGroupMembersPreBulkLoadProcessing(promises) {
        if (memberBulkLoadResponse.members && memberBulkLoadResponse.members.length > 1) {
          notify.progress('Processing ' + members.length + ' members ready for bulk load');

          _.each(members, function (member) {
            if (member.receivedInLastBulkLoad) {
              member.receivedInLastBulkLoad = false;
              promises.push(DbUtils.auditedSaveOrUpdate(member, auditUpdateCallback(member), auditErrorCallback(member)));
            }
          });
          return $q.all(promises).then(function () {
            notify.progress('Marked ' + promises.length + ' out of ' + members.length + ' in preparation for update');
            return promises;
          });
        } else {
          return $q.when(promises);
        }
      }

      function processBulkLoadResponses(promises, uploadSessionId) {
        return updateGroupMembersPreBulkLoadProcessing(promises).then(function (updatedPromises) {
          _.each(memberBulkLoadResponse.members, function (ramblersMember, recordIndex) {
            createOrUpdateMember(uploadSessionId, recordIndex, ramblersMember, updatedPromises);
          });
          return $q.all(updatedPromises).then(function () {
            logger.debug('performed total of', updatedPromises.length, 'audit or member updates');
            return updatedPromises;
          });
        });
      }

      function auditUpdateCallback(member) {
        return function (response) {
          logger.debug('auditUpdateCallback for member:', member, 'response', response);
        }
      }

      function auditErrorCallback(member, audit) {
        return function (response) {
          logger.warn('member save error for member:', member, 'response:', response);
          if (audit) {
            audit.auditErrorMessage = response;
          }
        }
      }

      function saveAndAuditMemberUpdate(promises, uploadSessionId, rowNumber, memberAction, changes, auditMessage, member) {

        var audit = new MemberUpdateAuditService({
          uploadSessionId: uploadSessionId,
          updateTime: DateUtils.nowAsValue(),
          memberAction: memberAction,
          rowNumber: rowNumber,
          changes: changes,
          auditMessage: auditMessage
        });

        var qualifier = 'for membership ' + member.membershipNumber;
        member.receivedInLastBulkLoad = true;
        member.lastBulkLoadDate = DateUtils.momentNow().valueOf();
        return DbUtils.auditedSaveOrUpdate(member, auditUpdateCallback(member), auditErrorCallback(member, audit))
          .then(function (savedMember) {
            if (savedMember) {
              audit.memberId = MemberService.extractMemberId(savedMember);
              notify.success({title: 'Bulk member load ' + qualifier + ' was successful', message: auditMessage})
            } else {
              audit.member = member;
              audit.memberAction = 'error';
              logger.warn('member was not saved, so saving it to audit:', audit);
              notify.warning({title: 'Bulk member load ' + qualifier + ' failed', message: auditMessage})
            }
            logger.debug('saveAndAuditMemberUpdate:', audit);
            promises.push(audit.$save());
            return promises;
          });
      }

      function convertMembershipExpiryDate(ramblersMember) {
        var dataValue = ramblersMember.membershipExpiryDate ? DateUtils.asValueNoTime(ramblersMember.membershipExpiryDate, 'DD/MM/YYYY') : ramblersMember.membershipExpiryDate;
        logger.debug('ramblersMember', ramblersMember, 'membershipExpiryDate', ramblersMember.membershipExpiryDate, '->', DateUtils.displayDate(dataValue));
        return dataValue;
      }

      function createOrUpdateMember(uploadSessionId, recordIndex, ramblersMember, promises) {

        var memberAction;
        ramblersMember.membershipExpiryDate = convertMembershipExpiryDate(ramblersMember);
        ramblersMember.groupMember = !ramblersMember.membershipExpiryDate || ramblersMember.membershipExpiryDate >= today;
        var member = _.find(members, function (member) {
          var existingUserName = MemberNamingService.createUserName(ramblersMember);
          var match = member.membershipNumber && member.membershipNumber.toString() === ramblersMember.membershipNumber;
          if (!match && member.userName) {
            match = member.userName === existingUserName;
          }
          noLogger.debug('match', !!(match),
            'ramblersMember.membershipNumber', ramblersMember.membershipNumber,
            'ramblersMember.userName', existingUserName,
            'member.membershipNumber', member.membershipNumber,
            'member.userName', member.userName);
          return match;
        });

        if (member) {
          EmailSubscriptionService.resetUpdateStatusForMember(member);
        } else {
          memberAction = 'created';
          member = new MemberService();
          member.userName = MemberNamingService.createUniqueUserName(ramblersMember, members);
          member.displayName = MemberNamingService.createUniqueDisplayName(ramblersMember, members);
          member.password = RESET_PASSWORD;
          member.expiredPassword = true;
          EmailSubscriptionService.defaultMailchimpSettings(member, true);
          logger.debug('new member created:', member);
        }

        var updateAudit = {auditMessages: [], fieldsChanged: 0, fieldsSkipped: 0};

        _.each([
          {fieldName: 'membershipExpiryDate', writeDataIf: 'changed', type: 'date'},
          {fieldName: 'membershipNumber', writeDataIf: 'changed', type: 'string'},
          {fieldName: 'mobileNumber', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'email', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'firstName', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'lastName', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'postcode', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'groupMember', writeDataIf: 'not-revoked', type: 'boolean'}], function (field) {
          changeAndAuditMemberField(updateAudit, member, ramblersMember, field)
        });

        DbUtils.removeEmptyFieldsIn(member);
        logger.debug('saveAndAuditMemberUpdate -> member:', member, 'updateAudit:', updateAudit);
        return saveAndAuditMemberUpdate(promises, uploadSessionId, recordIndex + 1, memberAction || (updateAudit.fieldsChanged > 0 ? 'updated' : 'skipped'), updateAudit.fieldsChanged, updateAudit.auditMessages.join(', '), member);

      }

      function changeAndAuditMemberField(updateAudit, member, ramblersMember, field) {

        function auditValueForType(field, source) {
          var dataValue = source[field.fieldName];
          switch (field.type) {
            case 'date':
              return ($filter('displayDate')(dataValue) || '(none)');
            case 'boolean':
              return dataValue || false;
            default:
              return dataValue || '(none)';
          }
        }

        var fieldName = field.fieldName;
        var performMemberUpdate = false;
        var auditQualifier = ' not overwritten with ';
        var auditMessage;
        var oldValue = auditValueForType(field, member);
        var newValue = auditValueForType(field, ramblersMember);
        if (field.writeDataIf === 'changed') {
          performMemberUpdate = (oldValue !== newValue) && ramblersMember[fieldName];
        } else if (field.writeDataIf === 'empty') {
          performMemberUpdate = !member[fieldName];
        } else if (field.writeDataIf === 'not-revoked') {
          performMemberUpdate = newValue && (oldValue !== newValue) && !member.revoked;
        } else if (field.writeDataIf) {
          performMemberUpdate = newValue;
        }
        if (performMemberUpdate) {
          auditQualifier = ' updated to ';
          member[fieldName] = ramblersMember[fieldName];
          updateAudit.fieldsChanged++;
        }
        if (oldValue !== newValue) {
          if (!performMemberUpdate) updateAudit.fieldsSkipped++;
          auditMessage = fieldName + ': ' + oldValue + auditQualifier + newValue;
        }
        if ((performMemberUpdate || (oldValue !== newValue)) && auditMessage) {
          updateAudit.auditMessages.push(auditMessage);
        }
      }
    }

    return {
      processMembershipRecords: processMembershipRecords,
    }

  });

