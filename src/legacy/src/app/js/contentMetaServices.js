angular.module('ekwgApp')
  .factory('ContentMetaDataService', function (ContentMetaData, $q) {

    var baseUrl = function (metaDataPathSegment) {
      return '/aws/s3/' + metaDataPathSegment;
    };

    var createNewMetaData = function (withDefaults) {
      if (withDefaults) {
        return {image: '/(select file)', text: '(Enter title here)'};
      } else {
        return {};
      }
    };

    var getMetaData = function (contentMetaDataType) {
      var task = $q.defer();
      ContentMetaData.query({contentMetaDataType: contentMetaDataType}, {limit: 1})
        .then(function (results) {
          if (results && results.length > 0) {
            task.resolve(results[0]);
          } else {
            task.resolve(new ContentMetaData({
              contentMetaDataType: contentMetaDataType,
              baseUrl: baseUrl(contentMetaDataType),
              files: [createNewMetaData(true)]
            }));
          }
        }, function (response) {
          task.reject('Query of contentMetaDataType for ' + contentMetaDataType + ' failed: ' + response);
        });
      return task.promise;
    };

    var saveMetaData = function (metaData, saveCallback, errorSaveCallback) {
      return metaData.$saveOrUpdate(saveCallback, saveCallback, errorSaveCallback, errorSaveCallback);
    };

    return {
      baseUrl: baseUrl,
      getMetaData: getMetaData,
      createNewMetaData: createNewMetaData,
      saveMetaData: saveMetaData
    }
  })
  .factory('ContentMetaData', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('contentMetaData');
  })
  .factory('ContentTextService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('contentText');
  })
  .factory('ContentText', function (ContentTextService) {
    function forName(name) {
      return ContentTextService.all().then(function (contentDocuments) {
        return _.findWhere(contentDocuments, {name: name}) || new ContentTextService({name: name});
      });
    }

    return {forName: forName}

  });