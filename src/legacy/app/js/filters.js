angular.module('ekwgApp')
  .factory('FilterUtils', function () {
    return {
      nameFilter: function (alias) {
        return alias ? 'fullNameWithAlias' : 'fullName';
      }
    };
  })
  .filter('keepLineFeeds', function () {
    return function (input) {
      if (!input) return input;
      return input
        .replace(/(\r\n|\r|\n)/g, '<br/>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;')
        .replace(/ /g, '&nbsp;');
    }
  })
  .filter('lineFeedsToBreaks', function () {
    return function (input) {
      if (!input) return input;
      return input
        .replace(/(\r\n|\r|\n)/g, '<br/>')
    }
  })
  .filter('displayName', function () {
    return function (member) {
      return member === undefined ? null : (member.firstName + ' ' + (member.hideSurname ? '' : member.lastName)).trim();
    }
  })
  .filter('fullName', function () {
    return function (member, defaultValue) {
      return member === undefined ? defaultValue || '(deleted member)' : (member.firstName + ' ' + member.lastName).trim();
    }
  })
  .filter('fullNameWithAlias', function ($filter) {
    return function (member, defaultValue) {
      return member ? ($filter('fullName')(member, defaultValue)) + (member.nameAlias ? ' (' + member.nameAlias + ')' : '') : defaultValue;
    }
  })
  .filter('fullNameWithAliasOrMe', function ($filter, LoggedInMemberService) {
    return function (member, defaultValue, memberId) {
      return member ? (LoggedInMemberService.loggedInMember().memberId === member.$id() && member.$id() === memberId ? "Me" : ($filter('fullName')(member, defaultValue)) + (member.nameAlias ? ' (' + member.nameAlias + ')' : '')) : defaultValue;
    }
  })
  .filter('firstName', function ($filter) {
    return function (member, defaultValue) {
      return s.words($filter('fullName')(member, defaultValue))[0];
    }
  })
  .filter('memberIdsToFullNames', function ($filter) {
    return function (memberIds, members, defaultValue) {
      return _(memberIds).map(function (memberId) {
        return $filter('memberIdToFullName')(memberId, members, defaultValue);
      }).join(', ');
    }
  })
  .filter('memberIdToFullName', function ($filter, MemberService, FilterUtils) {
    return function (memberId, members, defaultValue, alias) {
      return $filter(FilterUtils.nameFilter(alias))(MemberService.toMember(memberId, members), defaultValue);
    }
  })
  .filter('memberIdToFirstName', function ($filter, MemberService) {
    return function (memberId, members, defaultValue) {
      return $filter('firstName')(MemberService.toMember(memberId, members), defaultValue);
    }
  })
  .filter('asMoney', function (NumberUtils) {
    return function (number) {
      return isNaN(number) ? '' : '£' + NumberUtils.asNumber(number).toFixed(2);
    }
  })
  .filter('humanize', function () {
    return function (string) {
      return s.humanize(string);
    }
  })
  .filter('sumValues', function (NumberUtils) {
    return function (items, propertyName) {
      return NumberUtils.sumValues(items, propertyName);
    }
  })
  .filter('walkSummary', function ($filter) {
    return function (walk) {
      return walk === undefined ? null : $filter('displayDate')(walk.walkDate) + " led by " + (walk.displayName || walk.contactName || "unknown") + " (" + (walk.briefDescriptionAndStartPoint || 'no description') + ')';
    }
  })
  .filter('meetupEventSummary', function ($filter) {
    return function (meetupEvent) {
      return meetupEvent ? $filter('displayDate')(meetupEvent.startTime) + " (" + meetupEvent.title + ')' : null;
    }
  })
  .filter('asWalkEventType', function (WalksReferenceService) {
    return function (eventTypeString, field) {
      var eventType = WalksReferenceService.toEventType(eventTypeString);
      return eventType && field ? eventType[field] : eventType;
    }
  })
  .filter('asEventNote', function () {
    return function (event) {
      return _.compact([event.description, event.reason]).join(', ');
    }
  })
  .filter('asChangedItemsTooltip', function ($filter) {
    return function (event, members) {
      return _(event.data).map(function (value, key) {
        return s.humanize(key) + ': ' + $filter('toAuditDeltaValue')(value, key, members);
      }).join(', ');
    }
  })
  .filter('valueOrDefault', function () {
    return function (value, defaultValue) {
      return value || defaultValue || '(none)';
    }
  })
  .filter('toAuditDeltaValue', function ($filter) {
    return function (value, fieldName, members, defaultValue) {
      switch (fieldName) {
        case 'walkDate':
          return $filter('displayDate')(value);
        case 'walkLeaderMemberId':
          return $filter('memberIdToFullName')(value, members, defaultValue);
        default:
          return $filter('valueOrDefault')(value, defaultValue);
      }
    }
  })
  .filter('toAuditDeltaChangedItems', function () {
    return function (dataAuditDeltaInfoItems) {
      return _(dataAuditDeltaInfoItems).pluck('fieldName').map(s.humanize).join(', ');
    }
  })
  .filter('asWalkValidationsList', function () {
    return function (walkValidations) {
      var lastItem = _.last(walkValidations);
      var firstItems = _.without(walkValidations, lastItem);
      var joiner = firstItems.length > 0 ? ' and ' : '';
      return firstItems.join(', ') + joiner + lastItem;
    }
  })
  .filter('idFromRecord', function () {
    return function (mongoRecord) {
      return mongoRecord.$id;
    }
  })
  .filter('eventTimes', function () {
    return function (socialEvent) {
      var eventTimes = socialEvent.eventTimeStart;
      if (socialEvent.eventTimeEnd) eventTimes += ' - ' + socialEvent.eventTimeEnd;
      return eventTimes;
    }
  })
  .filter('displayDate', function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDate(dateValue);
    }
  })
  .filter('displayDay', function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDay(dateValue);
    }
  })
  .filter('displayDates', function ($filter) {
    return function (dateValues) {
      return _(dateValues).map(function (dateValue) {
        return $filter('displayDate')(dateValue);
      }).join(', ');
    }
  })
  .filter('displayDateAndTime', function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDateAndTime(dateValue);
    }
  })
  .filter('fromExcelDate', function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDate(dateValue);
    }
  })
  .filter('lastLoggedInDateDisplayed', function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDateAndTime(dateValue);
    }
  })
  .filter('lastConfirmedDateDisplayed', function (DateUtils) {
    return function (member) {
      return member && member.profileSettingsConfirmedAt ? 'by ' + (member.profileSettingsConfirmedBy || 'member') + ' at ' + DateUtils.displayDateAndTime(member.profileSettingsConfirmedAt) : 'not confirmed yet';
    }
  })
  .filter('createdAudit', function (StringUtils) {
    return function (resource, members) {
      return StringUtils.formatAudit(resource.createdBy, resource.createdDate, members)
    }
  })
  .filter('updatedAudit', function (StringUtils) {
    return function (resource, members) {
      return StringUtils.formatAudit(resource.updatedBy, resource.updatedDate, members)
    }
  });