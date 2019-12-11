angular.module('ekwgApp')
  .factory('MemberResourcesService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberResources');
  })
  .factory('MemberResourcesReferenceData', function ($log, URLService, ContentMetaDataService, FileUtils, MemberLoginService, SiteEditService) {
    var logger = $log.getInstance('MemberResourcesReferenceData');
    $log.logLevels['MemberResourcesReferenceData'] = $log.LEVEL.OFF;
    const subjects = [
      {
        id: "newsletter",
        description: "Newsletter"
      },
      {
        id: "siteReleaseNote",
        description: "Site Release Note"
      },
      {
        id: "walkPlanning",
        description: "Walking Planning Advice"
      }
    ];
    const resourceTypes = [
      {
        id: "email",
        description: "Email",
        action: "View email",
        icon: function () {
          return "assets/images/local/mailchimp.ico"
        },
        resourceUrl: function (memberResource) {
          var data = _.property(['data', 'campaign', 'archive_url_long'])(memberResource);
          logger.debug('email:resourceUrl for', memberResource, data);
          return data;
        }
      },
      {
        id: "file",
        description: "File",
        action: "Download",
        icon: function (memberResource) {
          return FileUtils.icon(memberResource, 'data')
        },
        resourceUrl: function (memberResource) {
          var data = memberResource && memberResource.data.fileNameData ? URLService.baseUrl() + ContentMetaDataService.baseUrl("memberResources") + "/" + memberResource.data.fileNameData.awsFileName : "";
          logger.debug('file:resourceUrl for', memberResource, data);
          return data;
        }
      },
      {
        id: "url",
        action: "View page",
        description: "External Link",
        icon: function () {
          return "assets/images/ramblers/favicon.ico"
        },
        resourceUrl: function () {
          return "TBA";
        }
      }
    ];
    const accessLevels = [
      {
        id: "hidden",
        description: "Hidden",
        filter: function () {
          return SiteEditService.active() || false;
        }
      },
      {
        id: "committee",
        description: "Committee",
        filter: function () {
          return SiteEditService.active() || MemberLoginService.allowCommittee();
        }
      },
      {
        id: "loggedInMember",
        description: "Logged-in member",
        filter: function () {
          return SiteEditService.active() || MemberLoginService.memberLoggedIn();
        }
      },
      {
        id: "public",
        description: "Public",
        filter: function () {
          return true;
        }
      }];

    function resourceTypeFor(resourceType) {
      var type = _.find(resourceTypes, function (type) {
        return type.id === resourceType;
      });
      logger.debug('resourceType for', type, type);
      return type;
    }

    function accessLevelFor(accessLevel) {
      var level = _.find(accessLevels, function (level) {
        return level.id === accessLevel;
      });
      logger.debug('accessLevel for', accessLevel, level);
      return level;
    }

    return {
      subjects: subjects,
      resourceTypes: resourceTypes,
      accessLevels: accessLevels,
      resourceTypeFor: resourceTypeFor,
      accessLevelFor: accessLevelFor
    };
  });
