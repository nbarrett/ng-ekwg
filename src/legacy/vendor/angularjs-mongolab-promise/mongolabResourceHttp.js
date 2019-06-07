angular.module('mongolabResourceHttp', [])
  .factory('$mongolabResourceHttp', ['MONGOLAB_CONFIG', '$http', '$log', function (MONGOLAB_CONFIG, $http, $log) {

    var logger = $log.getInstance('$mongolabResourceHttp');
    $log.logLevels['$mongolabResourceHttp'] = $log.LEVEL.OFF;

    function MongolabResourceFactory(collectionName) {

      var defaultParams = {};
      if (MONGOLAB_CONFIG.apiKey) {
        defaultParams.apiKey = MONGOLAB_CONFIG.apiKey;
      }
      var dbUrl = MONGOLAB_CONFIG.baseUrl + MONGOLAB_CONFIG.database;
      var collectionUrl = dbUrl + (collectionName === 'runCommand' ? '/runCommand' : '/collections/' + collectionName);

      var resourceRespTransform = function (data) {
        return new Resource(data);
      };

      var resourcesArrayRespTransform = function (data) {
        var result = [];
        for (var i = 0; i < data.length; i++) {
          result.push(new Resource(data[i]));
        }
        return result;
      };

      function extractErrorMessage(response) {
        logger.warn('extractErrorMessage with response', response);
        if (response && response.data && response.data.message) {
          return MONGOLAB_CONFIG.trimErrorMessage ? response.data.message.split('{')[0].trim() : response.data.message;
        } else {
          return response;
        }
      }

      var promiseThen = function (httpPromise, successcb, errorcb, transformFn) {
        return httpPromise.then(function (response) {
          var result = transformFn(response.data);
          (successcb || angular.noop)(result, response.status, response.headers, response.config);
          return result;
        }, function (response) {
          (errorcb || angular.noop)(extractErrorMessage(response), response.status, response.headers, response.config);
          return undefined;
        });
      };

      var preparyQueryParam = function (queryJson) {
        var result = _.isObject(queryJson) && !_.isEmpty(queryJson) ? {q: JSON.stringify(queryJson)} : {};
        logger.info("preparyQueryParam queryJson:", queryJson, "->", result);
        return result;
      };

      var Resource = function (data) {
        angular.extend(this, data);
      };

      Resource.query = function (queryJson, options, successcb, errorcb) {
        logger.info("queryJson", queryJson, "options", options);
        var prepareOptions = function (options) {

          var optionsMapping = {sort: 's', limit: 'l', fields: 'f', skip: 'sk'};
          var optionsTranslated = {};

          if (options && !angular.equals(options, {})) {
            angular.forEach(optionsMapping, function (targetOption, sourceOption) {
              var validatedObject = options[sourceOption];
              logger.info("targetOption", targetOption, "sourceOption", sourceOption, "validatedObject", validatedObject);
              if (angular.isDefined(validatedObject)) {
                if (angular.isObject(validatedObject)) {
                  optionsTranslated[targetOption] = JSON.stringify(validatedObject);
                } else {
                  optionsTranslated[targetOption] = validatedObject;
                }
              }
            });
          }
          return optionsTranslated;
        };

        if (angular.isFunction(options)) {
          errorcb = successcb;
          successcb = options;
          options = {};
        }

        var requestParams = angular.extend({}, defaultParams, preparyQueryParam(queryJson), prepareOptions(options));
        logger.info("Resource.query:requestParams", requestParams, "collectionUrl:", collectionUrl);
        var httpPromise = $http.get(collectionUrl, {params: requestParams});
        return promiseThen(httpPromise, successcb, errorcb, resourcesArrayRespTransform);
      };

      Resource.all = function (options, successcb, errorcb) {
        if (angular.isFunction(options)) {
          errorcb = successcb;
          successcb = options;
          options = {};
        }
        return Resource.query({}, options, successcb, errorcb);
      };

      Resource.count = function (queryJson, successcb, errorcb) {
        var httpPromise = $http.get(collectionUrl, {
          params: angular.extend({}, defaultParams, preparyQueryParam(queryJson), {c: true})
        });
        return promiseThen(httpPromise, successcb, errorcb, function (data) {
          return data;
        });
      };

      Resource.distinct = function (field, queryJson, successcb, errorcb) {
        var httpPromise = $http.post(dbUrl + '/runCommand', angular.extend({}, queryJson || {}, {
          distinct: collectionName,
          key: field
        }), {
          params: defaultParams
        });
        return promiseThen(httpPromise, successcb, errorcb, function (data) {
          return data.values;
        });
      };

      Resource.getById = function (id, successcb, errorcb) {
        var httpPromise = $http.get(collectionUrl + '/' + id, {params: defaultParams});
        return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
      };

      Resource.getByObjectIds = function (ids, successcb, errorcb) {
        var qin = [];
        angular.forEach(ids, function (id) {
          qin.push({$oid: id});
        });
        return Resource.query({_id: {$in: qin}}, successcb, errorcb);
      };

      //instance methods

      Resource.prototype.$id = function () {
        if (this._id && this._id.$oid) {
          return this._id.$oid;
        } else if (this._id) {
          return this._id;
        }
      };

      Resource.prototype.$save = function (successcb, errorcb) {
        //console.log('saving new', this);
        var httpPromise = $http.post(collectionUrl, this, {params: defaultParams});
        return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
      };

      Resource.prototype.$update = function (successcb, errorcb) {
        //console.log('updating existing', this);
        var httpPromise = $http.put(collectionUrl + "/" + this.$id(), angular.extend({}, this, {_id: undefined}), {params: defaultParams});
        return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
      };

      Resource.prototype.$remove = function (successcb, errorcb) {
        var httpPromise = $http['delete'](collectionUrl + "/" + this.$id(), {params: defaultParams});
        return promiseThen(httpPromise, successcb, errorcb, resourceRespTransform);
      };

      Resource.prototype.$saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
        if (this.$id()) {
          return this.$update(updatecb, errorUpdatecb);
        } else {
          return this.$save(savecb, errorSavecb);
        }
      };

      return Resource;
    }

    return MongolabResourceFactory;
  }]);
