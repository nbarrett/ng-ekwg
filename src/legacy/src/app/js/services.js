angular.module('ekwgApp')
  .factory('DateUtils', function ($log) {

    var logger = $log.getInstance('DateUtils');
    $log.logLevels['DateUtils'] = $log.LEVEL.OFF;

    var formats = {
      displayDateAndTime: 'ddd DD-MMM-YYYY, h:mm:ss a',
      displayDateTh: 'MMMM Do YYYY',
      displayDate: 'ddd DD-MMM-YYYY',
      displayDay: 'dddd MMMM D, YYYY',
      ddmmyyyyWithSlashes: 'DD/MM/YYYY',
      yyyymmdd: 'YYYYMMDD'
    };

    function isDate(value) {
      return value && asMoment(value).isValid();
    }

    function asMoment(dateValue, inputFormat) {
      return moment(dateValue, inputFormat).tz("Europe/London");
    }

    function momentNow() {
      return asMoment();
    }

    function asString(dateValue, inputFormat, outputFormat) {
      var returnValue = dateValue ? asMoment(dateValue, inputFormat).format(outputFormat) : undefined;
      logger.debug('asString: dateValue ->', dateValue, 'inputFormat ->', inputFormat, 'outputFormat ->', outputFormat, 'returnValue ->', returnValue);
      return returnValue;
    }

    function asValue(dateValue, inputFormat) {
      return asMoment(dateValue, inputFormat).valueOf();
    }

    function nowAsValue() {
      return asMoment(undefined, undefined).valueOf();
    }

    function mailchimpDate(dateValue) {
      return asString(dateValue, undefined, formats.ddmmyyyyWithSlashes);
    }

    function displayDateAndTime(dateValue) {
      return asString(dateValue, undefined, formats.displayDateAndTime);
    }

    function displayDate(dateValue) {
      return asString(dateValue, undefined, formats.displayDate);
    }

    function displayDay(dateValue) {
      return asString(dateValue, undefined, formats.displayDay);
    }

    function asValueNoTime(dateValue, inputFormat) {
      var returnValue = asMoment(dateValue, inputFormat).startOf('day').valueOf();
      logger.debug('asValueNoTime: dateValue ->', dateValue, 'returnValue ->', returnValue, '->', displayDateAndTime(returnValue));
      return returnValue;
    }

    function currentMemberBulkLoadDisplayDate() {
      return asString(momentNowNoTime().startOf('month'), undefined, formats.yyyymmdd);
    }

    function momentNowNoTime() {
      return asMoment().startOf('day');
    }

    function convertDateFieldInObject(object, field) {
      var inputValue = object[field];
      object[field] = convertDateField(inputValue);
      return object;
    }

    function convertDateField(inputValue) {
      if (inputValue) {
        var dateValue = asValueNoTime(inputValue);
        if (dateValue !== inputValue) {
          logger.debug('Converting date from', inputValue, '(' + displayDateAndTime(inputValue) + ') to', dateValue, '(' + displayDateAndTime(dateValue) + ')');
          return dateValue;
        } else {
          logger.debug(inputValue, inputValue, 'is already in correct format');
          return inputValue;
        }
      } else {
        logger.debug(inputValue, 'is not a date - no conversion');
        return inputValue;
      }
    }

    return {
      formats: formats,
      displayDateAndTime: displayDateAndTime,
      displayDay: displayDay,
      displayDate: displayDate,
      mailchimpDate: mailchimpDate,
      convertDateFieldInObject: convertDateFieldInObject,
      convertDateField: convertDateField,
      isDate: isDate,
      asMoment: asMoment,
      nowAsValue: nowAsValue,
      momentNow: momentNow,
      momentNowNoTime: momentNowNoTime,
      asString: asString,
      asValue: asValue,
      asValueNoTime: asValueNoTime,
      currentMemberBulkLoadDisplayDate: currentMemberBulkLoadDisplayDate
    };
  })
  .factory('DbUtils', function ($log, DateUtils, LoggedInMemberService, AUDIT_CONFIG) {
    var logger = $log.getInstance('DbUtilsLogger');
    $log.logLevels['DbUtilsLogger'] = $log.LEVEL.OFF;

    function removeEmptyFieldsIn(obj) {
      _.each(obj, function (value, field) {
        logger.debug('processing', typeof(field), 'field', field, 'value', value);
        if (_.contains([null, undefined, ""], value)) {
          logger.debug('removing non-populated', typeof(field), 'field', field);
          delete obj[field];
        }
      });
    }

    function auditedSaveOrUpdate(resource, updateCallback, errorCallback) {
      if (AUDIT_CONFIG.auditSave) {
        if (resource.$id()) {
          resource.updatedDate = DateUtils.nowAsValue();
          resource.updatedBy = LoggedInMemberService.loggedInMember().memberId;
          logger.debug('Auditing save of existing document', resource);
        } else {
          resource.createdDate = DateUtils.nowAsValue();
          resource.createdBy = LoggedInMemberService.loggedInMember().memberId;
          logger.debug('Auditing save of new document', resource);
        }
      } else {
        resource = DateUtils.convertDateFieldInObject(resource, 'createdDate');
        logger.debug('Not auditing save of', resource);

      }
      return resource.$saveOrUpdate(updateCallback, updateCallback, errorCallback || updateCallback, errorCallback || updateCallback)
    }

    return {
      removeEmptyFieldsIn: removeEmptyFieldsIn,
      auditedSaveOrUpdate: auditedSaveOrUpdate,
    }
  })
  .factory('FileUtils', function ($log, DateUtils, URLService, ContentMetaDataService) {
    var logger = $log.getInstance('FileUtils');
    $log.logLevels['FileUtils'] = $log.LEVEL.OFF;

    function basename(path) {
      return path.split(/[\\/]/).pop()
    }

    function path(path) {
      return path.split(basename(path))[0];
    }

    function attachmentTitle(resource, container, resourceName) {
      return (resource && _.isEmpty(getFileNameData(resource, container)) ? 'Attach' : 'Replace') + ' ' + resourceName;
    }

    function getFileNameData(resource, container) {
      return container ? resource[container].fileNameData : resource.fileNameData;
    }

    function resourceUrl(resource, container, metaDataPathSegment) {
      var fileNameData = getFileNameData(resource, container);
      return resource && fileNameData ? URLService.baseUrl() + ContentMetaDataService.baseUrl(metaDataPathSegment) + '/' + fileNameData.awsFileName : '';
    }

    function previewUrl(memberResource) {
      if (memberResource) {
        switch (memberResource.resourceType) {
          case "email":
            return memberResource.data.campaign.archive_url_long;
          case "file":
            return memberResource.data.campaign.archive_url_long;
        }
      }
      var fileNameData = getFileNameData(resource, container);
      return resource && fileNameData ? URLService.baseUrl() + ContentMetaDataService.baseUrl(metaDataPathSegment) + '/' + fileNameData.awsFileName : '';
    }

    function resourceTitle(resource) {
      logger.debug('resourceTitle:resource =>', resource);
      return resource ? (DateUtils.asString(resource.resourceDate, undefined, DateUtils.formats.displayDateTh) + ' - ' + (resource.data ? resource.data.fileNameData.title : "")) : '';
    }

    function fileExtensionIs(fileName, extensions) {
      return _.contains(extensions, fileExtension(fileName));
    }

    function fileExtension(fileName) {
      return fileName ? _.last(fileName.split('.')).toLowerCase() : '';
    }

    function icon(resource, container) {
      var icon = 'icon-default.jpg';
      var fileNameData = getFileNameData(resource, container);
      if (fileNameData && fileExtensionIs(fileNameData.awsFileName, ['doc', 'docx', 'jpg', 'pdf', 'ppt', 'png', 'txt', 'xls', 'xlsx'])) {
        icon = 'icon-' + fileExtension(fileNameData.awsFileName).substring(0, 3) + '.jpg';
      }
      return "assets/images/ramblers/" + icon;
    }

    return {
      fileExtensionIs: fileExtensionIs,
      fileExtension: fileExtension,
      basename: basename,
      path: path,
      attachmentTitle: attachmentTitle,
      resourceUrl: resourceUrl,
      resourceTitle: resourceTitle,
      icon: icon
    }

  })
  .factory('StringUtils', function (DateUtils, $filter) {

    function replaceAll(find, replace, str) {
      return str ? str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace) : str;
    }

    function stripLineBreaks(str, andTrim) {
      var replacedValue = str.replace(/(\r\n|\n|\r)/gm, '');
      return andTrim && replacedValue ? replacedValue.trim() : replacedValue;
    }

    function left(str, chars) {
      return str.substr(0, chars);
    }

    function formatAudit(who, when, members) {
      var by = who ? 'by ' + $filter('memberIdToFullName')(who, members) : '';
      return (who || when) ? by + (who && when ? ' on ' : '') + DateUtils.displayDateAndTime(when) : '(not audited)';
    }

    return {
      left: left,
      replaceAll: replaceAll,
      stripLineBreaks: stripLineBreaks,
      formatAudit: formatAudit
    }
  }).factory('ValidationUtils', function () {
  function fieldPopulated(object, path) {
    return (_.property(path)(object) || "").length > 0;
  }

  return {
    fieldPopulated: fieldPopulated,
  }
})
  .factory('NumberUtils', function ($log) {

    var logger = $log.getInstance('NumberUtils');
    $log.logLevels['NumberUtils'] = $log.LEVEL.OFF;

    function sumValues(items, fieldName) {
      if (!items) return 0;
      return _.chain(items).pluck(fieldName).reduce(function (memo, num) {
        return memo + asNumber(num);
      }, 0).value();
    }

    function generateUid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    function asNumber(numberString, decimalPlaces) {
      if (!numberString) return 0;
      var isNumber = typeof numberString === 'number';
      if (isNumber && !decimalPlaces) return numberString;
      var number = isNumber ? numberString : parseFloat(numberString.replace(/[^\d\.\-]/g, ""));
      if (isNaN(number)) return 0;
      var returnValue = (decimalPlaces) ? (parseFloat(number).toFixed(decimalPlaces)) / 1 : number;
      logger.debug('asNumber:', numberString, decimalPlaces, '->', returnValue);
      return returnValue;
    }

    return {
      asNumber: asNumber,
      sumValues: sumValues,
      generateUid: generateUid
    };
  })
  .factory('ContentMetaData', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('contentMetaData');
  })
  .factory('ConfigData', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('config');
  })
  .factory('Config', function ($log, ConfigData, ErrorMessageService) {
    var logger = $log.getInstance('Config');
    $log.logLevels['Config'] = $log.LEVEL.OFF;

    function getConfig(key, defaultOnEmpty) {

      logger.debug('getConfig:', key, 'defaultOnEmpty:', defaultOnEmpty);

      var queryObject = {};
      queryObject[key] = {$exists: true};
      return ConfigData.query(queryObject, {limit: 1})
        .then(function (results) {
          if (results && results.length > 0) {
            return results[0];
          } else {
            queryObject[key] = {};
            return new ConfigData(defaultOnEmpty || queryObject);
          }
        }, function (response) {
          throw new Error('Query of ' + key + ' config failed: ' + response);
        });

    }

    function saveConfig(key, config, saveCallback, errorSaveCallback) {
      logger.debug('saveConfig:', key);
      if (_.has(config, key)) {
        return config.$saveOrUpdate(saveCallback, saveCallback, errorSaveCallback || saveCallback, errorSaveCallback || saveCallback);
      } else {
        throw new Error('Attempt to save ' + ErrorMessageService.stringify(key) + ' config when ' + ErrorMessageService.stringify(key) + ' parent key not present in data: ' + ErrorMessageService.stringify(config));
      }

    }

    return {
      getConfig: getConfig,
      saveConfig: saveConfig
    }

  })
  .factory('ExpenseClaimsService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('expenseClaims');
  })
  .factory('RamblersUploadAudit', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('ramblersUploadAudit');
  })
  .factory('ErrorTransformerService', function (ErrorMessageService) {
    function transform(errorResponse) {
      var message = ErrorMessageService.stringify(errorResponse);
      var duplicate = s.include(errorResponse, 'duplicate');

      if (duplicate) {
        message = 'Duplicate data was detected. A member record must have a unique Contact Email, Display Name, Ramblers Membership Number and combination of First Name, Last Name and Alias. Please amend the current member and try again.';
      }
      return {duplicate: duplicate, message: message}
    }

    return {transform: transform}
  })
  .factory('ErrorMessageService', function () {

    function stringify(message) {
      return _.isObject(message) ? JSON.stringify(message, censor(message)) : message;
    }

    function censor(censor) {
      var i = 0;

      return function (key, value) {
        if (i !== 0 && typeof(censor) === 'object' && typeof(value) === 'object' && censor === value)
          return '[Circular]';

        if (i >= 29) // seems to be a hard maximum of 30 serialized objects?
          return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
      }
    }

    return {
      stringify: stringify
    }

  });
