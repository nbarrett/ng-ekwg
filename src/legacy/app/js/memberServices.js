angular.module('ekwgApp')
  .factory('MemberUpdateAuditService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberUpdateAudit');
  })
  .factory('MemberBulkLoadAuditService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberBulkLoadAudit');
  })
  .factory('MemberAuditService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberAudit');
  })
  .factory('ExpenseClaimsService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('expenseClaims');
  })
  .factory('MemberNamingService', function ($log, StringUtils) {

    var logger = $log.getInstance('MemberNamingService');
    $log.logLevels['MemberNamingService'] = $log.LEVEL.OFF;

    var createUserName = function (member) {
      return StringUtils.replaceAll(' ', '', (member.firstName + '.' + member.lastName).toLowerCase());
    };

    function createDisplayName(member) {
      return member.firstName.trim() + ' ' + member.lastName.trim().substring(0, 1).toUpperCase();
    }

    function createUniqueUserName(member, members) {
      return createUniqueValueFrom(createUserName, 'userName', member, members)
    }

    function createUniqueDisplayName(member, members) {
      return createUniqueValueFrom(createDisplayName, 'displayName', member, members)
    }

    function createUniqueValueFrom(nameFunction, field, member, members) {
      var attempts = 0;
      var suffix = "";
      while (true) {
        var createdName = nameFunction(member) + suffix;
        if (!memberFieldExists(field, createdName, members)) {
          return createdName
        } else {
          attempts++;
          suffix = attempts;
        }
      }
    }

    function memberFieldExists(field, value, members) {
      var member = _(members).find(function (member) {
        return member[field] === value;
      });

      var returnValue = member && member[field];
      logger.debug('field', field, 'matching', value, member, '->', returnValue);
      return returnValue;
    }

    return {
      createDisplayName: createDisplayName,
      createUserName: createUserName,
      createUniqueUserName: createUniqueUserName,
      createUniqueDisplayName: createUniqueDisplayName
    };
  })
  .factory('MemberService', function ($mongolabResourceHttp, $log) {

    var logger = $log.getInstance('MemberService');
    var noLogger = $log.getInstance('MemberServiceMuted');
    $log.logLevels['MemberServiceMuted'] = $log.LEVEL.OFF;
    $log.logLevels['MemberService'] = $log.LEVEL.OFF;

    var memberService = $mongolabResourceHttp('members');

    memberService.extractMemberId = function (member) {
      return member.id || member.$id();
    };

    memberService.filterFor = {
      SOCIAL_MEMBERS_SUBSCRIBED: function (member) {
        return member.groupMember && member.socialMember && member.mailchimpLists.socialEvents.subscribed
      },
      WALKS_MEMBERS_SUBSCRIBED: function (member) {
        return member.groupMember && member.mailchimpLists.walks.subscribed
      },
      GENERAL_MEMBERS_SUBSCRIBED: function (member) {
        return member.groupMember && member.mailchimpLists.general.subscribed
      },
      GROUP_MEMBERS: function (member) {
        return member.groupMember;
      },
      COMMITTEE_MEMBERS: function (member) {
        return member.groupMember && member.committee;
      },
      SOCIAL_MEMBERS: function (member) {
        return member.groupMember && member.socialMember;
      },
    };

    memberService.allLimitedFields = function allLimitedFields(filterFunction) {
      return memberService.all({
        fields: {
          mailchimpLists: 1,
          groupMember: 1,
          socialMember: 1,
          financeAdmin: 1,
          treasuryAdmin: 1,
          fileAdmin: 1,
          committee: 1,
          walkChangeNotifications: 1,
          email: 1,
          displayName: 1,
          contactId: 1,
          mobileNumber: 1,
          $id: 1,
          firstName: 1,
          lastName: 1,
          nameAlias: 1
        }
      }).then(function (members) {
        return _.chain(members)
          .filter(filterFunction)
          .sortBy(function (member) {
            return member.firstName + member.lastName;
          }).value();
      });
    };

    memberService.toMember = function (memberIdOrObject, members) {
      var memberId = (_.has(memberIdOrObject, 'id') ? memberIdOrObject.id : memberIdOrObject);
      noLogger.info('toMember:memberIdOrObject', memberIdOrObject, '->', memberId);
      var member = _.find(members, function (member) {
        return member.$id() === memberId;
      });
      noLogger.info('toMember:', memberIdOrObject, '->', member);
      return member;
    };

    memberService.allMemberMembersWithPrivilege = function (privilege, members) {
      var filteredMembers = _.filter(members, function (member) {
        return member.groupMember && member[privilege];
      });
      logger.debug('allMemberMembersWithPrivilege:privilege', privilege, 'filtered from', members.length, '->', filteredMembers.length, 'members ->', filteredMembers);
      return filteredMembers;
    };

    memberService.allMemberIdsWithPrivilege = function (privilege, members) {
      return memberService.allMemberMembersWithPrivilege(privilege, members).map(extractMemberId);

      function extractMemberId(member) {
        return member.$id()
      }
    };

    return memberService;
  });
