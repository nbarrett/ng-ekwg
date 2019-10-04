angular.module('ekwgApp')
  .factory('RamblersHttpService', function ($q, $http) {
    function call(serviceCallType, method, url, data, params) {
      var deferredTask = $q.defer();
      deferredTask.notify(serviceCallType);
      $http({
        method: method,
        data: data,
        params: params,
        url: url
      }).then(function (response) {
        var responseData = response.data;
        if (responseData.error) {
          deferredTask.reject(response);
        } else {
          deferredTask.notify(responseData.information);
          deferredTask.resolve(responseData)
        }
      }).catch(function (response) {
        deferredTask.reject(response);
      });
      return deferredTask.promise;
    }

    return {
      call: call
    }
  })
  .factory('RamblersWalksAndEventsService', function ($log, $rootScope, $http, $q, $filter, StringUtils, DateUtils, RamblersHttpService, LoggedInMemberService, CommitteeReferenceData) {

      var logger = $log.getInstance('RamblersWalksAndEventsService');
      $log.logLevels['RamblersWalksAndEventsService'] = $log.LEVEL.DEBUG;

      function uploadRamblersWalks(data) {
        return RamblersHttpService.call('Upload Ramblers walks', 'POST', 'api/ramblers/gwem/upload-walks', data);
      }

      function listRamblersWalks() {
        return RamblersHttpService.call('List Ramblers walks', 'GET', 'api/ramblers/gwem/list-walks');
      }

      var walkDescriptionPrefix = function () {
        return RamblersHttpService.call('Ramblers description Prefix', 'GET', 'api/ramblers/gwem/walk-description-prefix');
      };

      var walkBaseUrl = function () {
        return RamblersHttpService.call('Ramblers walk url', 'GET', 'api/ramblers/gwem/walk-base-url');
      };

      function exportWalksFileName(omitExtension) {
        return 'walks-export-' + DateUtils.asMoment().format('DD-MMMM-YYYY-HH-mm') + (omitExtension ? '' : '.csv');
      }

      function exportableWalks(walkExports) {
        return _.chain(walkExports)
          .filter(function (walkExport) {
            return walkExport.selected;
          })
          .sortBy(function (walkExport) {
            return walkExport.walk.walkDate;
          })
          .value();
      }

      function exportWalks(walkExports, members) {
        return _(exportableWalks(walkExports)).pluck('walk').map(function (walk) {
          return walkToCsvRecord(walk, members)
        });
      }

      function createWalksForExportPrompt(walks, members) {
        return listRamblersWalks()
          .then(updateWalksWithRamblersWalkData(walks))
          .then(function (updatedWalks) {
            return returnWalksExport(updatedWalks, members);
          });
      }

      function updateWalksWithRamblersWalkData(walks) {
        var unreferencedList = collectExistingRamblersIdsFrom(walks);
        logger.debug(unreferencedList.length, ' existing ramblers walk(s) found', unreferencedList);
        return function (ramblersWalksResponses) {
          var savePromises = [];
          _(ramblersWalksResponses.responseData).each(function (ramblersWalksResponse) {
            var foundWalk = _.find(walks, function (walk) {
              return DateUtils.asString(walk.walkDate, undefined, 'dddd, Do MMMM YYYY') === ramblersWalksResponse.ramblersWalkDate
            });

            if (!foundWalk) {
              logger.debug('no match found for ramblersWalksResponse', ramblersWalksResponse);
            } else {
              unreferencedList = _.without(unreferencedList, ramblersWalksResponse.ramblersWalkId);
              if (foundWalk && foundWalk.ramblersWalkId !== ramblersWalksResponse.ramblersWalkId) {
                logger.debug('updating walk from', foundWalk.ramblersWalkId || 'empty', '->', ramblersWalksResponse.ramblersWalkId, 'on', $filter('displayDate')(foundWalk.walkDate));
                foundWalk.ramblersWalkId = ramblersWalksResponse.ramblersWalkId;
                savePromises.push(foundWalk.$saveOrUpdate())
              } else {
                logger.debug('no update required for walk', foundWalk.ramblersWalkId, foundWalk.walkDate, DateUtils.displayDay(foundWalk.walkDate));
              }
            }
          });

          if (unreferencedList.length > 0) {
            logger.debug('removing old ramblers walk(s)', unreferencedList, 'from existing walks');
            _.chain(unreferencedList)
              .each(function (ramblersWalkId) {
                var walk = _.findWhere(walks, {ramblersWalkId: ramblersWalkId});
                if (walk) {
                  logger.debug('removing ramblers walk', walk.ramblersWalkId, 'from walk on', $filter('displayDate')(walk.walkDate));
                  delete walk.ramblersWalkId;
                  savePromises.push(walk.$saveOrUpdate())
                }
              }).value();
          }
          return $q.all(savePromises).then(function () {
            return walks;
          });
        }
      }

      function collectExistingRamblersIdsFrom(walks) {
        return _.chain(walks)
          .filter(function (walk) {
            return walk.ramblersWalkId;
          })
          .map(function (walk) {
            return walk.ramblersWalkId;
          })
          .value();
      }

      function returnWalksExport(walks, members) {
        var todayValue = DateUtils.momentNowNoTime().valueOf();
        return _.chain(walks)
          .filter(function (walk) {
            return (walk.walkDate >= todayValue) && walk.briefDescriptionAndStartPoint;
          })
          .sortBy(function (walk) {
            return walk.walkDate;
          })
          .map(function (walk) {
            return validateWalk(walk, members);
          })
          .value();
      }

      function uploadToRamblers(walkExports, members, notify) {
        notify.setBusy();
        logger.debug('sourceData', walkExports);
        var deleteWalks = _.chain(exportableWalks(walkExports)).pluck('walk')
          .filter(function (walk) {
            return walk.ramblersWalkId;
          }).map(function (walk) {
            return walk.ramblersWalkId;
          }).value();
        let rows = exportWalks(walkExports, members);
        let fileName = exportWalksFileName();
        var data = {
          headings: exportColumnHeadings(),
          rows: rows,
          fileName: fileName,
          deleteWalks: deleteWalks,
          ramblersUser: LoggedInMemberService.loggedInMember().firstName
        };
        logger.debug('exporting', data);
        notify.warning({
          title: 'Ramblers walks upload',
          message: 'Uploading ' + rows.length + ' walk(s) to Ramblers...'
        });
        return uploadRamblersWalks(data)
          .then(function (response) {
            notify.warning({
              title: 'Ramblers walks upload',
              message: 'Upload of ' + rows.length + ' walk(s) to Ramblers has been submitted. Monitor the Walk upload audit tab for progress'
            });
            logger.debug('success response data', response);
            notify.clearBusy();
            return fileName;
          })
          .catch(function (response) {
            logger.debug('error response data', response);
            notify.error({
              title: 'Ramblers walks upload failed',
              message: response
            });
            notify.clearBusy();
          });
      }

      function validateWalk(walk, members) {
        var validationMessages = [];
        if (_.isEmpty(walk)) {
          validationMessages.push('walk does not exist');
        } else {
          if (_.isEmpty(walkTitle(walk))) validationMessages.push('title is missing');
          if (_.isEmpty(walkDistanceMiles(walk))) validationMessages.push('distance is missing');
          if (_.isEmpty(walk.startTime)) validationMessages.push('start time is missing');
          if (walkStartTime(walk) === 'Invalid date') validationMessages.push('start time [' + walk.startTime + '] is invalid');
          if (_.isEmpty(walk.grade)) validationMessages.push('grade is missing');
          if (_.isEmpty(walk.longerDescription)) validationMessages.push('description is missing');
          if (_.isEmpty(walk.postcode) && _.isEmpty(walk.gridReference)) validationMessages.push('both postcode and grid reference are missing');
          if (_.isEmpty(walk.contactId)) {
            var contactIdMessage = LoggedInMemberService.allowWalkAdminEdits() ? 'this can be supplied for this walk on Walk Leader tab' : 'this will need to be setup for you by ' + CommitteeReferenceData.contactUsField('walks', 'fullName');
            validationMessages.push('walk leader has no Ramblers contact Id setup on their member record (' + contactIdMessage + ')');
          }
          if (_.isEmpty(walk.displayName) && _.isEmpty(walk.displayName)) validationMessages.push('displayName for walk leader is missing');
        }
        return {
          walk: walk,
          validationMessages: validationMessages,
          publishedOnRamblers: walk && !_.isEmpty(walk.ramblersWalkId),
          selected: walk && walk.ramblersPublish && validationMessages.length === 0 && _.isEmpty(walk.ramblersWalkId)
        }
      }

      var nearestTown = function (walk) {
        return walk.nearestTown ? 'Nearest Town is ' + walk.nearestTown : '';
      };


      function walkTitle(walk) {
        var walkDescription = [];
        if (walk.briefDescriptionAndStartPoint) walkDescription.push(walk.briefDescriptionAndStartPoint);
        return _.chain(walkDescription).map(replaceSpecialCharacters).value().join('. ');
      }

      function walkDescription(walk) {
        return replaceSpecialCharacters(walk.longerDescription);
      }

      function walkType(walk) {
        return walk.walkType || "Circular";
      }

      function asString(value) {
        return value ? value : '';
      }

      function contactDisplayName(walk) {
        return walk.displayName ? replaceSpecialCharacters(_.first(walk.displayName.split(' '))) : '';
      }

      function contactIdLookup(walk, members) {
        if (walk.contactId) {
          return walk.contactId;
        } else {
          var member = _(members).find(function (member) {
            return member.$id() === walk.walkLeaderMemberId;
          });

          var returnValue = member && member.contactId;
          logger.debug('contactId: for walkLeaderMemberId', walk.walkLeaderMemberId, '->', returnValue);
          return returnValue;
        }
      }

      function replaceSpecialCharacters(value) {
        return value ? value
            .replace("’", "'")
            .replace("é", "e")
            .replace("â€™", "'")
            .replace('â€¦', '…')
            .replace('â€“', '–')
            .replace('â€™', '’')
            .replace('â€œ', '“')
            .replace(/(\r\n|\n|\r)/gm, " ")
          : '';
      }

      function walkDistanceMiles(walk) {
        return walk.distance ? String(parseFloat(walk.distance).toFixed(1)) : '';
      }

      function walkStartTime(walk) {
        return walk.startTime ? DateUtils.asString(walk.startTime, 'HH mm', 'HH:mm') : '';
      }

      function walkGridReference(walk) {
        return walk.gridReference ? walk.gridReference : '';
      }

      function walkPostcode(walk) {
        return walk.gridReference ? '' : walk.postcode ? walk.postcode : '';
      }

      function walkDate(walk) {
        return DateUtils.asString(walk.walkDate, undefined, 'DD-MM-YYYY');
      }

      function exportColumnHeadings() {
        return [
          "Date",
          "Title",
          "Description",
          "Linear or Circular",
          "Starting postcode",
          "Starting gridref",
          "Starting location details",
          "Show exact starting point",
          "Start time",
          "Show exact meeting point?",
          "Meeting time",
          "Restriction",
          "Difficulty",
          "Local walk grade",
          "Distance miles",
          "Contact id",
          "Contact display name"
        ];
      }

      function walkToCsvRecord(walk, members) {
        return {
          "Date": walkDate(walk),
          "Title": walkTitle(walk),
          "Description": walkDescription(walk),
          "Linear or Circular": walkType(walk),
          "Starting postcode": walkPostcode(walk),
          "Starting gridref": walkGridReference(walk),
          "Starting location details": nearestTown(walk),
          "Show exact starting point": "Yes",
          "Start time": walkStartTime(walk),
          "Show exact meeting point?": "Yes",
          "Meeting time": walkStartTime(walk),
          "Restriction": "Public",
          "Difficulty": asString(walk.grade),
          "Local walk grade": asString(walk.grade),
          "Distance miles": walkDistanceMiles(walk),
          "Contact id": contactIdLookup(walk, members),
          "Contact display name": contactDisplayName(walk)
        };
      }

      return {
        uploadToRamblers: uploadToRamblers,
        validateWalk: validateWalk,
        walkDescriptionPrefix: walkDescriptionPrefix,
        walkBaseUrl: walkBaseUrl,
        exportWalksFileName: exportWalksFileName,
        createWalksForExportPrompt: createWalksForExportPrompt,
        exportWalks: exportWalks,
        exportableWalks: exportableWalks,
        exportColumnHeadings: exportColumnHeadings
      }
    }
  );
