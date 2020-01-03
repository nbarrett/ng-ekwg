angular.module("ekwgApp")
  .factory("ContentMetaDataService", function (ContentMetaData, $q) {

    const API_PATH_PREFIX = "api/aws/s3/";

    var baseUrl = function (metaDataPathSegment) {
      return "/" + API_PATH_PREFIX + metaDataPathSegment;
    };

    var createNewMetaData = function (withDefaults) {
      if (withDefaults) {
        return {image: "/(select file)", text: "(Enter title here)"};
      } else {
        return {};
      }
    };

    function transform(contentMetaData, contentMetaDataType) {
      var data = _.omit(contentMetaData, "files");
      data.files = _.map(contentMetaData.files, function (file) {
        return {
          image: API_PATH_PREFIX + contentMetaDataType + "/" + _.last(file.image.split("/")),
          text: file.text
        }
      })
      return data;
    }

    var getMetaData = function (contentMetaDataType) {
      return ContentMetaData.query({contentMetaDataType: contentMetaDataType}, {limit: 1})
        .then(function (results) {
          if (results && results.length > 0) {
            return transform(results[0], contentMetaDataType);
          } else {
            return new ContentMetaData({
              contentMetaDataType: contentMetaDataType,
              baseUrl: baseUrl(contentMetaDataType),
              files: [createNewMetaData(true)]
            });
          }
        }, function (response) {
          throw new Error("Query of contentMetaDataType for " + contentMetaDataType + " failed: " + response);
        });
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
  .factory("ContentMetaData", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp("contentMetaData");
  });
