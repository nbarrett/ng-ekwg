angular.module('ekwgApp')
  .factory('WalksService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('walks')
  })
  .factory('DbUtils', function ($log, DateUtils, LoggedInMemberService, AUDIT_CONFIG) {
    var logger = $log.getInstance('DbUtilsLogger');
    $log.logLevels['DbUtilsLogger'] = $log.LEVEL.OFF;

    function removeEmptyFieldsIn(obj) {
      _.each(obj, function (value, field) {
        logger.debug('processing', typeof (field), 'field', field, 'value', value);
        if (_.contains([null, undefined, ""], value)) {
          logger.debug('removing non-populated', typeof (field), 'field', field);
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

  }).factory('ValidationUtils', function () {
  function fieldPopulated(object, path) {
    return (_.property(path)(object) || "").length > 0;
  }

  return {
    fieldPopulated: fieldPopulated,
  }
})
  .factory('ContentMetaData', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('contentMetaData');
  })
  .factory('ConfigData', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('config');
  })
  .factory('ExpenseClaimsService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('expenseClaims');
  })
  .factory('RamblersUploadAudit', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('ramblersUploadAudit');
  })
  .factory('ErrorTransformerService', function (StringUtilsService) {
    function transform(errorResponse) {
      var message = StringUtilsService.stringify(errorResponse);
      var duplicate = s.include(errorResponse, 'duplicate');

      if (duplicate) {
        message = 'Duplicate data was detected. A member record must have a unique Contact Email, Display Name, Ramblers Membership Number and combination of First Name, Last Name and Alias. Please amend the current member and try again.';
      }
      return {duplicate: duplicate, message: message}
    }

    return {transform: transform}
  })
