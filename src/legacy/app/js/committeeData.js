angular.module('ekwgApp')
  .factory('CommitteeConfig', function (Config) {

    function getConfig() {
      return Config.getConfig('committee', {
        committee: {
          contactUs: {
            chairman: {description: 'Chairman', fullName: 'Claire Mansfield', email: 'chairman@ekwg.co.uk'},
            secretary: {description: 'Secretary', fullName: 'Kerry O\'Grady', email: 'secretary@ekwg.co.uk'},
            treasurer: {description: 'Treasurer', fullName: 'Marianne Christensen', email: 'treasurer@ekwg.co.uk'},
            membership: {description: 'Membership', fullName: 'Desiree Nel', email: 'membership@ekwg.co.uk'},
            social: {description: 'Social Co-ordinator', fullName: 'Suzanne Graham Beer', email: 'social@ekwg.co.uk'},
            walks: {description: 'Walks Co-ordinator', fullName: 'Stuart Maisner', email: 'walks@ekwg.co.uk'},
            support: {description: 'Technical Support', fullName: 'Nick Barrett', email: 'nick.barrett@ekwg.co.uk'}
          },
          fileTypes: [
            {description: "AGM Agenda", public: true},
            {description: "AGM Minutes", public: true},
            {description: "Committee Meeting Agenda"},
            {description: "Committee Meeting Minutes"},
            {description: "Financial Statements", public: true}
          ]
        }
      })
    }

    function saveConfig(config, saveCallback, errorSaveCallback) {
      return Config.saveConfig('committee', config, saveCallback, errorSaveCallback);
    }

    return {
      getConfig: getConfig,
      saveConfig: saveConfig
    }

  })
  .factory('CommitteeFileService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('committeeFiles');
  })
  .factory('CommitteeReferenceData', function ($rootScope) {

    var refData = {
      contactUsRoles: function () {
        var keys = _.keys(refData.contactUs);
        if (keys.length > 0) {
          return keys;
        }
      },
      contactUsField: function (role, field) {
        return refData.contactUs && refData.contactUs[role][field]
      },
      fileTypesField: function (type, field) {
        return refData.fileTypes && refData.fileTypes[type][field]
      },
      toFileType: function (fileTypeDescription, fileTypes) {
        return _.find(fileTypes, {description: fileTypeDescription});
      },
      contactUsRolesAsArray: function () {
        return _.map(refData.contactUs, function (data, type) {
          return {
            type: type,
            fullName: data.fullName,
            memberId: data.memberId,
            description: data.description + ' (' + data.fullName + ')',
            email: data.email
          };
        });
      }
    };
    $rootScope.$on('CommitteeReferenceDataReady', function () {
      refData.ready = true;
    });
    return refData;
  })
  .factory('CommitteeQueryService', function ($q, $log, $filter, $routeParams, URLService, CommitteeFileService, CommitteeReferenceData, DateUtils, LoggedInMemberService, WalksService, SocialEventsService) {

      var logger = $log.getInstance('CommitteeQueryService');
      $log.logLevels['CommitteeQueryService'] = $log.LEVEL.OFF;

      function groupEvents(groupEvents) {
        logger.debug('groupEvents', groupEvents);
        var fromDate = DateUtils.convertDateField(groupEvents.fromDate);
        var toDate = DateUtils.convertDateField(groupEvents.toDate);
        logger.debug('groupEvents:fromDate', $filter('displayDate')(fromDate), 'toDate', $filter('displayDate')(toDate));
        var events = [];
        var promises = [];
        if (groupEvents.includeWalks) promises.push(
          WalksService.query({walkDate: {$gte: fromDate, $lte: toDate}})
            .then(function (walks) {
              return _.map(walks, function (walk) {
                return events.push({
                  id: walk.$id(),
                  selected: true,
                  eventType: 'Walk',
                  area: 'walks',
                  type: 'walk',
                  eventDate: walk.walkDate,
                  eventTime: walk.startTime,
                  distance: walk.distance,
                  postcode: walk.postcode,
                  title: walk.briefDescriptionAndStartPoint || 'Awaiting walk details',
                  description: walk.longerDescription,
                  contactName: walk.displayName || 'Awaiting walk leader',
                  contactPhone: walk.contactPhone,
                  contactEmail: walk.contactEmail
                });
              })
            }));
        if (groupEvents.includeCommitteeEvents) promises.push(
          CommitteeFileService.query({eventDate: {$gte: fromDate, $lte: toDate}})
            .then(function (committeeFiles) {
              return _.map(committeeFiles, function (committeeFile) {
                return events.push({
                  id: committeeFile.$id(),
                  selected: true,
                  eventType: 'AGM & Committee',
                  area: 'committee',
                  type: 'committeeFile',
                  eventDate: committeeFile.eventDate,
                  postcode: committeeFile.postcode,
                  description: committeeFile.fileType,
                  title: committeeFile.fileNameData.title
                });
              })
            }));
        if (groupEvents.includeSocialEvents) promises.push(
          SocialEventsService.query({eventDate: {$gte: fromDate, $lte: toDate}})
            .then(function (socialEvents) {
              return _.map(socialEvents, function (socialEvent) {
                return events.push({
                  id: socialEvent.$id(),
                  selected: true,
                  eventType: 'Social Event',
                  area: 'social',
                  type: 'socialEvent',
                  eventDate: socialEvent.eventDate,
                  eventTime: socialEvent.eventTimeStart,
                  postcode: socialEvent.postcode,
                  title: socialEvent.briefDescription,
                  description: socialEvent.longerDescription,
                  contactName: socialEvent.displayName,
                  contactPhone: socialEvent.contactPhone,
                  contactEmail: socialEvent.contactEmail
                });
              })
            }));

        return $q.all(promises).then(function () {
          logger.debug('performed total of', promises.length, 'events of length', events.length);
          return _.chain(events)
            .sortBy('eventDate')
            .value();
        });
      }

      function committeeFilesLatestFirst(committeeFiles) {
        return _.chain(committeeFiles)
          .sortBy('eventDate')
          .reverse()
          .value();
      }

      function latestYear(committeeFiles) {
        return _.first(
          _.chain(committeeFilesLatestFirst(committeeFiles))
            .pluck('eventDate')
            .map(function (eventDate) {
              return parseInt(DateUtils.asString(eventDate, undefined, 'YYYY'));
            })
            .value());
      }

      function committeeFilesForYear(year, committeeFiles) {

        var latestYearValue = latestYear(committeeFiles);

        return _.filter(committeeFilesLatestFirst(committeeFiles), function (committeeFile) {
          var fileYear = extractYear(committeeFile);
          return (fileYear === year) || (!fileYear && (latestYearValue === year));
        });
      }

      function extractYear(committeeFile) {
        return parseInt(DateUtils.asString(committeeFile.eventDate, undefined, 'YYYY'));
      }

      function committeeFileYears(committeeFiles) {

        var latestYearValue = latestYear(committeeFiles);

        function addLatestYearFlag(committeeFileYear) {
          return {year: committeeFileYear, latestYear: latestYearValue === committeeFileYear};
        }

        var years = _.chain(committeeFiles)
          .map(extractYear)
          .unique()
          .sort()
          .map(addLatestYearFlag)
          .reverse()
          .value();
        logger.debug('committeeFileYears', years);
        return years.length === 0 ? [{year: latestYear(committeeFiles), latestYear: true}] : years;
      }

      function committeeFiles(notify) {
        notify.progress('Refreshing Committee files...');

        function queryCommitteeFiles() {
          if (URLService.hasRouteParameter('committeeFileId')) {
            return CommitteeFileService.getById($routeParams.committeeFileId)
              .then(function (committeeFile) {
                if (!committeeFile) notify.error('Committee file could not be found. Try opening again from the link in the notification email');
                return [committeeFile];
              });
          } else {
            return CommitteeFileService.all().then(function (files) {
              return filterCommitteeFiles(files);
            });
          }
        }

        return queryCommitteeFiles()
          .then(function (committeeFiles) {
            notify.progress('Found ' + committeeFiles.length + ' committee file(s)');
            notify.setReady();
            return _.chain(committeeFiles)
              .sortBy('fileDate')
              .reverse()
              .sortBy('createdDate')
              .value();
          }, notify.error);
      }

      function filterCommitteeFiles(files) {
        logger.debug('filterCommitteeFiles files ->', files);
        var filteredFiles = _.filter(files, function (file) {
          return CommitteeReferenceData.fileTypes && CommitteeReferenceData.toFileType(file.fileType, CommitteeReferenceData.fileTypes).public || LoggedInMemberService.allowCommittee() || LoggedInMemberService.allowFileAdmin();
        });
        logger.debug('filterCommitteeFiles in ->', files && files.length, 'out ->', filteredFiles.length, 'CommitteeReferenceData.fileTypes', CommitteeReferenceData.fileTypes);
        return filteredFiles
      }

      return {
        groupEvents: groupEvents,
        committeeFiles: committeeFiles,
        latestYear: latestYear,
        committeeFileYears: committeeFileYears,
        committeeFilesForYear: committeeFilesForYear
      }
    }
  );
