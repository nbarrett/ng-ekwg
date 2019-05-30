/* concatenated from src/legacy/src/app/js/globals.js */

(function () {
  if (!window.console) {
    window.console = {};
  }
  var m = [
    "log", "info", "warn", "error", "debug", "trace", "dir", "group",
    "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
    "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
  ];
  for (var i = 0; i < m.length; i++) {
    if (!window.console[m[i]]) {
      window.console[m[i]] = function() {};
    }
  }
  _.mixin({
    compactObject: function(o) {
      _.each(o, function(v, k) {
        if(!v) {
          delete o[k];
        }
      });
      return o;
    }
  });
})();

/* concatenated from src/legacy/src/app/js/app.js */

const mainPages = {
  HOME: "/",
  WALKS: "/walks",
  SOCIAL: "/social",
  JOIN_US: "/join-us",
  CONTACT_US: "/contact-us",
  COMMITTEE: "/committee",
  ADMIN: "/admin",
  HOW_TO: "/how-to"
};

angular.module("ekwgApp", [
  "btford.markdown",
  "ngRoute",
  "ngSanitize",
  "ui.bootstrap",
  "angularModalService",
  "btford.markdown",
  "mongolabResourceHttp",
  "ngAnimate",
  "ngCookies",
  "ngFileUpload",
  "ngSanitize",
  "ui.bootstrap",
  "ui.select",
  "angular-logger",
  "ezfb",
  "ngCsv"])
  .constant("MONGOLAB_CONFIG", {
    trimErrorMessage: false,
    baseUrl: "/databases/",
    database: "ekwg"
  })
  .constant("AUDIT_CONFIG", {
    auditSave: true,
  })
  .constant("PAGE_CONFIG", {
    mainPages: mainPages
  })
  .config(["$compileProvider", function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|tel):/);
  }])
  .constant("MAILCHIMP_APP_CONSTANTS", {
    allowSendCampaign: true,
    apiServer: "https://us3.admin.mailchimp.com"
  })
  .config(["$locationProvider", function ($locationProvider) {
    $locationProvider.hashPrefix("");
  }])
  .config(["$routeProvider", "uiSelectConfig", "uibDatepickerConfig", "uibDatepickerPopupConfig", "logEnhancerProvider", function ($routeProvider, uiSelectConfig, uibDatepickerConfig, uibDatepickerPopupConfig, logEnhancerProvider) {
    uiSelectConfig.theme = "bootstrap";
    uiSelectConfig.closeOnSelect = false;

    $routeProvider
      .when(mainPages.ADMIN + "/expenseId/:expenseId", {
        controller: "AdminController",
        templateUrl: "ekwg-legacy/partials/admin/admin.html",
        title: "expenses"
      })
      .when(mainPages.ADMIN + "/:area?", {
        controller: "AdminController",
        templateUrl: "ekwg-legacy/partials/admin/admin.html",
        title: "admin"
      })
      .when(mainPages.COMMITTEE + "/committeeFileId/:committeeFileId", {
        controller: "CommitteeController", templateUrl: "ekwg-legacy/partials/committee/committee.html", title: "AGM and committee"
      })
      .when(mainPages.COMMITTEE, {
        controller: "CommitteeController", templateUrl: "ekwg-legacy/partials/committee/committee.html", title: "AGM and committee"
      })
      .when(mainPages.HOW_TO, {
        controller: "HowToController",
        templateUrl: "ekwg-legacy/partials/howTo/how-to.html",
        title: "How-to"
      })
      .when("/image-editor/:imageSource", {
        controller: "ImageEditController", templateUrl: "ekwg-legacy/partials/imageEditor/image-editor.html", title: "image editor"
      })
      .when(mainPages.JOIN_US, {
        controller: "HomeController", templateUrl: "ekwg-legacy/partials/joinUs/join-us.html", title: "join us"
      })
      .when("/letterhead/:firstPart?/:secondPart", {
        controller: "LetterheadController", templateUrl: "ekwg-legacy/partials/letterhead/letterhead.html", title: "letterhead"
      })
      .when(mainPages.CONTACT_US, {
        controller: "ContactUsController", templateUrl: "ekwg-legacy/partials/contactUs/contact-us.html", title: "contact us"
      })
      .when("/links", {redirectTo: mainPages.CONTACT_US})
      .when(mainPages.SOCIAL + "/socialEventId/:socialEventId", {
        controller: "SocialEventsController", templateUrl: "ekwg-legacy/partials/socialEvents/social.html", title: "social"
      })
      .when(mainPages.SOCIAL + "/:area?", {
        controller: "SocialEventsController", templateUrl: "ekwg-legacy/partials/socialEvents/social.html", title: "social"
      })
      .when(mainPages.WALKS + "/walkId/:walkId", {
        controller: "WalksController", templateUrl: "ekwg-legacy/partials/walks/walks.html", title: "walks"
      })
      .when(mainPages.WALKS + "/:area?", {
        controller: "WalksController", templateUrl: "ekwg-legacy/partials/walks/walks.html", title: "walks"
      })
      .when(mainPages.HOME, {
        controller: "HomeController", templateUrl: "ekwg-legacy/partials/home/home.html", title: "home"
      })
      .when("/set-password/:passwordResetId", {
        controller: "AuthenticationModalsController",
        templateUrl: "ekwg-legacy/partials/home/home.html"
      })
      .otherwise({
        controller: "AuthenticationModalsController",
        templateUrl: "ekwg-legacy/partials/home/home.html"
      });

    uibDatepickerConfig.startingDay = 1;
    uibDatepickerConfig.showWeeks = false;
    uibDatepickerPopupConfig.datepickerPopup = "dd-MMM-yyyy";
    uibDatepickerPopupConfig.formatDay = "dd";
    logEnhancerProvider.datetimePattern = "hh:mm:ss";
    logEnhancerProvider.prefixPattern = "%s - %s -";
  }])
  .run(["$log", "$rootScope", "$route", "URLService", "CommitteeConfig", "CommitteeReferenceData", function ($log, $rootScope, $route, URLService, CommitteeConfig, CommitteeReferenceData) {
    var logger = $log.getInstance("App.run");
    $log.logLevels["App.run"] = $log.LEVEL.OFF;

    $rootScope.$on('$locationChangeStart', function (evt, absNewUrl, absOldUrl) {
    });
    $rootScope.$on("$locationChangeSuccess", function (event, newUrl, absOldUrl) {
      if (!$rootScope.pageHistory) $rootScope.pageHistory = [];
      $rootScope.pageHistory.push(URLService.relativeUrl(newUrl));
      logger.info("newUrl", newUrl, "$rootScope.pageHistory", $rootScope.pageHistory);
    });
    $rootScope.$on("$routeChangeSuccess", function (currentRoute, previousRoute) {
      $rootScope.title = $route.current.title;
    });
    CommitteeConfig.getConfig()
      .then(function (config) {
        angular.extend(CommitteeReferenceData, config.committee);
        $rootScope.$broadcast("CommitteeReferenceDataReady", CommitteeReferenceData);
      });
  }]);


/* concatenated from src/legacy/src/app/js/admin.js */

angular.module('ekwgApp')
  .controller('AdminController',
    ["$rootScope", "$scope", "LoggedInMemberService", function($rootScope, $scope, LoggedInMemberService) {

      function setViewPriveleges() {
        $scope.loggedIn = LoggedInMemberService.memberLoggedIn();
        $scope.memberAdmin = LoggedInMemberService.allowMemberAdminEdits();
        LoggedInMemberService.showLoginPromptWithRouteParameter('expenseId');
      }

      setViewPriveleges();

      $scope.$on('memberLoginComplete', function() {
        setViewPriveleges();
      });

      $scope.$on('memberLogoutComplete', function() {
        setViewPriveleges();
      });

    }]
  );


/* concatenated from src/legacy/src/app/js/authenticationModalsController.js */

angular.module('ekwgApp')
  .controller("AuthenticationModalsController", ["$log", "$scope", "URLService", "$location", "$routeParams", "AuthenticationModalsService", "LoggedInMemberService", function ($log, $scope, URLService, $location, $routeParams, AuthenticationModalsService, LoggedInMemberService) {
      var logger = $log.getInstance("AuthenticationModalsController");
      $log.logLevels["AuthenticationModalsController"] = $log.LEVEL.OFF;
    var urlFirstSegment = URLService.relativeUrlFirstSegment();
    logger.info("URLService.relativeUrl:", urlFirstSegment, "$routeParams:", $routeParams);
      switch (urlFirstSegment) {
        case "/login":
          return AuthenticationModalsService.showLoginDialog();
        case "/logout":
          return LoggedInMemberService.logout();
        case "/mailing-preferences":
          if (LoggedInMemberService.memberLoggedIn()) {
            return AuthenticationModalsService.showMailingPreferencesDialog(LoggedInMemberService.loggedInMember().memberId);
          } else {
            return URLService.setRoot();
          }
        case "/forgot-password":
          return AuthenticationModalsService.showForgotPasswordModal();
        case "/set-password":
          return LoggedInMemberService.getMemberByPasswordResetId($routeParams.passwordResetId)
            .then(function (member) {
              logger.info("for $routeParams.passwordResetId", $routeParams.passwordResetId, "member", member);
              if (_.isEmpty(member)) {
                return AuthenticationModalsService.showResetPasswordFailedDialog();
              } else {
                return AuthenticationModalsService.showResetPasswordModal(member.userName)
              }
            });
        default:
          logger.warn(URLService.relativeUrl(), "doesnt match any of the supported urls");
          return URLService.setRoot();
      }
    }]
  );

/* concatenated from src/legacy/src/app/js/authenticationModalsService.js */

angular.module('ekwgApp')
  .factory("AuthenticationModalsService", ["$log", "ModalService", "URLService", function ($log, ModalService, URLService) {

    var logger = $log.getInstance("AuthenticationModalsService");
    $log.logLevels["AuthenticationModalsService"] = $log.LEVEL.OFF;

    function showForgotPasswordModal() {
      logger.info('called showForgotPasswordModal');
      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/index/forgotten-password-dialog.html",
        controller: "ForgotPasswordController",
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('close event with result', result);
          if (!result) URLService.navigateBackToLastMainPage();
        });
      }).catch(function (error) {
        logger.warn("error happened:", error);
      })
    }

    function showResetPasswordModal(userName, message) {
      logger.info('called showResetPasswordModal for userName', userName);
      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/index/reset-password-dialog.html",
        controller: "ResetPasswordController",
        inputs: {userName: userName, message: message},
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('showResetPasswordModal close event with result', result);
          if (!result) URLService.navigateBackToLastMainPage();
        });
      })
    }

    function showLoginDialog() {
      logger.info('called showLoginDialog');
      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/index/login-dialog.html",
        controller: "LoginController",
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('showLoginDialog close event with result', result);
          if (!result) URLService.navigateBackToLastMainPage();
        });
      })
    }


    function showResetPasswordFailedDialog() {
      logger.info('called showResetPasswordFailedDialog');

      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/index/reset-password-failed-dialog.html",
        controller: "ResetPasswordFailedController",
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('showResetPasswordFailedDialog modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('showResetPasswordFailedDialog close event with result', result);
          if (!result) URLService.navigateBackToLastMainPage();
        });
      })
    }

    function showMailingPreferencesDialog(memberId) {
      logger.info('called showMailingPreferencesDialog');
      ModalService.closeModals(true);
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/index/mailing-preferences-dialog.html",
        controller: "MailingPreferencesController",
        inputs: {memberId: memberId},
        preClose: function (modal) {
          modal.element.modal('hide');
        }
      }).then(function (modal) {
        logger.info('showMailingPreferencesDialog modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.info('close event with result', result);
          if (!result) URLService.navigateBackToLastMainPage();
        });
      })
    }


    return {
      showResetPasswordModal: showResetPasswordModal,
      showResetPasswordFailedDialog: showResetPasswordFailedDialog,
      showForgotPasswordModal: showForgotPasswordModal,
      showLoginDialog: showLoginDialog,
      showMailingPreferencesDialog: showMailingPreferencesDialog
    }

  }]);



/* concatenated from src/legacy/src/app/js/awsServices.js */

angular.module('ekwgApp')
  .factory('AWSConfig', ["$http", "HTTPResponseService", function ($http, HTTPResponseService) {

    function getConfig() {
      return $http.get('/aws/config').then(HTTPResponseService.returnResponse);
    }

    function awsPolicy(fileType, objectKey) {
      return $http.get('/aws/s3Policy?mimeType=' + fileType + '&objectKey=' + objectKey).then(HTTPResponseService.returnResponse);
    }

    return {
      getConfig: getConfig,
      awsPolicy: awsPolicy
    }
  }])
  .factory('EKWGFileUpload', ["$log", "AWSConfig", "NumberUtils", "Upload", function ($log, AWSConfig, NumberUtils, Upload) {
    $log.logLevels['EKWGFileUpload'] = $log.LEVEL.OFF;

    var logger = $log.getInstance('EKWGFileUpload');
    var awsConfig;

    AWSConfig.getConfig().then(function (config) {
      awsConfig = config;
    });

    function onFileSelect(file, notify, objectKey) {
      logger.debug(file, objectKey);

      function generateFileNameData() {
        return {
          originalFileName: file.name,
          awsFileName: NumberUtils.generateUid() + '.' + _.last(file.name.split('.'))
        };
      }

      var fileNameData = generateFileNameData(), fileUpload = file;
      fileUpload.progress = parseInt(0);
      logger.debug('uploading fileNameData', fileNameData);
      return AWSConfig.awsPolicy(file.type, objectKey)
        .then(function (response) {
          var s3Params = response;
          var url = 'https://' + awsConfig.bucket + '.s3.amazonaws.com/';
          return Upload.upload({
            url: url,
            method: 'POST',
            data: {
              'key': objectKey + '/' + fileNameData.awsFileName,
              'acl': 'public-read',
              'Content-Type': file.type,
              'AWSAccessKeyId': s3Params.AWSAccessKeyId,
              'success_action_status': '201',
              'Policy': s3Params.s3Policy,
              'Signature': s3Params.s3Signature
            },
            file: file
          }).then(function (response) {
            fileUpload.progress = parseInt(100);
            if (response.status === 201) {
              var data = xml2json.parser(response.data),
                parsedData;
              parsedData = {
                location: data.postresponse.location,
                bucket: data.postresponse.bucket,
                key: data.postresponse.key,
                etag: data.postresponse.etag
              };
              logger.debug('parsedData', parsedData);
              return fileNameData;
            } else {
              notify.error('Upload Failed for file ' + fileNameData);
            }
          }, notify.error, function (evt) {
            fileUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
          });
        });
    }

    return {onFileSelect: onFileSelect};

  }]);




/* concatenated from src/legacy/src/app/js/batchGeoServices.js */

angular.module('ekwgApp')
  .factory('BatchGeoExportService', ["StringUtils", "DateUtils", "$filter", function(StringUtils, DateUtils, $filter) {

    function exportWalksFileName() {
      return 'batch-geo-walks-export-' + DateUtils.asMoment().format('DD-MMMM-YYYY-HH-mm') + '.csv'
    }

    function exportableWalks(walks) {
      return _(walks).sortBy('walkDate');
    }

    function exportWalks(walks) {
      return _.chain(walks)
        .filter(filterWalk)
        .sortBy('walkDate')
        .last(250)
        .map(walkToCsvRecord)
        .value();
    }

    function filterWalk(walk) {
      return _.has(walk, 'briefDescriptionAndStartPoint')
        && (_.has(walk, 'gridReference') || _.has(walk, 'postcode'));
    }

    function exportColumnHeadings() {
      return [
        "Walk Date",
        "Start Time",
        "Postcode",
        "Contact Name/Email",
        "Distance",
        "Description",
        "Longer Description",
        "Grid Ref"
      ];
    }

    function walkToCsvRecord(walk) {
      return {
        "walkDate": walkDate(walk),
        "startTime": walkStartTime(walk),
        "postcode": walkPostcode(walk),
        "displayName": contactDisplayName(walk),
        "distance": walkDistanceMiles(walk),
        "description": walkTitle(walk),
        "longerDescription": walkDescription(walk),
        "gridRef": walkGridReference(walk)
      };
    }

    function walkTitle(walk) {
      var walkDescription = [];
      if (walk.includeWalkDescriptionPrefix) walkDescription.push(walk.walkDescriptionPrefix);
      if (walk.briefDescriptionAndStartPoint) walkDescription.push(walk.briefDescriptionAndStartPoint);
      return _.chain(walkDescription).map(replaceSpecialCharacters).value().join('. ');
    }

    function walkDescription(walk) {
      return replaceSpecialCharacters(walk.longerDescription);
    }

    function asString(value) {
      return value ? value : '';
    }

    function contactDisplayName(walk) {
      return walk.displayName ? replaceSpecialCharacters(_.first(walk.displayName.split(' '))) : '';
    }

    function replaceSpecialCharacters(value) {
      return value ? StringUtils.stripLineBreaks(value
        .replace("’", "'")
        .replace("é", "e")
        .replace("â€™", "'")
        .replace('â€¦', '…')
        .replace('â€“', '–')
        .replace('â€™', '’')
        .replace('â€œ', '“')) : '';
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
      return walk.postcode ? walk.postcode : '';
    }

    function walkDate(walk) {
      return $filter('displayDate')(walk.walkDate);
    }

    return {
      exportWalksFileName: exportWalksFileName,
      exportWalks: exportWalks,
      exportableWalks: exportableWalks,
      exportColumnHeadings: exportColumnHeadings
    }
  }]);

/* concatenated from src/legacy/src/app/js/bulkUploadServices.js */

angular.module('ekwgApp')
  .factory('MemberBulkUploadService', ["$log", "$q", "$filter", "MemberService", "MemberUpdateAuditService", "MemberBulkLoadAuditService", "ErrorMessageService", "EmailSubscriptionService", "DateUtils", "DbUtils", "MemberNamingService", function ($log, $q, $filter, MemberService, MemberUpdateAuditService, MemberBulkLoadAuditService, ErrorMessageService, EmailSubscriptionService, DateUtils, DbUtils, MemberNamingService) {

    var logger = $log.getInstance('MemberBulkUploadService');
    var noLogger = $log.getInstance('NoLogger');
    $log.logLevels['MemberBulkUploadService'] = $log.LEVEL.OFF;
    $log.logLevels['NoLogger'] = $log.LEVEL.OFF;
    var RESET_PASSWORD = 'changeme';

    function processMembershipRecords(file, memberBulkLoadServerResponse, members, notify) {
      notify.setBusy();
      var today = DateUtils.momentNowNoTime().valueOf();
      var promises = [];
      var memberBulkLoadResponse = memberBulkLoadServerResponse.data;
      logger.debug('received', memberBulkLoadResponse);
      return DbUtils.auditedSaveOrUpdate(new MemberBulkLoadAuditService(memberBulkLoadResponse))
        .then(function (auditResponse) {
          var uploadSessionId = auditResponse.$id();
          return processBulkLoadResponses(promises, uploadSessionId);
        });

      function updateGroupMembersPreBulkLoadProcessing(promises) {
        if (memberBulkLoadResponse.members && memberBulkLoadResponse.members.length > 1) {
          notify.progress('Processing ' + members.length + ' members ready for bulk load');

          _.each(members, function (member) {
            if (member.receivedInLastBulkLoad) {
              member.receivedInLastBulkLoad = false;
              promises.push(DbUtils.auditedSaveOrUpdate(member, auditUpdateCallback(member), auditErrorCallback(member)));
            }
          });
          return $q.all(promises).then(function () {
            notify.progress('Marked ' + promises.length + ' out of ' + members.length + ' in preparation for update');
            return promises;
          });
        } else {
          return $q.when(promises);
        }
      }

      function processBulkLoadResponses(promises, uploadSessionId) {
        return updateGroupMembersPreBulkLoadProcessing(promises).then(function (updatedPromises) {
          _.each(memberBulkLoadResponse.members, function (ramblersMember, recordIndex) {
            createOrUpdateMember(uploadSessionId, recordIndex, ramblersMember, updatedPromises);
          });
          return $q.all(updatedPromises).then(function () {
            logger.debug('performed total of', updatedPromises.length, 'audit or member updates');
            return updatedPromises;
          });
        });
      }

      function auditUpdateCallback(member) {
        return function (response) {
          logger.debug('auditUpdateCallback for member:', member, 'response', response);
        }
      }

      function auditErrorCallback(member, audit) {
        return function (response) {
          logger.warn('member save error for member:', member, 'response:', response);
          if (audit) {
            audit.auditErrorMessage = response;
          }
        }
      }

      function saveAndAuditMemberUpdate(promises, uploadSessionId, rowNumber, memberAction, changes, auditMessage, member) {

        var audit = new MemberUpdateAuditService({
          uploadSessionId: uploadSessionId,
          updateTime: DateUtils.nowAsValue(),
          memberAction: memberAction,
          rowNumber: rowNumber,
          changes: changes,
          auditMessage: auditMessage
        });

        var qualifier = 'for membership ' + member.membershipNumber;
        member.receivedInLastBulkLoad = true;
        member.lastBulkLoadDate = DateUtils.momentNow().valueOf();
        return DbUtils.auditedSaveOrUpdate(member, auditUpdateCallback(member), auditErrorCallback(member, audit))
          .then(function (savedMember) {
            if (savedMember) {
              audit.memberId = savedMember.$id();
              notify.success({title: 'Bulk member load ' + qualifier + ' was successful', message: auditMessage})
            } else {
              audit.member = member;
              audit.memberAction = 'error';
              logger.warn('member was not saved, so saving it to audit:', audit);
              notify.warning({title: 'Bulk member load ' + qualifier + ' failed', message: auditMessage})
            }
            logger.debug('saveAndAuditMemberUpdate:', audit);
            promises.push(audit.$save());
            return promises;
          });
      }

      function convertMembershipExpiryDate(ramblersMember) {
        var dataValue = ramblersMember.membershipExpiryDate ? DateUtils.asValueNoTime(ramblersMember.membershipExpiryDate, 'DD/MM/YYYY') : ramblersMember.membershipExpiryDate;
        logger.debug('ramblersMember', ramblersMember, 'membershipExpiryDate', ramblersMember.membershipExpiryDate, '->', DateUtils.displayDate(dataValue));
        return dataValue;
      }

      function createOrUpdateMember(uploadSessionId, recordIndex, ramblersMember, promises) {

        var memberAction;
        ramblersMember.membershipExpiryDate = convertMembershipExpiryDate(ramblersMember);
        ramblersMember.groupMember = !ramblersMember.membershipExpiryDate || ramblersMember.membershipExpiryDate >= today;
        var member = _.find(members, function (member) {
          var existingUserName = MemberNamingService.createUserName(ramblersMember);
          var match = member.membershipNumber && member.membershipNumber.toString() === ramblersMember.membershipNumber;
          if (!match && member.userName) {
            match = member.userName === existingUserName;
          }
          noLogger.debug('match', !!(match),
            'ramblersMember.membershipNumber', ramblersMember.membershipNumber,
            'ramblersMember.userName', existingUserName,
            'member.membershipNumber', member.membershipNumber,
            'member.userName', member.userName);
          return match;
        });

        if (member) {
          EmailSubscriptionService.resetUpdateStatusForMember(member);
        } else {
          memberAction = 'created';
          member = new MemberService();
          member.userName = MemberNamingService.createUniqueUserName(ramblersMember, members);
          member.displayName = MemberNamingService.createUniqueDisplayName(ramblersMember, members);
          member.password = RESET_PASSWORD;
          member.expiredPassword = true;
          EmailSubscriptionService.defaultMailchimpSettings(member, true);
          logger.debug('new member created:', member);
        }

        var updateAudit = {auditMessages: [], fieldsChanged: 0, fieldsSkipped: 0};

        _.each([
          {fieldName: 'membershipExpiryDate', writeDataIf: 'changed', type: 'date'},
          {fieldName: 'membershipNumber', writeDataIf: 'changed', type: 'string'},
          {fieldName: 'mobileNumber', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'email', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'firstName', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'lastName', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'postcode', writeDataIf: 'empty', type: 'string'},
          {fieldName: 'groupMember', writeDataIf: 'not-revoked', type: 'boolean'}], function (field) {
          changeAndAuditMemberField(updateAudit, member, ramblersMember, field)
        });

        DbUtils.removeEmptyFieldsIn(member);
        logger.debug('saveAndAuditMemberUpdate -> member:', member, 'updateAudit:', updateAudit);
        return saveAndAuditMemberUpdate(promises, uploadSessionId, recordIndex + 1, memberAction || (updateAudit.fieldsChanged > 0 ? 'updated' : 'skipped'), updateAudit.fieldsChanged, updateAudit.auditMessages.join(', '), member);

      }

      function changeAndAuditMemberField(updateAudit, member, ramblersMember, field) {

        function auditValueForType(field, source) {
          var dataValue = source[field.fieldName];
          switch (field.type) {
            case 'date':
              return ($filter('displayDate')(dataValue) || '(none)');
            case 'boolean':
              return dataValue || false;
            default:
              return dataValue || '(none)';
          }
        }

        var fieldName = field.fieldName;
        var performMemberUpdate = false;
        var auditQualifier = ' not overwritten with ';
        var auditMessage;
        var oldValue = auditValueForType(field, member);
        var newValue = auditValueForType(field, ramblersMember);
        if (field.writeDataIf === 'changed') {
          performMemberUpdate = (oldValue !== newValue) && ramblersMember[fieldName];
        } else if (field.writeDataIf === 'empty') {
          performMemberUpdate = !member[fieldName];
        } else if (field.writeDataIf === 'not-revoked') {
          performMemberUpdate = newValue && (oldValue !== newValue) && !member.revoked;
        } else if (field.writeDataIf) {
          performMemberUpdate = newValue;
        }
        if (performMemberUpdate) {
          auditQualifier = ' updated to ';
          member[fieldName] = ramblersMember[fieldName];
          updateAudit.fieldsChanged++;
        }
        if (oldValue !== newValue) {
          if (!performMemberUpdate) updateAudit.fieldsSkipped++;
          auditMessage = fieldName + ': ' + oldValue + auditQualifier + newValue;
        }
        if ((performMemberUpdate || (oldValue !== newValue)) && auditMessage) {
          updateAudit.auditMessages.push(auditMessage);
        }
      }
    }

    return {
      processMembershipRecords: processMembershipRecords,
    }

  }]);



/* concatenated from src/legacy/src/app/js/clipboardService.js */

angular.module('ekwgApp')
  .factory('ClipboardService', ["$compile", "$rootScope", "$document", "$log", function ($compile, $rootScope, $document, $log) {
    return {
      copyToClipboard: function (element) {
        var logger = $log.getInstance("ClipboardService");
        $log.logLevels['ClipboardService'] = $log.LEVEL.OFF;

        var copyElement = angular.element('<span id="clipboard-service-copy-id">' + element + '</span>');
        var body = $document.find('body').eq(0);
        body.append($compile(copyElement)($rootScope));

        var ClipboardServiceElement = angular.element(document.getElementById('clipboard-service-copy-id'));
        logger.debug(ClipboardServiceElement);
        var range = document.createRange();

        range.selectNode(ClipboardServiceElement[0]);

        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        var successful = document.execCommand('copy');

        var msg = successful ? 'successful' : 'unsuccessful';
        logger.debug('Copying text command was ' + msg);
        window.getSelection().removeAllRanges();

        copyElement.remove();
      }
    }
  }]);


/* concatenated from src/legacy/src/app/js/comitteeNotifications.js */

angular.module('ekwgApp')
  .controller('CommitteeNotificationsController', ["$window", "$log", "$sce", "$timeout", "$templateRequest", "$compile", "$q", "$rootScope", "$scope", "$filter", "$routeParams", "$location", "URLService", "DateUtils", "NumberUtils", "LoggedInMemberService", "MemberService", "ContentMetaDataService", "CommitteeFileService", "MailchimpSegmentService", "MailchimpCampaignService", "MAILCHIMP_APP_CONSTANTS", "MailchimpConfig", "Notifier", "CommitteeReferenceData", "CommitteeQueryService", "committeeFile", "close", function ($window, $log, $sce, $timeout, $templateRequest, $compile, $q, $rootScope, $scope, $filter, $routeParams,
                                                            $location, URLService, DateUtils, NumberUtils, LoggedInMemberService, MemberService,
                                                            ContentMetaDataService, CommitteeFileService, MailchimpSegmentService, MailchimpCampaignService,
                                                            MAILCHIMP_APP_CONSTANTS, MailchimpConfig, Notifier, CommitteeReferenceData, CommitteeQueryService, committeeFile, close) {

      var logger = $log.getInstance('CommitteeNotificationsController');
      $log.logLevels['CommitteeNotificationsController'] = $log.LEVEL.OFF;
      $scope.notify = {};
      var notify = Notifier($scope.notify);
      notify.setBusy();

      $scope.members = [];
      $scope.committeeFile = committeeFile;
      $scope.roles = {signoff: CommitteeReferenceData.contactUsRolesAsArray(), replyTo: []};
      $scope.committeeFileBaseUrl = ContentMetaDataService.baseUrl('committeeFiles');

      function loggedOnRole() {
        var memberId = LoggedInMemberService.loggedInMember().memberId;
        var loggedOnRoleData = _(CommitteeReferenceData.contactUsRolesAsArray()).find(function (role) {
          return role.memberId === memberId
        });
        logger.debug('loggedOnRole for', memberId, '->', loggedOnRoleData);
        return loggedOnRoleData || {};
      }

      $scope.fromDateCalendar = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.fromDateCalendar.opened = true;
        }
      };

      $scope.toDateCalendar = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.toDateCalendar.opened = true;
        }
      };

      $scope.populateGroupEvents = function () {
        notify.setBusy();
        populateGroupEvents().then(function () {
          notify.clearBusy();
          return true;
        })
      };

      function populateGroupEvents() {
        return CommitteeQueryService.groupEvents($scope.userEdits.groupEvents)
          .then(function (events) {
            $scope.userEdits.groupEvents.events = events;
            logger.debug('groupEvents', events);
            return events;
          });
      }

      $scope.changeGroupEventSelection = function (groupEvent) {
        groupEvent.selected = !groupEvent.selected;
      };

      $scope.notification = {
        editable: {
          text: '',
          signoffText: 'If you have any questions about the above, please don\'t hesitate to contact me.\n\nBest regards,',
        },
        destinationType: 'committee',
        includeSignoffText: true,
        addresseeType: 'Hi *|FNAME|*,',
        addingNewFile: false,
        recipients: [],
        groupEvents: function () {
          return _.filter($scope.userEdits.groupEvents.events, function (groupEvent) {
            logger.debug('notification.groupEvents ->', groupEvent);
            return groupEvent.selected;
          });
        },
        signoffAs: {
          include: true,
          value: loggedOnRole().type || 'secretary'
        },
        includeDownloadInformation: $scope.committeeFile,
        title: 'Committee Notification',
        text: function () {
          return $filter('lineFeedsToBreaks')($scope.notification.editable.text);
        },
        signoffText: function () {
          return $filter('lineFeedsToBreaks')($scope.notification.editable.signoffText);
        }
      };

      if ($scope.committeeFile) {
        $scope.notification.title = $scope.committeeFile.fileType;
        $scope.notification.editable.text = 'This is just a quick note to let you know in case you are interested, that I\'ve uploaded a new file to the EKWG website. The file information is as follows:';
      }

      logger.debug('initialised on open: committeeFile', $scope.committeeFile, ', roles', $scope.roles);
      logger.debug('initialised on open: notification ->', $scope.notification);

      $scope.userEdits = {
        sendInProgress: false,
        cancelled: false,
        groupEvents: {
          events: [],
          fromDate: DateUtils.momentNowNoTime().valueOf(),
          toDate: DateUtils.momentNowNoTime().add(2, 'weeks').valueOf(),
          includeContact: true,
          includeDescription: true,
          includeLocation: true,
          includeWalks: true,
          includeSocialEvents: true,
          includeCommitteeEvents: true
        },
        allGeneralSubscribedList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.GENERAL_MEMBERS_SUBSCRIBED)
            .map(toSelectGeneralMember).value();
        },
        allWalksSubscribedList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.WALKS_MEMBERS_SUBSCRIBED)
            .map(toSelectWalksMember).value();
        },
        allSocialSubscribedList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED)
            .map(toSelectSocialMember).value();
        },
        allCommitteeList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.COMMITTEE_MEMBERS)
            .map(toSelectGeneralMember).value();
        },
        replyToRole: function () {
          return _($scope.roles.replyTo).find(function (role) {
            return role.type === $scope.socialEvent.notification.items.replyTo.value;
          });
        },
        notReady: function () {
          return $scope.members.length === 0 || $scope.userEdits.sendInProgress || ($scope.notification.recipients.length === 0 && $scope.notification.destinationType === 'custom');
        }
      };

      function toSelectGeneralMember(member) {
        var memberGrouping;
        var order;
        if (member.groupMember && member.mailchimpLists.general.subscribed) {
          memberGrouping = 'Subscribed to general emails';
          order = 0;
        } else if (member.groupMember && !member.mailchimpLists.general.subscribed) {
          memberGrouping = 'Not subscribed to general emails';
          order = 1;
        } else if (!member.groupMember) {
          memberGrouping = 'Not a group member';
          order = 2;
        } else {
          memberGrouping = 'Unexpected state';
          order = 3;
        }
        return {
          id: member.$id(),
          order: order,
          memberGrouping: memberGrouping,
          text: $filter('fullNameWithAlias')(member)
        };
      }

      function toSelectWalksMember(member) {
        var memberGrouping;
        var order;
        if (member.groupMember && member.mailchimpLists.walks.subscribed) {
          memberGrouping = 'Subscribed to walks emails';
          order = 0;
        } else if (member.groupMember && !member.mailchimpLists.walks.subscribed) {
          memberGrouping = 'Not subscribed to walks emails';
          order = 1;
        } else if (!member.groupMember) {
          memberGrouping = 'Not a group member';
          order = 2;
        } else {
          memberGrouping = 'Unexpected state';
          order = 3;
        }
        return {
          id: member.$id(),
          order: order,
          memberGrouping: memberGrouping,
          text: $filter('fullNameWithAlias')(member)
        };
      }

      function toSelectSocialMember(member) {
        var memberGrouping;
        var order;
        if (member.groupMember && member.mailchimpLists.socialEvents.subscribed) {
          memberGrouping = 'Subscribed to social emails';
          order = 0;
        } else if (member.groupMember && !member.mailchimpLists.socialEvents.subscribed) {
          memberGrouping = 'Not subscribed to social emails';
          order = 1;
        } else if (!member.groupMember) {
          memberGrouping = 'Not a group member';
          order = 2;
        } else {
          memberGrouping = 'Unexpected state';
          order = 3;
        }
        return {
          id: member.$id(),
          order: order,
          memberGrouping: memberGrouping,
          text: $filter('fullNameWithAlias')(member)
        };
      }

      $scope.editAllEKWGRecipients = function () {
        $scope.notification.destinationType = 'custom';
        $scope.notification.campaignId = campaignIdFor('general');
        $scope.notification.list = 'general';
        $scope.notification.recipients = $scope.userEdits.allGeneralSubscribedList();
        $scope.campaignIdChanged();
      };

      $scope.editAllWalksRecipients = function () {
        $scope.notification.destinationType = 'custom';
        $scope.notification.campaignId = campaignIdFor('walks');
        $scope.notification.list = 'walks';
        $scope.notification.recipients = $scope.userEdits.allWalksSubscribedList();
        $scope.campaignIdChanged();
      };

      $scope.editAllSocialRecipients = function () {
        $scope.notification.destinationType = 'custom';
        $scope.notification.campaignId = campaignIdFor('socialEvents');
        $scope.notification.list = 'socialEvents';
        $scope.notification.recipients = $scope.userEdits.allSocialSubscribedList();
        $scope.campaignIdChanged();
      };

      $scope.editCommitteeRecipients = function () {
        $scope.notification.destinationType = 'custom';
        $scope.notification.campaignId = campaignIdFor('committee');
        $scope.notification.list = 'general';
        $scope.notification.recipients = $scope.userEdits.allCommitteeList();
        $scope.campaignIdChanged();
      };

      $scope.clearRecipientsForCampaignOfType = function (campaignType) {
        $scope.notification.customCampaignType = campaignType;
        $scope.notification.campaignId = campaignIdFor(campaignType);
        $scope.notification.list = 'general';
        $scope.notification.recipients = [];
        $scope.campaignIdChanged();
      };

      $scope.fileUrl = function () {
        return $scope.committeeFile && $scope.committeeFile.fileNameData ? URLService.baseUrl() + $scope.committeeFileBaseUrl + '/' + $scope.committeeFile.fileNameData.awsFileName : '';
      };

      $scope.fileTitle = function () {
        return $scope.committeeFile ? DateUtils.asString($scope.committeeFile.eventDate, undefined, DateUtils.formats.displayDateTh) + ' - ' + $scope.committeeFile.fileNameData.title : '';
      };

      function campaignIdFor(campaignType) {
        switch (campaignType) {
          case 'committee':
            return $scope.config.mailchimp.campaigns.committee.campaignId;
          case 'general':
            return $scope.config.mailchimp.campaigns.newsletter.campaignId;
          case 'socialEvents':
            return $scope.config.mailchimp.campaigns.socialEvents.campaignId;
          case 'walks':
            return $scope.config.mailchimp.campaigns.walkNotification.campaignId;
          default:
            return $scope.config.mailchimp.campaigns.committee.campaignId;
        }
      }

      function campaignInfoForCampaign(campaignId) {
        return _.chain($scope.config.mailchimp.campaigns)
          .map(function (data, campaignType) {
            var campaignData = _.extend({campaignType: campaignType}, data);
            logger.debug('campaignData for', campaignType, '->', campaignData);
            return campaignData;
          }).find({campaignId: campaignId})
          .value();
      }

      $scope.campaignIdChanged = function () {
        var infoForCampaign = campaignInfoForCampaign($scope.notification.campaignId);
        logger.debug('for campaignId', $scope.notification.campaignId, 'infoForCampaign', infoForCampaign);
        if (infoForCampaign) {
          $scope.notification.title = infoForCampaign.name;
        }
      };

      $scope.confirmSendNotification = function (dontSend) {
        $scope.userEdits.sendInProgress = true;
        var campaignName = $scope.notification.title;
        notify.setBusy();
        return $q.when(templateFor('ekwg-legacy/partials/committee/committee-notification.html'))
          .then(renderTemplateContent)
          .then(populateContentSections)
          .then(sendEmailCampaign)
          .then(notifyEmailSendComplete)
          .catch(handleNotificationError);

        function templateFor(template) {
          return $templateRequest($sce.getTrustedResourceUrl(template))
        }

        function handleNotificationError(errorResponse) {
          $scope.userEdits.sendInProgress = false;
          notify.clearBusy();
          notify.error({
            title: 'Your notification could not be sent',
            message: (errorResponse.message || errorResponse) + (errorResponse.error ? ('. Error was: ' + JSON.stringify(errorResponse.error)) : '')
          });
        }

        function renderTemplateContent(templateData) {
          var task = $q.defer();
          var templateFunction = $compile(templateData);
          var templateElement = templateFunction($scope);
          $timeout(function () {
            $scope.$digest();
            task.resolve(templateElement.html());
          });
          return task.promise;
        }

        function populateContentSections(notificationText) {
          logger.debug('populateContentSections -> notificationText', notificationText);
          return {
            sections: {
              notification_text: notificationText
            }
          };
        }

        function sendEmailCampaign(contentSections) {
          notify.progress(dontSend ? ('Preparing to complete ' + campaignName + ' in Mailchimp') : ('Sending ' + campaignName));
          return MailchimpConfig.getConfig()
            .then(function (config) {
              var replyToRole = $scope.notification.signoffAs.value || 'secretary';
              logger.debug('replyToRole', replyToRole);

              var members;
              var list = $scope.notification.list;
              var otherOptions = {
                from_name: CommitteeReferenceData.contactUsField(replyToRole, 'fullName'),
                from_email: CommitteeReferenceData.contactUsField(replyToRole, 'email'),
                list_id: config.mailchimp.lists[list]
              };
              logger.debug('Sending ' + campaignName, 'with otherOptions', otherOptions);
              var segmentId = config.mailchimp.segments[list].committeeSegmentId;
              var campaignId = $scope.notification.campaignId;
              switch ($scope.notification.destinationType) {
                case 'custom':
                  members = $scope.notification.recipients;
                  break;
                case 'committee':
                  members = $scope.userEdits.allCommitteeList();
                  break;
                default:
                  members = [];
                  break;
              }

              logger.debug('sendCommitteeNotification:notification->', $scope.notification);

              if (members.length === 0) {
                logger.debug('about to replicateAndSendWithOptions to', list, 'list with campaignName', campaignName, 'campaign Id', campaignId, 'dontSend', dontSend);
                return MailchimpCampaignService.replicateAndSendWithOptions({
                  campaignId: campaignId,
                  campaignName: campaignName,
                  contentSections: contentSections,
                  otherSegmentOptions: otherOptions,
                  dontSend: dontSend
                }).then(openInMailchimpIf(dontSend));
              } else {
                var segmentName = MailchimpSegmentService.formatSegmentName('Committee Notification Recipients');
                return MailchimpSegmentService.saveSegment(list, {segmentId: segmentId}, members, segmentName, $scope.members)
                  .then(function (segmentResponse) {
                    logger.debug('segmentResponse following save segment of segmentName:', segmentName, '->', segmentResponse);
                    logger.debug('about to replicateAndSendWithOptions to committee with campaignName', campaignName, 'campaign Id', campaignId, 'segmentId', segmentResponse.segment.id);
                    return MailchimpCampaignService.replicateAndSendWithOptions({
                      campaignId: campaignId,
                      campaignName: campaignName,
                      contentSections: contentSections,
                      segmentId: segmentResponse.segment.id,
                      otherSegmentOptions: otherOptions,
                      dontSend: dontSend
                    }).then(openInMailchimpIf(dontSend));
                  });
              }
            })
        }

        function openInMailchimpIf(dontSend) {
          return function (replicateCampaignResponse) {
            logger.debug('openInMailchimpIf:replicateCampaignResponse', replicateCampaignResponse, 'dontSend', dontSend);
            if (dontSend) {
              return $window.open(MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns/wizard/neapolitan?id=" + replicateCampaignResponse.web_id, '_blank');
            } else {
              return true;
            }
          }
        }

        function notifyEmailSendComplete() {
          if (!$scope.userEdits.cancelled) {
            notify.success('Sending of ' + campaignName + ' was successful.', false);
            $scope.userEdits.sendInProgress = false;
            $scope.cancelSendNotification();
          }
          notify.clearBusy();
        }

      };

      $scope.completeInMailchimp = function () {
        notify.warning({
          title: 'Complete in Mailchimp',
          message: 'You can close this dialog now as the message was presumably completed and sent in Mailchimp'
        });
        $scope.confirmSendNotification(true);
      };

      $scope.cancelSendNotification = function () {
        if ($scope.userEdits.sendInProgress) {
          $scope.userEdits.sendInProgress = false;
          $scope.userEdits.cancelled = true;
          notify.error({
            title: 'Cancelling during send',
            message: "Because notification sending was already in progress when you cancelled, campaign may have already been sent - check in Mailchimp if in doubt."
          });
        } else {
          logger.debug('calling cancelSendNotification');
          close();
        }
      };

      var promises = [
        MemberService.allLimitedFields(MemberService.filterFor.GROUP_MEMBERS).then(function (members) {
          $scope.members = members;
          logger.debug('refreshMembers -> populated ->', $scope.members.length, 'members');
          $scope.selectableRecipients = _.chain(members)
            .map(toSelectGeneralMember)
            .sortBy(function (member) {
              return member.order + member.text
            })
            .value();
          logger.debug('refreshMembers -> populated ->', $scope.selectableRecipients.length, 'selectableRecipients');
        }),
        MailchimpConfig.getConfig()
          .then(function (config) {
            $scope.config = config;
            logger.debug('retrieved config', $scope.config);
            $scope.clearRecipientsForCampaignOfType('committee');
          }),
        MailchimpCampaignService.list({
          limit: 1000,
          concise: true,
          status: 'save',
          title: 'Master'
        }).then(function (response) {
          $scope.campaigns = response.data;
          logger.debug('response.data', response.data);
        })];
      if (!$scope.committeeFile) promises.push(populateGroupEvents());

      $q.all(promises).then(function () {
        logger.debug('performed total of', promises.length);
        notify.clearBusy();
      });

    }]
  );


/* concatenated from src/legacy/src/app/js/committee.js */

angular.module('ekwgApp')
  .controller('CommitteeController', ["$rootScope", "$window", "$log", "$sce", "$timeout", "$templateRequest", "$compile", "$q", "$scope", "$filter", "$routeParams", "$location", "URLService", "DateUtils", "NumberUtils", "LoggedInMemberService", "MemberService", "ContentMetaDataService", "CommitteeFileService", "MailchimpSegmentService", "MailchimpCampaignService", "MAILCHIMP_APP_CONSTANTS", "MailchimpConfig", "Notifier", "EKWGFileUpload", "CommitteeQueryService", "CommitteeReferenceData", "ModalService", function ($rootScope, $window, $log, $sce, $timeout, $templateRequest, $compile, $q, $scope, $filter, $routeParams,
                                               $location, URLService, DateUtils, NumberUtils, LoggedInMemberService, MemberService,
                                               ContentMetaDataService, CommitteeFileService, MailchimpSegmentService, MailchimpCampaignService,
                                               MAILCHIMP_APP_CONSTANTS, MailchimpConfig, Notifier, EKWGFileUpload, CommitteeQueryService, CommitteeReferenceData, ModalService) {

    var logger = $log.getInstance('CommitteeController');
    $log.logLevels['CommitteeController'] = $log.LEVEL.OFF;

    var notify = Notifier($scope);
    notify.setBusy();

    $scope.emailingInProgress = false;
    $scope.committeeFileBaseUrl = ContentMetaDataService.baseUrl('committeeFiles');
    $scope.destinationType = '';
    $scope.members = [];
    $scope.committeeFiles = [];
    $scope.alertMessages = [];
    $scope.allowConfirmDelete = false;
    $scope.latestYearOpen = true;
    $scope.committeeReferenceData = CommitteeReferenceData;

    $scope.selected = {
      addingNewFile: false,
      committeeFiles: []
    };

    $rootScope.$on('CommitteeReferenceDataReady', function () {
      assignFileTypes();
    });

    function assignFileTypes() {
      $scope.fileTypes = CommitteeReferenceData.fileTypes;
      logger.debug('CommitteeReferenceDataReady -> fileTypes ->', $scope.fileTypes);
    }

    $scope.userEdits = {
      saveInProgress: false
    };

    $scope.showAlertMessage = function () {
      return ($scope.alert.class === 'alert-danger') || $scope.emailingInProgress;
    };

    $scope.latestYear = function () {
      return CommitteeQueryService.latestYear($scope.committeeFiles)
    };

    $scope.committeeFilesForYear = function (year) {
      return CommitteeQueryService.committeeFilesForYear(year, $scope.committeeFiles)
    };

    $scope.isActive = function (committeeFile) {
      return committeeFile === $scope.selected.committeeFile;
    };

    $scope.eventDateCalendar = {
      open: function ($event) {
        $scope.eventDateCalendar.opened = true;
      }
    };

    $scope.allowSend = function () {
      return LoggedInMemberService.allowFileAdmin();
    };

    $scope.allowAddCommitteeFile = function () {
      return $scope.fileTypes && LoggedInMemberService.allowFileAdmin();
    };

    $scope.allowEditCommitteeFile = function (committeeFile) {
      return $scope.allowAddCommitteeFile() && committeeFile && committeeFile.$id();
    };

    $scope.allowDeleteCommitteeFile = function (committeeFile) {
      return $scope.allowEditCommitteeFile(committeeFile);
    };

    $scope.cancelFileChange = function () {
      $q.when($scope.hideCommitteeFileDialog()).then(refreshCommitteeFiles).then(notify.clearBusy);
    };

    $scope.saveCommitteeFile = function () {
      $scope.userEdits.saveInProgress = true;
      $scope.selected.committeeFile.eventDate = DateUtils.asValueNoTime($scope.selected.committeeFile.eventDate);
      logger.debug('saveCommitteeFile ->', $scope.selected.committeeFile);
      return $scope.selected.committeeFile.$saveOrUpdate(notify.success, notify.success, notify.error, notify.error)
        .then($scope.hideCommitteeFileDialog)
        .then(refreshCommitteeFiles)
        .then(notify.clearBusy)
        .catch(handleError);

      function handleError(errorResponse) {
        $scope.userEdits.saveInProgress = false;
        notify.error({
          title: 'Your changes could not be saved',
          message: (errorResponse && errorResponse.error ? ('. Error was: ' + JSON.stringify(errorResponse.error)) : '')
        });
        notify.clearBusy();
      }

    };


    var defaultCommitteeFile = function () {
      return _.clone({
        "createdDate": DateUtils.nowAsValue(),
        "fileType": $scope.fileTypes && $scope.fileTypes[0].description,
        "fileNameData": {}
      })
    };

    function removeDeleteOrAddOrInProgressFlags() {
      $scope.allowConfirmDelete = false;
      $scope.selected.addingNewFile = false;
      $scope.userEdits.saveInProgress = false;
    }

    $scope.deleteCommitteeFile = function () {
      $scope.allowConfirmDelete = true;
    };

    $scope.cancelDeleteCommitteeFile = function () {
      removeDeleteOrAddOrInProgressFlags();
    };

    $scope.confirmDeleteCommitteeFile = function () {

      $scope.userEdits.saveInProgress = true;

      function showCommitteeFileDeleted() {
        return notify.success('File was deleted successfully');
      }

      $scope.selected.committeeFile.$remove(showCommitteeFileDeleted, showCommitteeFileDeleted, notify.error, notify.error)
        .then($scope.hideCommitteeFileDialog)
        .then(refreshCommitteeFiles)
        .then(removeDeleteOrAddOrInProgressFlags)
        .then(notify.clearBusy);
    };

    $scope.selectCommitteeFile = function (committeeFile, committeeFiles) {
      if (!$scope.selected.addingNewFile) {
        $scope.selected.committeeFile = committeeFile;
        $scope.selected.committeeFiles = committeeFiles;
      }
    };

    $scope.editCommitteeFile = function () {
      removeDeleteOrAddOrInProgressFlags();
      delete $scope.uploadedFile;
      $('#file-detail-dialog').modal('show');
    };

    $scope.openMailchimp = function () {
      $window.open(MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns", '_blank');
    };

    $scope.openSettings = function () {
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/committee/notification-settings-dialog.html",
        controller: "CommitteeNotificationSettingsController",
        preClose: function (modal) {
          logger.debug('preClose event with modal', modal);
          modal.element.modal('hide');
        },
      }).then(function (modal) {
        logger.debug('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.debug('close event with result', result);
        });
      })
    };

    $scope.sendNotification = function (committeeFile) {
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/committee/send-notification-dialog.html",
        controller: "CommitteeNotificationsController",
        preClose: function (modal) {
          logger.debug('preClose event with modal', modal);
          modal.element.modal('hide');
        },
        inputs: {
          committeeFile: committeeFile
        }
      }).then(function (modal) {
        logger.debug('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.debug('close event with result', result);
        });
      })
    };

    $scope.cancelSendNotification = function () {
      $('#send-notification-dialog').modal('hide');
      $scope.resubmit = false;
    };

    $scope.addCommitteeFile = function ($event) {
      $event.stopPropagation();
      $scope.selected.addingNewFile = true;
      var committeeFile = new CommitteeFileService(defaultCommitteeFile());
      $scope.selected.committeeFiles.push(committeeFile);
      $scope.selected.committeeFile = committeeFile;
      logger.debug('addCommitteeFile:', committeeFile, 'of', $scope.selected.committeeFiles.length, 'files');
      $scope.editCommitteeFile();
    };

    $scope.hideCommitteeFileDialog = function () {
      removeDeleteOrAddOrInProgressFlags();
      $('#file-detail-dialog').modal('hide');
    };

    $scope.attachFile = function (file) {
      $scope.oldTitle = $scope.selected.committeeFile.fileNameData ? $scope.selected.committeeFile.fileNameData.title : file.name;
      logger.debug('then:attachFile:oldTitle', $scope.oldTitle);
      $('#hidden-input').click();
    };

    $scope.onFileSelect = function (file) {
      if (file) {
        $scope.userEdits.saveInProgress = true;
        logger.debug('onFileSelect:file:about to upload ->', file);
        $scope.uploadedFile = file;
        EKWGFileUpload.onFileSelect(file, notify, 'committeeFiles')
          .then(function (fileNameData) {
            logger.debug('onFileSelect:file:upload complete -> fileNameData', fileNameData);
            $scope.selected.committeeFile.fileNameData = fileNameData;
            $scope.selected.committeeFile.fileNameData.title = $scope.oldTitle || file.name;
            $scope.userEdits.saveInProgress = false;
          });
      }
    };

    $scope.attachmentTitle = function () {
      return ($scope.selected.committeeFile && _.isEmpty($scope.selected.committeeFile.fileNameData) ? 'Attach' : 'Replace') + ' File';
    };

    $scope.fileUrl = function (committeeFile) {
      return committeeFile && committeeFile.fileNameData ? URLService.baseUrl() + $scope.committeeFileBaseUrl + '/' + committeeFile.fileNameData.awsFileName : '';
    };

    $scope.fileTitle = function (committeeFile) {
      return committeeFile ? DateUtils.asString(committeeFile.eventDate, undefined, DateUtils.formats.displayDateTh) + ' - ' + committeeFile.fileNameData.title : '';
    };

    $scope.iconFile = function (committeeFile) {
      if (!committeeFile.fileNameData) return undefined;

      function fileExtensionIs(fileName, extensions) {
        return _.contains(extensions, fileExtension(fileName));
      }

      function fileExtension(fileName) {
        return fileName ? _.last(fileName.split('.')).toLowerCase() : '';
      }

      if (fileExtensionIs(committeeFile.fileNameData.awsFileName, ['doc', 'docx', 'jpg', 'pdf', 'ppt', 'png', 'txt', 'xls', 'xlsx'])) {
        return 'icon-' + fileExtension(committeeFile.fileNameData.awsFileName).substring(0, 3) + '.jpg';
      } else {
        return 'icon-default.jpg';
      }
    };

    $scope.$on('memberLoginComplete', function () {
      refreshAll();
    });

    $scope.$on('memberLogoutComplete', function () {
      refreshAll();
    });


    function refreshMembers() {

      function assignMembersToScope(members) {
        $scope.members = members;
        return $scope.members;
      }

      if (LoggedInMemberService.allowFileAdmin()) {
        return MemberService.all()
          .then(assignMembersToScope);

      }
    }

    function refreshCommitteeFiles() {
      CommitteeQueryService.committeeFiles(notify).then(function (files) {
        logger.debug('committeeFiles', files);
        if (URLService.hasRouteParameter('committeeFileId')) {
          $scope.committeeFiles = _.filter(files, function (file) {
            return file.$id() === $routeParams.committeeFileId;
          });
        } else {
          $scope.committeeFiles = files;
        }
        $scope.committeeFileYears = CommitteeQueryService.committeeFileYears($scope.committeeFiles);
      });
    }

    function refreshAll() {
      refreshCommitteeFiles();
      refreshMembers();
    }

    assignFileTypes();
    refreshAll();

  }]);


/* concatenated from src/legacy/src/app/js/committeeData.js */

angular.module('ekwgApp')
  .factory('CommitteeConfig', ["Config", function (Config) {

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

  }])
  .factory('CommitteeFileService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('committeeFiles');
  }])
  .factory('CommitteeReferenceData', ["$rootScope", function ($rootScope) {

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
  }])
  .factory('CommitteeQueryService', ["$q", "$log", "$filter", "$routeParams", "URLService", "CommitteeFileService", "CommitteeReferenceData", "DateUtils", "LoggedInMemberService", "WalksService", "SocialEventsService", function ($q, $log, $filter, $routeParams, URLService, CommitteeFileService, CommitteeReferenceData, DateUtils, LoggedInMemberService, WalksService, SocialEventsService) {

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
    }]
  );


/* concatenated from src/legacy/src/app/js/committeeNotificationSettingsController.js */

angular.module('ekwgApp')
  .controller('CommitteeNotificationSettingsController', ["$window", "$log", "$sce", "$timeout", "$templateRequest", "$compile", "$q", "$rootScope", "$scope", "$filter", "$routeParams", "$location", "URLService", "DateUtils", "NumberUtils", "LoggedInMemberService", "MemberService", "ContentMetaDataService", "CommitteeFileService", "MailchimpSegmentService", "MailchimpCampaignService", "MAILCHIMP_APP_CONSTANTS", "MailchimpConfig", "Notifier", "close", function ($window, $log, $sce, $timeout, $templateRequest, $compile, $q, $rootScope, $scope, $filter, $routeParams,
                                                                   $location, URLService, DateUtils, NumberUtils, LoggedInMemberService, MemberService,
                                                                   ContentMetaDataService, CommitteeFileService, MailchimpSegmentService, MailchimpCampaignService,
                                                                   MAILCHIMP_APP_CONSTANTS, MailchimpConfig, Notifier, close) {

      var logger = $log.getInstance('CommitteeNotificationSettingsController');
      $log.logLevels['CommitteeNotificationSettingsController'] = $log.LEVEL.OFF;
      $scope.notify = {};
      $scope.campaigns = [];
      var notify = Notifier($scope.notify);
      var campaignSearchTerm = 'Master';
      notify.setBusy();
      notify.progress({
        title: 'Mailchimp Campaigns',
        message: 'Getting campaign information matching "' + campaignSearchTerm + '"'
      });

      $scope.notReady = function () {
        return $scope.campaigns.length === 0;
      };

      MailchimpConfig.getConfig()
        .then(function (config) {
          $scope.config = config;
          logger.debug('retrieved config', $scope.config);
        });

      MailchimpCampaignService.list({
        limit: 1000,
        concise: true,
        status: 'save',
        title: campaignSearchTerm
      }).then(function (response) {
        $scope.campaigns = response.data;
        logger.debug('response.data', response.data);
        notify.success({
          title: 'Mailchimp Campaigns',
          message: 'Found ' + $scope.campaigns.length + ' draft campaigns matching "' + campaignSearchTerm + '"'
        });
        notify.clearBusy();
      });

      $scope.editCampaign = function (campaignId) {
        if (!campaignId) {
          notify.error({
            title: 'Edit Mailchimp Campaign',
            message: 'Please select a campaign from the drop-down before choosing edit'
          });
        } else {
          notify.hide();
          var webId = _.find($scope.campaigns, function (campaign) {
            return campaign.id === campaignId;
          }).web_id;
          logger.debug('editCampaign:campaignId', campaignId, 'web_id', webId);
          $window.open(MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns/edit?id=" + webId, '_blank');
        }
      };

      $scope.save = function () {
        logger.debug('saving config', $scope.config);
        MailchimpConfig.saveConfig($scope.config).then(close).catch(notify.error);
      };

      $scope.cancel = function () {
        close();
      };

    }]
  );


/* concatenated from src/legacy/src/app/js/contentMetaServices.js */

angular.module('ekwgApp')
  .factory('ContentMetaDataService', ["ContentMetaData", "$q", function (ContentMetaData, $q) {

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
  }])
  .factory('ContentMetaData', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('contentMetaData');
  }])
  .factory('ContentTextService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('contentText');
  }])
  .factory('ContentText', ["ContentTextService", function (ContentTextService) {
    function forName(name) {
      return ContentTextService.all().then(function (contentDocuments) {
        return _.findWhere(contentDocuments, {name: name}) || new ContentTextService({name: name});
      });
    }

    return {forName: forName}

  }]);

/* concatenated from src/legacy/src/app/js/directives.js */

angular.module('ekwgApp')
  .directive('contactUs', ["$log", "$compile", "URLService", "CommitteeReferenceData", function ($log, $compile, URLService, CommitteeReferenceData) {

    var logger = $log.getInstance('contactUs');
    $log.logLevels['contactUs'] = $log.LEVEL.OFF;

    function email(role) {
      return CommitteeReferenceData.contactUsField(role, 'email');
    }

    function description(role) {
      return CommitteeReferenceData.contactUsField(role, 'description');
    }

    function fullName(role) {
      return CommitteeReferenceData.contactUsField(role, 'fullName');
    }

    function createHref(scope, role) {
      return '<a href="mailto:' + email(role) + '">' + (scope.text || email(role)) + '</a>';
    }

    function createListItem(scope, role) {
      return '<li ' +
        'style="' +
        'font-weight: normal;' +
        'padding: 4px 0px 4px 21px;' +
        'list-style: none;' +
        'background-image: url(' + URLService.baseUrl() + '/ekwg-legacy/assets/images/ramblers/bull-green.png);' +
        'background-position: 0px 9px;' +
        'background-repeat: no-repeat no-repeat">' +
        fullName(role) + ' - ' + description(role) + ' -  ' +
        '<a href="mailto:' + email(role) + '"' +
        'style="' +
        'background-color: transparent;' +
        'color: rgb(120, 35, 39);' +
        'text-decoration: none; ' +
        'font-weight: bold; ' +
        'background-position: initial; ' +
        'background-repeat: initial;">' +
        (scope.text || email(role)) + '</a>' +
        '</li>';
    }

    function expandRoles(scope) {
      var roles = scope.role ? scope.role.split(',') : CommitteeReferenceData.contactUsRoles();
      logger.debug('role ->', scope.role, ' roles ->', roles);
      return _(roles).map(function (role) {
        if (scope.format === 'list') {
          return createListItem(scope, role);
        } else {
          return createHref(scope, role);
        }
      }).join('\n');
    }

    function wrapInUL(scope) {
      if (scope.format === 'list') {
        return '<ul style="'
          + 'margin: 10px 0 0;'
          + 'padding: 0 0 10px 10px;'
          + 'font-weight: bold;'
          + 'background-image: url(' + URLService.baseUrl() + '/ekwg-legacy/assets/images/ramblers/dot-darkgrey-hor.png);'
          + 'background-position: 0% 100%;'
          + 'background-repeat: repeat no-repeat;'
          + 'margin-bottom: 20px;"> '
          + (scope.heading || '')
          + expandRoles(scope)
          + '</ul>';
      } else {
        return expandRoles(scope);
      }
    }

    return {
      restrict: 'EA',
      replace: true,
      link: function (scope, element) {
        scope.$watch('name', function () {
          if (CommitteeReferenceData.ready) {
            var html = wrapInUL(scope);
            logger.debug('html before compile ->', html);
            element.html($compile(html)(scope));
          }
        });
      },
      scope: {
        format: '@',
        text: '@',
        role: '@',
        heading: '@'
      }
    };
  }]);


/* concatenated from src/legacy/src/app/js/emailerService.js */

angular.module('ekwgApp')
  .factory('EmailSubscriptionService', ["$rootScope", "$log", "$http", "$q", "MemberService", "DateUtils", "MailchimpErrorParserService", function ($rootScope, $log, $http, $q, MemberService, DateUtils, MailchimpErrorParserService) {
    var logger = $log.getInstance('EmailSubscriptionService');
    $log.logLevels['EmailSubscriptionService'] = $log.LEVEL.OFF;

    var resetAllBatchSubscriptions = function (members, subscribedState) {
      var deferredTask = $q.defer();
      var savePromises = [];
      deferredTask.notify('Resetting Mailchimp subscriptions for ' + members.length + ' members');
      _.each(members, function (member) {
        defaultMailchimpSettings(member, subscribedState);
        savePromises.push(member.$saveOrUpdate());
      });

      $q.all(savePromises).then(function () {
        deferredTask.notify('Reset of Mailchimp subscriptions completed. Next member save will resend all lists to Mailchimp');
        MemberService.all().then(function (refreshedMembers) {
          deferredTask.resolve(refreshedMembers);
        })
      });
    };

    function defaultMailchimpSettings(member, subscribedState) {
      member.mailchimpLists = {
        "walks": {"subscribed": subscribedState},
        "socialEvents": {"subscribed": subscribedState},
        "general": {"subscribed": subscribedState}
      }
    }

    function booleanToString(value) {
      return String(value || false);
    }

    function addMailchimpIdentifiersToRequest(member, listType, request) {
      var mailchimpIdentifiers = {email: {}};
      mailchimpIdentifiers.email.email = member.email;
      if (member.mailchimpLists[listType].leid) {
        mailchimpIdentifiers.email.leid = member.mailchimpLists[listType].leid;
      }
      if (request) {
        return angular.extend(request, mailchimpIdentifiers);
      } else {
        return mailchimpIdentifiers.email;
      }
    }

    var createBatchSubscriptionForList = function (listType, members) {
      var deferredTask = $q.defer();
      var progress = 'Sending ' + listType + ' member data to Mailchimp';
      deferredTask.notify(progress);
      var batchedMembers = [];
      var subscriptionEntries = _.chain(members)
        .filter(function (member) {
          return includeMemberInSubscription(listType, member);
        })
        .map(function (member) {
          batchedMembers.push(member);
          var request = {
            "merge_vars": {
              "FNAME": member.firstName,
              "LNAME": member.lastName,
              "MEMBER_NUM": member.membershipNumber,
              "MEMBER_EXP": DateUtils.displayDate(member.membershipExpiryDate),
              "USERNAME": member.userName,
              "PW_RESET": member.passwordResetId || ''
            }
          };
          return addMailchimpIdentifiersToRequest(member, listType, request);
        }).value();

      if (subscriptionEntries.length > 0) {
        var url = '/mailchimp/lists/' + listType + '/batchSubscribe';
        logger.debug('sending', subscriptionEntries.length, listType, 'subscriptions to mailchimp', subscriptionEntries);
        $http({method: 'POST', url: url, data: subscriptionEntries})
          .then(function (response) {
            var responseData = response.data;
            logger.debug('received response', responseData);
            var errorObject = MailchimpErrorParserService.extractError(responseData);
            if (errorObject.error) {
              var errorResponse = {
                message: 'Sending of ' + listType + ' list subscription to Mailchimp was not successful',
                error: errorObject.error
              };
              deferredTask.reject(errorResponse);
            } else {
              var totalResponseCount = responseData.updates.concat(responseData.adds).concat(responseData.errors).length;
              deferredTask.notify('Send of ' + subscriptionEntries.length + ' ' + listType + ' members completed - processing ' + totalResponseCount + ' Mailchimp response(s)');
              var savePromises = [];
              processValidResponses(listType, responseData.updates.concat(responseData.adds), batchedMembers, savePromises, deferredTask);
              processErrorResponses(listType, responseData.errors, batchedMembers, savePromises, deferredTask);
              $q.all(savePromises).then(function () {
                MemberService.all().then(function (refreshedMembers) {
                  deferredTask.notify('Send of ' + subscriptionEntries.length + ' members to ' + listType + ' list completed with ' + responseData.add_count + ' member(s) added, ' + responseData.update_count + ' updated and ' + responseData.error_count + ' error(s)');
                  deferredTask.resolve(refreshedMembers);
                })
              });
            }
          }).catch(function (response) {
          var data = response.data;
          var errorMessage = 'Sending of ' + listType + ' member data to Mailchimp was not successful due to response: ' + data.trim();
          logger.error(errorMessage);
          deferredTask.reject(errorMessage);
        })
      } else {
        deferredTask.notify('No ' + listType + ' updates to send Mailchimp');
        MemberService.all().then(function (refreshedMembers) {
          deferredTask.resolve(refreshedMembers);
        });
      }
      return deferredTask.promise;
    };

    function includeMemberInEmailList(listType, member) {
      if (member.email && member.mailchimpLists[listType].subscribed) {
        if (listType === 'socialEvents') {
          return member.groupMember && member.socialMember;
        } else {
          return member.groupMember;
        }
      } else {
        return false;
      }
    }

    function includeMemberInSubscription(listType, member) {
      return includeMemberInEmailList(listType, member) && !member.mailchimpLists[listType].updated;
    }

    function includeMemberInUnsubscription(listType, member) {
      if (!member || !member.groupMember) {
        return true;
      } else if (member.mailchimpLists) {
        if (listType === 'socialEvents') {
          return (!member.socialMember && member.mailchimpLists[listType].subscribed);
        } else {
          return (!member.mailchimpLists[listType].subscribed);
        }
      } else {
        return false;
      }
    }

    function includeSubscriberInUnsubscription(listType, allMembers, subscriber) {
      return includeMemberInUnsubscription(listType, responseToMember(listType, allMembers, subscriber));
    }

    function resetUpdateStatusForMember(member) {
      // updated == false means not up to date with mail e.g. next list update will send this data to mailchimo
      member.mailchimpLists.walks.updated = false;
      member.mailchimpLists.socialEvents.updated = false;
      member.mailchimpLists.general.updated = false;
    }

    function responseToMember(listType, allMembers, mailchimpResponse) {
      return _(allMembers).find(function (member) {
        var matchedOnListSubscriberId = mailchimpResponse.leid && member.mailchimpLists[listType].leid && (mailchimpResponse.leid.toString() === member.mailchimpLists[listType].leid.toString());
        var matchedOnLastReturnedEmail = member.mailchimpLists[listType].email && (mailchimpResponse.email.toLowerCase() === member.mailchimpLists[listType].email.toLowerCase());
        var matchedOnCurrentEmail = member.email && mailchimpResponse.email.toLowerCase() === member.email.toLowerCase();
        return (matchedOnListSubscriberId || matchedOnLastReturnedEmail || matchedOnCurrentEmail);
      });
    }

    function findMemberAndMarkAsUpdated(listType, batchedMembers, response, deferredTask) {
      var member = responseToMember(listType, batchedMembers, response);
      if (member) {
        member.mailchimpLists[listType].leid = response.leid;
        member.mailchimpLists[listType].updated = true; // updated == true means up to date e.g. nothing to send to mailchimo
        member.mailchimpLists[listType].lastUpdated = DateUtils.nowAsValue();
        member.mailchimpLists[listType].email = member.email;
      } else {
        deferredTask.notify('From ' + batchedMembers.length + ' members, could not find any member related to response ' + JSON.stringify(response));
      }
      return member;
    }

    function processValidResponses(listType, validResponses, batchedMembers, savePromises, deferredTask) {
      _.each(validResponses, function (response) {
        var member = findMemberAndMarkAsUpdated(listType, batchedMembers, response, deferredTask);
        if (member) {
          delete member.mailchimpLists[listType].code;
          delete member.mailchimpLists[listType].error;
          deferredTask.notify('processing valid response for member ' + member.email);
          savePromises.push(member.$saveOrUpdate());
        }
      });
    }

    function processErrorResponses(listType, errorResponses, batchedMembers, savePromises, deferredTask) {
      _.each(errorResponses, function (response) {
        var member = findMemberAndMarkAsUpdated(listType, batchedMembers, response.email, deferredTask);
        if (member) {
          deferredTask.notify('processing error response for member ' + member.email);
          member.mailchimpLists[listType].code = response.code;
          member.mailchimpLists[listType].error = response.error;
          if (_.contains([210, 211, 212, 213, 214, 215, 220, 250], response.code)) member.mailchimpLists[listType].subscribed = false;
          savePromises.push(member.$saveOrUpdate());
        }
      });
    }

    return {
      responseToMember: responseToMember,
      defaultMailchimpSettings: defaultMailchimpSettings,
      createBatchSubscriptionForList: createBatchSubscriptionForList,
      resetAllBatchSubscriptions: resetAllBatchSubscriptions,
      resetUpdateStatusForMember: resetUpdateStatusForMember,
      addMailchimpIdentifiersToRequest: addMailchimpIdentifiersToRequest,
      includeMemberInSubscription: includeMemberInSubscription,
      includeMemberInEmailList: includeMemberInEmailList,
      includeSubscriberInUnsubscription: includeSubscriberInUnsubscription
    }
  }]);

/* concatenated from src/legacy/src/app/js/expenses.js */

angular.module('ekwgApp')
  .controller('ExpensesController', ["$compile", "$log", "$timeout", "$sce", "$templateRequest", "$q", "$rootScope", "$location", "$routeParams", "$scope", "$filter", "DateUtils", "NumberUtils", "URLService", "LoggedInMemberService", "MemberService", "ContentMetaDataService", "ExpenseClaimsService", "MailchimpSegmentService", "MailchimpCampaignService", "MailchimpConfig", "Notifier", "EKWGFileUpload", function ($compile, $log, $timeout, $sce, $templateRequest, $q, $rootScope, $location, $routeParams,
                                              $scope, $filter, DateUtils, NumberUtils, URLService, LoggedInMemberService, MemberService, ContentMetaDataService,
                                              ExpenseClaimsService, MailchimpSegmentService, MailchimpCampaignService, MailchimpConfig, Notifier, EKWGFileUpload) {
      var logger = $log.getInstance('ExpensesController');
      var noLogger = $log.getInstance('ExpensesControllerNoLogger');
      $log.logLevels['ExpensesControllerNoLogger'] = $log.LEVEL.OFF;
      $log.logLevels['ExpensesController'] = $log.LEVEL.OFF;

      const SELECTED_EXPENSE = 'Expense from last email link';
      $scope.receiptBaseUrl = ContentMetaDataService.baseUrl('expenseClaims');
      $scope.dataError = false;
      $scope.members = [];
      $scope.expenseClaims = [];
      $scope.unfilteredExpenseClaims = [];
      $scope.expensesOpen = URLService.hasRouteParameter('expenseId') || URLService.isArea('expenses');
      $scope.alertMessages = [];
      $scope.filterTypes = [{
        disabled: !$routeParams.expenseId,
        description: SELECTED_EXPENSE,
        filter: function (expenseClaim) {
          if ($routeParams.expenseId) {
            return expenseClaim && expenseClaim.$id() === $routeParams.expenseId;
          }
          else {
            return false;
          }
        }
      }, {
        description: 'Unpaid expenses',
        filter: function (expenseClaim) {
          return !$scope.expenseClaimStatus(expenseClaim).atEndpoint;
        }
      }, {
        description: 'Paid expenses',
        filter: function (expenseClaim) {
          return $scope.expenseClaimStatus(expenseClaim).atEndpoint;
        }
      }, {
        description: 'Expenses awaiting action from me',
        filter: function (expenseClaim) {
          return LoggedInMemberService.allowFinanceAdmin() ? editable(expenseClaim) : editableAndOwned(expenseClaim);
        }
      }, {
        description: 'All expenses',
        filter: function () {
          return true;
        }
      }];
      $scope.selected = {
        showOnlyMine: !allowAdminFunctions(),
        saveInProgress: false,
        expenseClaimIndex: 0,
        expenseItemIndex: 0,
        expenseFilter: $scope.filterTypes[$routeParams.expenseId ? 0 : 1]
      };

      $scope.itemAlert = {};
      var notify = Notifier($scope);
      var notifyItem = Notifier($scope.itemAlert);
      notify.setBusy();
      var notificationsBaseUrl = 'ekwg-legacy/partials/expenses/notifications';

      LoggedInMemberService.showLoginPromptWithRouteParameter('expenseId');

      $scope.showArea = function (area) {
        URLService.navigateTo('admin', area)
      };

      $scope.selected.expenseClaim = function () {
        try {
          return $scope.expenseClaims[$scope.selected.expenseClaimIndex];
        } catch (e) {
          console.error(e);
        }
      };

      $scope.isInactive = function (expenseClaim) {
        return expenseClaim !== $scope.selected.expenseClaim();
      };

      $scope.selected.expenseItem = function () {
        try {
          var expenseClaim = $scope.expenseClaims[$scope.selected.expenseClaimIndex];
          return expenseClaim ? expenseClaim.expenseItems[$scope.selected.expenseItemIndex] : undefined;
        } catch (e) {
          console.error(e);
        }
      };

      $scope.expenseTypes = [
        {value: "travel-reccie", name: "Travel (walk reccie)", travel: true},
        {value: "travel-committee", name: "Travel (attend committee meeting)", travel: true},
        {value: "other", name: "Other"}];

      var eventTypes = {
        created: {description: "Created", editable: true},
        submitted: {description: "Submitted", actionable: true, notifyCreator: true, notifyApprover: true},
        'first-approval': {description: "First Approval", actionable: true, notifyApprover: true},
        'second-approval': {
          description: "Second Approval",
          actionable: true,
          notifyCreator: true,
          notifyApprover: true,
          notifyTreasurer: true
        },
        returned: {description: "Returned", atEndpoint: false, editable: true, notifyCreator: true, notifyApprover: true},
        paid: {description: "Paid", atEndpoint: true, notifyCreator: true, notifyApprover: true, notifyTreasurer: true}
      };

      var defaultExpenseClaim = function () {
        return _.clone({
          "cost": 0,
          "expenseItems": [],
          "expenseEvents": []
        })
      };

      var defaultExpenseItem = function () {
        return _.clone({
          expenseType: $scope.expenseTypes[0],
          "travel": {
            "costPerMile": 0.28,
            "miles": 0,
            "from": '',
            "to": '',
            "returnJourney": true
          }
        });
      };

      function editable(expenseClaim) {
        return memberCanEditClaim(expenseClaim) && $scope.expenseClaimStatus(expenseClaim).editable;
      }

      function editableAndOwned(expenseClaim) {
        return memberOwnsClaim(expenseClaim) && $scope.expenseClaimStatus(expenseClaim).editable;
      }

      $scope.editable = function () {
        return editable($scope.selected.expenseClaim());
      };

      $scope.allowClearError = function () {
        return URLService.hasRouteParameter('expenseId') && $scope.dataError;
      };

      $scope.allowAddExpenseClaim = function () {
        return !$scope.dataError && !_.find($scope.unfilteredExpenseClaims, editableAndOwned);
      };

      $scope.allowFinanceAdmin = function () {
        return LoggedInMemberService.allowFinanceAdmin();
      };

      $scope.allowEditExpenseItem = function () {
        return $scope.allowAddExpenseItem() && $scope.selected.expenseItem() && $scope.selected.expenseClaim().$id();
      };

      $scope.allowAddExpenseItem = function () {
        return $scope.editable();
      };

      $scope.allowDeleteExpenseItem = function () {
        return $scope.allowEditExpenseItem();
      };

      $scope.allowDeleteExpenseClaim = function () {
        return !$scope.allowDeleteExpenseItem() && $scope.allowAddExpenseItem();
      };

      $scope.allowSubmitExpenseClaim = function () {
        return $scope.allowEditExpenseItem() && !$scope.allowResubmitExpenseClaim();
      };

      function allowAdminFunctions() {
        return LoggedInMemberService.allowTreasuryAdmin() || LoggedInMemberService.allowFinanceAdmin();
      }

      $scope.allowAdminFunctions = function () {
        return allowAdminFunctions();
      };

      $scope.allowReturnExpenseClaim = function () {
        return $scope.allowAdminFunctions()
          && $scope.selected.expenseClaim()
          && expenseClaimHasEventType($scope.selected.expenseClaim(), eventTypes.submitted)
          && !expenseClaimHasEventType($scope.selected.expenseClaim(), eventTypes.returned)
          && $scope.expenseClaimStatus($scope.selected.expenseClaim()).actionable;
      };

      $scope.allowResubmitExpenseClaim = function () {
        return $scope.editable() && expenseClaimHasEventType($scope.selected.expenseClaim(), eventTypes.returned);
      };

      $scope.allowPaidExpenseClaim = function () {
        return LoggedInMemberService.allowTreasuryAdmin() && _.contains(
          [eventTypes.submitted.description, eventTypes['second-approval'].description, eventTypes['first-approval'].description],
          $scope.expenseClaimLatestEvent().eventType.description);
      };

      function activeEvents(optionalEvents) {
        var events = optionalEvents || $scope.selected.expenseClaim().expenseEvents;
        var latestReturnedEvent = _.find(events.reverse(), function (event) {
          return _.isEqual(event.eventType, $scope.expenseClaimStatus.returned);
        });
        return latestReturnedEvent ? events.slice(events.indexOf(latestReturnedEvent + 1)) : events;
      }

      function expenseClaimHasEventType(expenseClaim, eventType) {
        if (!expenseClaim) return false;
        return eventForEventType(expenseClaim, eventType);
      }

      function eventForEventType(expenseClaim, eventType) {
        if (expenseClaim) return _.find(expenseClaim.expenseEvents, function (event) {
          return _.isEqual(event.eventType, eventType);
        });
      }

      $scope.allowApproveExpenseClaim = function () {
        return false;
      };

      $scope.lastApprovedByMe = function () {
        var approvalEvents = $scope.approvalEvents();
        return approvalEvents.length > 0 && _.last(approvalEvents).memberId === LoggedInMemberService.loggedInMember().memberId;

      };

      $scope.approvalEvents = function () {
        if (!$scope.selected.expenseClaim()) return [];
        return _.filter($scope.selected.expenseClaim().expenseEvents, function (event) {
          return _.isEqual(event.eventType, eventTypes['first-approval']) || _.isEqual(event.eventType, eventTypes['second-approval']);
        });
      };

      $scope.expenseClaimStatus = function (optionalExpenseClaim) {
        var expenseClaim = optionalExpenseClaim || $scope.selected.expenseClaim();
        return $scope.expenseClaimLatestEvent(expenseClaim).eventType;
      };

      $scope.expenseClaimLatestEvent = function (optionalExpenseClaim) {
        var expenseClaim = optionalExpenseClaim || $scope.selected.expenseClaim();
        return expenseClaim ? _.last(expenseClaim.expenseEvents) : {};
      };

      $scope.nextApprovalStage = function () {
        var approvals = $scope.approvalEvents();
        if (approvals.length === 0) {
          return 'First Approval';
        }
        else if (approvals.length === 1) {
          return 'Second Approval'
        }
        else {
          return 'Already has ' + approvals.length + ' approvals!';
        }
      };

      $scope.confirmApproveExpenseClaim = function () {
        var approvals = $scope.approvalEvents();
        notifyItem.hide();
        if (approvals.length === 0) {
          createEventAndSendNotifications(eventTypes['first-approval']);
        }
        else if (approvals.length === 1) {
          createEventAndSendNotifications(eventTypes['second-approval']);
        }
        else {
          notify.error('This expense claim already has ' + approvals.length + ' approvals!');
        }
      };

      $scope.showAllExpenseClaims = function () {
        $scope.dataError = false;
        $location.path('/admin/expenses')
      };

      $scope.addExpenseClaim = function () {
        $scope.expenseClaims.unshift(new ExpenseClaimsService(defaultExpenseClaim()));
        $scope.selectExpenseClaim(0);
        createEvent(eventTypes.created);
        $scope.addExpenseItem();
      };

      $scope.selectExpenseItem = function (index) {
        if ($scope.selected.saveInProgress) {
          noLogger.info('selectExpenseItem - selected.saveInProgress - not changing to index', index);
        } else {
          noLogger.info('selectExpenseItem:', index);
          $scope.selected.expenseItemIndex = index;
        }
      };

      $scope.selectExpenseClaim = function (index) {
        if ($scope.selected.saveInProgress) {
          noLogger.info('selectExpenseClaim - selected.saveInProgress - not changing to index', index);
        } else {
          $scope.selected.expenseClaimIndex = index;
          var expenseClaim = $scope.selected.expenseClaim();
          noLogger.info('selectExpenseClaim:', index, expenseClaim);
        }
      };

      $scope.editExpenseItem = function () {
        $scope.removeConfirm();
        delete $scope.uploadedFile;
        $('#expense-detail-dialog').modal('show');
      };

      $scope.hideExpenseClaim = function () {
        $scope.removeConfirm();
        $('#expense-detail-dialog').modal('hide');
      };

      $scope.addReceipt = function () {
        $('#hidden-input').click();
      };

      $scope.removeReceipt = function () {
        delete $scope.selected.expenseItem().receipt;
        delete $scope.uploadedFile;
      };

      $scope.receiptTitle = function (expenseItem) {
        return expenseItem && expenseItem.receipt ? (expenseItem.receipt.title || expenseItem.receipt.originalFileName) : '';
      };

      function baseUrl() {
        return _.first($location.absUrl().split('/#'));
      }

      $scope.receiptUrl = function (expenseItem) {
        return expenseItem && expenseItem.receipt ? baseUrl() + $scope.receiptBaseUrl + '/' + expenseItem.receipt.awsFileName : '';
      };

      $scope.onFileSelect = function (file) {
        if (file) {
          $scope.uploadedFile = file;
          EKWGFileUpload.onFileSelect(file, notify, 'expenseClaims')
            .then(function (fileNameData) {
              var expenseItem = $scope.selected.expenseItem();
              var oldTitle = (expenseItem.receipt && expenseItem.receipt.title) ? receipt.title : undefined;
              expenseItem.receipt = fileNameData;
              expenseItem.receipt.title = oldTitle;
            });
        }
      };

      function createEvent(eventType, reason) {
        var expenseClaim = $scope.selected.expenseClaim();
        if (!expenseClaim.expenseEvents) expenseClaim.expenseEvents = [];
        var event = {
          "date": DateUtils.nowAsValue(),
          "memberId": LoggedInMemberService.loggedInMember().memberId,
          "eventType": eventType
        };
        if (reason) event.reason = reason;
        expenseClaim.expenseEvents.push(event);
      }

      $scope.addExpenseItem = function () {
        $scope.removeConfirm();
        var newExpenseItem = defaultExpenseItem();
        $scope.selected.expenseClaim().expenseItems.push(newExpenseItem);
        var index = $scope.selected.expenseClaim().expenseItems.indexOf(newExpenseItem);
        if (index > -1) {
          $scope.selectExpenseItem(index);
          $scope.editExpenseItem();
        } else {
          showExpenseErrorAlert('Could not display new expense item')
        }
      };

      $scope.expenseTypeChange = function () {
        logger.debug('$scope.selected.expenseItem().expenseType', $scope.selected.expenseItem().expenseType);
        if ($scope.selected.expenseItem().expenseType.travel) {
          if (!$scope.selected.expenseItem().travel) $scope.selected.expenseItem().travel = defaultExpenseItem().travel;
        } else {
          delete $scope.selected.expenseItem().travel;
        }
        $scope.setExpenseItemFields();
      };

      $scope.expenseDateCalendar = {
        open: function ($event) {
          $scope.expenseDateCalendar.opened = true;
        }
      };

      function recalculateClaimCost() {
        $scope.selected.expenseClaim().cost = $filter('sumValues')($scope.selected.expenseClaim().expenseItems, 'cost');
      }

      $scope.cancelExpenseChange = function () {
        $scope.refreshExpenses().then($scope.hideExpenseClaim).then(notify.clearBusy);
      };

      function showExpenseErrorAlert(message) {
        var messageDefaulted = message || 'Please try this again.';
        notify.error('Your expense claim could not be saved. ' + messageDefaulted);
        $scope.selected.saveInProgress = false;
      }

      function showExpenseEmailErrorAlert(message) {
        $scope.selected.saveInProgress = false;
        notify.error('Your expense claim email processing failed. ' + message);
      }

      function showExpenseProgressAlert(message, busy) {
        notify.progress(message, busy);
      }

      function showExpenseSuccessAlert(message, busy) {
        notify.success(message, busy);
      }

      $scope.saveExpenseClaim = function (optionalExpenseClaim) {

        $scope.selected.saveInProgress = true;

        function showExpenseSaved(data) {
          $scope.expenseClaims[$scope.selected.expenseClaimIndex] = data;
          $scope.selected.saveInProgress = false;
          return notify.success('Expense was saved successfully');
        }

        showExpenseProgressAlert('Saving expense claim', true);
        $scope.setExpenseItemFields();
        return (optionalExpenseClaim || $scope.selected.expenseClaim()).$saveOrUpdate(showExpenseSaved, showExpenseSaved, showExpenseErrorAlert, showExpenseErrorAlert)
          .then($scope.hideExpenseClaim)
          .then(notify.clearBusy);
      };

      $scope.approveExpenseClaim = function () {
        $scope.confirmAction = {approve: true};
        if ($scope.lastApprovedByMe()) notifyItem.warning({
          title: 'Duplicate approval warning',
          message: 'You were the previous approver, therefore ' + $scope.nextApprovalStage() + ' ought to be carried out by someone else. Are you sure you want to do this?'
        });
      };

      $scope.deleteExpenseClaim = function () {
        $scope.confirmAction = {delete: true};
      };

      $scope.deleteExpenseItem = function () {
        $scope.confirmAction = {delete: true};
      };

      $scope.confirmDeleteExpenseItem = function () {
        $scope.selected.saveInProgress = true;
        showExpenseProgressAlert('Deleting expense item', true);
        var expenseItem = $scope.selected.expenseItem();
        logger.debug('removing', expenseItem);
        var index = $scope.selected.expenseClaim().expenseItems.indexOf(expenseItem);
        if (index > -1) {
          $scope.selected.expenseClaim().expenseItems.splice(index, 1);
        } else {
          showExpenseErrorAlert('Could not delete expense item')
        }
        $scope.selectExpenseItem(0);
        recalculateClaimCost();
        $scope.saveExpenseClaim()
          .then($scope.removeConfirm)
          .then(notify.clearBusy);
      };

      $scope.removeConfirm = function () {
        delete $scope.confirmAction;
        showExpenseSuccessAlert();
      };

      $scope.confirmDeleteExpenseClaim = function () {
        showExpenseProgressAlert('Deleting expense claim', true);

        function showExpenseDeleted() {
          return showExpenseSuccessAlert('Expense was deleted successfully');
        }

        $scope.selected.expenseClaim().$remove(showExpenseDeleted, showExpenseDeleted, showExpenseErrorAlert, showExpenseErrorAlert)
          .then($scope.hideExpenseClaim)
          .then(showExpenseDeleted)
          .then($scope.refreshExpenses)
          .then($scope.removeConfirm)
          .then(notify.clearBusy);
      };

      $scope.submitExpenseClaim = function (state) {
        $scope.resubmit = state;
        $('#submit-dialog').modal('show');
      };

      function hideSubmitDialog() {
        $('#submit-dialog').modal('hide');
        $scope.resubmit = false;
      }

      $scope.cancelSubmitExpenseClaim = function () {
        hideSubmitDialog();
      };

      $scope.returnExpenseClaim = function () {
        $('#return-dialog').modal('show');
      };

      $scope.confirmReturnExpenseClaim = function (reason) {
        hideReturnDialog();
        return createEventAndSendNotifications(eventTypes.returned, reason);
      };

      function hideReturnDialog() {
        $('#return-dialog').modal('hide');
      }

      $scope.cancelReturnExpenseClaim = function () {
        hideReturnDialog();
      };

      $scope.paidExpenseClaim = function () {
        $('#paid-dialog').modal('show');
      };

      $scope.confirmPaidExpenseClaim = function () {
        createEventAndSendNotifications(eventTypes.paid)
          .then(hidePaidDialog);
      };

      function hidePaidDialog() {
        $('#paid-dialog').modal('hide');
      }

      $scope.cancelPaidExpenseClaim = function () {
        hidePaidDialog();
      };

      $scope.confirmSubmitExpenseClaim = function () {
        if ($scope.resubmit) $scope.selected.expenseClaim().expenseEvents = [eventForEventType($scope.selected.expenseClaim(), eventTypes.created)];
        createEventAndSendNotifications(eventTypes.submitted);
      };

      $scope.resubmitExpenseClaim = function () {
        $scope.submitExpenseClaim(true);
      };

      $scope.expenseClaimCreatedEvent = function (optionalExpenseClaim) {
        return eventForEventType(optionalExpenseClaim || $scope.selected.expenseClaim(), eventTypes.created);
      };

      function createEventAndSendNotifications(eventType, reason) {
        notify.setBusy();
        $scope.selected.saveInProgress = true;
        var expenseClaim = $scope.selected.expenseClaim();
        var expenseClaimCreatedEvent = $scope.expenseClaimCreatedEvent(expenseClaim);

        return $q.when(createEvent(eventType, reason))
          .then(sendNotificationsToAllRoles, showExpenseEmailErrorAlert)
          .then($scope.saveExpenseClaim, showExpenseEmailErrorAlert, showExpenseProgressAlert);

        function renderTemplateContent(templateData) {
          var task = $q.defer();
          var templateFunction = $compile(templateData);
          var templateElement = templateFunction($scope);
          $timeout(function () {
            $scope.$digest();
            task.resolve(templateElement.html());
          });
          return task.promise;
        }

        function sendNotificationsToAllRoles() {
          return LoggedInMemberService.getMemberForMemberId(expenseClaimCreatedEvent.memberId)
            .then(function (member) {
              logger.debug('sendNotification:', 'memberId', expenseClaimCreatedEvent.memberId, 'member', member);
              var memberFullName = $filter('fullNameWithAlias')(member);

              return $q.when(showExpenseProgressAlert('Preparing to email ' + memberFullName))
                .then(hideSubmitDialog, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                .then(sendCreatorNotifications, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                .then(sendApproverNotifications, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                .then(sendTreasurerNotifications, showExpenseEmailErrorAlert, showExpenseProgressAlert);

              function sendCreatorNotifications() {
                if (eventType.notifyCreator) return sendNotificationsTo({
                  templateUrl: templateForEvent('creator', eventType),
                  memberIds: [expenseClaimCreatedEvent.memberId],
                  segmentType: 'directMail',
                  segmentNameSuffix: '',
                  destination: 'creator'
                });
                return false;
              }

              function sendApproverNotifications() {
                if (eventType.notifyApprover) return sendNotificationsTo({
                  templateUrl: templateForEvent('approver', eventType),
                  memberIds: MemberService.allMemberIdsWithPrivilege('financeAdmin', $scope.members),
                  segmentType: 'expenseApprover',
                  segmentNameSuffix: 'approval ',
                  destination: 'approvers'
                });
                return false;
              }

              function sendTreasurerNotifications() {
                if (eventType.notifyTreasurer) return sendNotificationsTo({
                  templateUrl: templateForEvent('treasurer', eventType),
                  memberIds: MemberService.allMemberIdsWithPrivilege('treasuryAdmin', $scope.members),
                  segmentType: 'expenseTreasurer',
                  segmentNameSuffix: 'payment ',
                  destination: 'treasurer'
                });
                return false;
              }

              function templateForEvent(role, eventType) {
                return notificationsBaseUrl + '/' + role + '/' + eventType.description.toLowerCase().replace(' ', '-') + '-notification.html';
              }

              function sendNotificationsTo(templateAndNotificationMembers) {
                logger.debug('sendNotificationsTo:', templateAndNotificationMembers);
                var campaignName = 'Expense ' + eventType.description + ' notification (to ' + templateAndNotificationMembers.destination + ')';
                var campaignNameAndMember = campaignName + ' (' + memberFullName + ')';
                var segmentName = 'Expense notification ' + templateAndNotificationMembers.segmentNameSuffix + '(' + memberFullName + ')';
                if (templateAndNotificationMembers.memberIds.length === 0) throw new Error('No members have been configured as ' + templateAndNotificationMembers.destination + ' therefore notifications for this step will fail!!');
                return $templateRequest($sce.getTrustedResourceUrl(templateAndNotificationMembers.templateUrl))
                  .then(renderTemplateContent)
                  .then(populateContentSections)
                  .then(sendNotification(templateAndNotificationMembers))
                  .catch(showExpenseEmailErrorAlert);

                function populateContentSections(expenseNotificationText) {
                  return {
                    sections: {
                      expense_id_url: 'Please click <a href="' + baseUrl() + '/#/admin/expenseId/' + expenseClaim.$id() + '" target="_blank">this link</a> to see the details of the above expense claim, or to make changes to it.',
                      expense_notification_text: expenseNotificationText
                    }
                  };
                }

                function sendNotification(templateAndNotificationMembers) {
                  return function (contentSections) {
                    return createOrSaveMailchimpSegment()
                      .then(saveSegmentDataToMember, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                      .then(sendEmailCampaign, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                      .then(notifyEmailSendComplete, showExpenseEmailErrorAlert, showExpenseSuccessAlert);

                    function createOrSaveMailchimpSegment() {
                      return MailchimpSegmentService.saveSegment('general', {segmentId: MailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType)}, templateAndNotificationMembers.memberIds, segmentName, $scope.members);
                    }

                    function saveSegmentDataToMember(segmentResponse) {
                      MailchimpSegmentService.setMemberSegmentId(member, templateAndNotificationMembers.segmentType, segmentResponse.segment.id);
                      return LoggedInMemberService.saveMember(member);
                    }

                    function sendEmailCampaign() {
                      showExpenseProgressAlert('Sending ' + campaignNameAndMember);
                      return MailchimpConfig.getConfig()
                        .then(function (config) {
                          var campaignId = config.mailchimp.campaigns.expenseNotification.campaignId;
                          var segmentId = MailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType);
                          logger.debug('about to replicateAndSendWithOptions with campaignName', campaignNameAndMember, 'campaign Id', campaignId, 'segmentId', segmentId);
                          return MailchimpCampaignService.replicateAndSendWithOptions({
                            campaignId: campaignId,
                            campaignName: campaignNameAndMember,
                            contentSections: contentSections,
                            segmentId: segmentId
                          });
                        })
                        .then(function () {
                          showExpenseProgressAlert('Sending of ' + campaignNameAndMember + ' was successful', true);
                        });
                    }

                    function notifyEmailSendComplete() {
                      showExpenseSuccessAlert('Sending of ' + campaignName + ' was successful. Check your inbox for progress.');
                    }
                  }
                }
              }
            });
        }
      }

      $scope.setExpenseItemFields = function () {
        var expenseItem = $scope.selected.expenseItem();
        if (expenseItem) {
          expenseItem.expenseDate = DateUtils.asValueNoTime(expenseItem.expenseDate);
          if (expenseItem.travel) expenseItem.travel.miles = NumberUtils.asNumber(expenseItem.travel.miles);
          expenseItem.description = expenseItemDescription(expenseItem);
          expenseItem.cost = expenseItemCost(expenseItem);
        }
        recalculateClaimCost();
      };

      $scope.prefixedExpenseItemDescription = function (expenseItem) {
        if (!expenseItem) return '';
        var prefix = expenseItem.expenseType && expenseItem.expenseType.travel ? expenseItem.expenseType.name + ' - ' : '';
        return prefix + expenseItem.description;
      };

      function expenseItemDescription(expenseItem) {
        var description;
        if (!expenseItem) return '';
        if (expenseItem.travel && expenseItem.expenseType.travel) {
          description = [
            expenseItem.travel.from,
            'to',
            expenseItem.travel.to,
            expenseItem.travel.returnJourney ? 'return trip' : 'single trip',
            '(' + expenseItem.travel.miles,
            'miles',
            expenseItem.travel.returnJourney ? 'x 2' : '',
            'x',
            parseInt(expenseItem.travel.costPerMile * 100) + 'p per mile)'
          ].join(' ');
        } else {
          description = expenseItem.description;
        }
        return description;
      }

      function expenseItemCost(expenseItem) {
        var cost;
        if (!expenseItem) return 0;
        if (expenseItem.travel && expenseItem.expenseType.travel) {
          cost = (NumberUtils.asNumber(expenseItem.travel.miles) *
            (expenseItem.travel.returnJourney ? 2 : 1) *
            NumberUtils.asNumber(expenseItem.travel.costPerMile));
        }
        else {
          cost = expenseItem.cost;
        }
        noLogger.info(cost, 'from expenseItem=', expenseItem);
        return NumberUtils.asNumber(cost, 2);
      }

      function refreshMembers() {
        if (LoggedInMemberService.memberLoggedIn()) {
          notify.progress('Refreshing member data...');
          return MemberService.allLimitedFields(MemberService.filterFor.GROUP_MEMBERS).then(function (members) {
            logger.debug('refreshMembers: found', members.length, 'members');
            return $scope.members = members;
          });
        }
      }

      function memberCanEditClaim(expenseClaim) {
        if (!expenseClaim) return false;
        return memberOwnsClaim(expenseClaim) || LoggedInMemberService.allowFinanceAdmin();
      }

      function memberOwnsClaim(expenseClaim) {
        if (!expenseClaim) return false;
        return (LoggedInMemberService.loggedInMember().memberId === $scope.expenseClaimCreatedEvent(expenseClaim).memberId);
      }

      $scope.refreshExpenses = function () {
        $scope.dataError = false;
        logger.debug('refreshExpenses started');
        notify.setBusy();
        notify.progress('Filtering for ' + $scope.selected.expenseFilter.description + '...');
        logger.debug('refreshing expenseFilter', $scope.selected.expenseFilter);

        let noExpenseFound = function () {
          $scope.dataError = true;
          return notify.warning({
            title: 'Expense claim could not be found',
            message: 'Try opening again from the link in the notification email, or click Show All Expense Claims'
          })
        };

        function query() {
          if ($scope.selected.expenseFilter.description === SELECTED_EXPENSE && $routeParams.expenseId) {
            return ExpenseClaimsService.getById($routeParams.expenseId)
              .then(function (expense) {
                if (!expense) {
                  return noExpenseFound();
                } else {
                  return [expense];
                }
              })
              .catch(noExpenseFound);
          } else {
            return ExpenseClaimsService.all();
          }
        }

        return query()
          .then(function (expenseClaims) {
            $scope.unfilteredExpenseClaims = [];
            $scope.expenseClaims = _.chain(expenseClaims).filter(function (expenseClaim) {
              return $scope.allowAdminFunctions() ? ($scope.selected.showOnlyMine ? memberOwnsClaim(expenseClaim) : true) : memberCanEditClaim(expenseClaim);
            }).filter(function (expenseClaim) {
              $scope.unfilteredExpenseClaims.push(expenseClaim);
              return $scope.selected.expenseFilter.filter(expenseClaim);
            }).sortBy(function (expenseClaim) {
              var expenseClaimLatestEvent = $scope.expenseClaimLatestEvent(expenseClaim);
              return expenseClaimLatestEvent ? expenseClaimLatestEvent.date : true;
            }).reverse().value();
            let outcome = 'Found ' + $scope.expenseClaims.length + ' expense claim(s)';
            notify.progress(outcome);
            logger.debug('refreshExpenses finished', outcome);
            notify.clearBusy();
            return $scope.expenseClaims;
          }, notify.error)
          .catch(notify.error);
      };

      $q.when(refreshMembers())
        .then($scope.refreshExpenses)
        .then(notify.setReady)
        .catch(notify.error);

    }]
  );


/* concatenated from src/legacy/src/app/js/filters.js */

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
  .filter('fullNameWithAlias', ["$filter", function ($filter) {
    return function (member, defaultValue) {
      return member ? ($filter('fullName')(member, defaultValue)) + (member.nameAlias ? ' (' + member.nameAlias + ')' : '') : defaultValue;
    }
  }])
  .filter('fullNameWithAliasOrMe', ["$filter", "LoggedInMemberService", function ($filter, LoggedInMemberService) {
    return function (member, defaultValue, memberId) {
      return member ? (LoggedInMemberService.loggedInMember().memberId === member.$id() && member.$id() === memberId ? "Me" : ($filter('fullName')(member, defaultValue)) + (member.nameAlias ? ' (' + member.nameAlias + ')' : '')) : defaultValue;
    }
  }])
  .filter('firstName', ["$filter", function ($filter) {
    return function (member, defaultValue) {
      return s.words($filter('fullName')(member, defaultValue))[0];
    }
  }])
  .filter('memberIdsToFullNames', ["$filter", function ($filter) {
    return function (memberIds, members, defaultValue) {
      return _(memberIds).map(function (memberId) {
        return $filter('memberIdToFullName')(memberId, members, defaultValue);
      }).join(', ');
    }
  }])
  .filter('memberIdToFullName', ["$filter", "MemberService", "FilterUtils", function ($filter, MemberService, FilterUtils) {
    return function (memberId, members, defaultValue, alias) {
      return $filter(FilterUtils.nameFilter(alias))(MemberService.toMember(memberId, members), defaultValue);
    }
  }])
  .filter('memberIdToFirstName', ["$filter", "MemberService", function ($filter, MemberService) {
    return function (memberId, members, defaultValue) {
      return $filter('firstName')(MemberService.toMember(memberId, members), defaultValue);
    }
  }])
  .filter('asMoney', ["NumberUtils", function (NumberUtils) {
    return function (number) {
      return isNaN(number) ? '' : '£' + NumberUtils.asNumber(number).toFixed(2);
    }
  }])
  .filter('humanize', function () {
    return function (string) {
      return s.humanize(string);
    }
  })
  .filter('sumValues', ["NumberUtils", function (NumberUtils) {
    return function (items, propertyName) {
      return NumberUtils.sumValues(items, propertyName);
    }
  }])
  .filter('walkSummary', ["$filter", function ($filter) {
    return function (walk) {
      return walk === undefined ? null : $filter('displayDate')(walk.walkDate) + " led by " + (walk.displayName || walk.contactName || "unknown") + " (" + (walk.briefDescriptionAndStartPoint || 'no description') + ')';
    }
  }])
  .filter('meetupEventSummary', ["$filter", function ($filter) {
    return function (meetupEvent) {
      return meetupEvent ? $filter('displayDate')(meetupEvent.startTime) + " (" + meetupEvent.title + ')' : null;
    }
  }])
  .filter('asWalkEventType', ["WalksReferenceService", function (WalksReferenceService) {
    return function (eventTypeString, field) {
      var eventType = WalksReferenceService.toEventType(eventTypeString);
      return eventType && field ? eventType[field] : eventType;
    }
  }])
  .filter('asEventNote', function () {
    return function (event) {
      return _.compact([event.description, event.reason]).join(', ');
    }
  })
  .filter('asChangedItemsTooltip', ["$filter", function ($filter) {
    return function (event, members) {
      return _(event.data).map(function (value, key) {
        return s.humanize(key) + ': ' + $filter('toAuditDeltaValue')(value, key, members);
      }).join(', ');
    }
  }])
  .filter('valueOrDefault', function () {
    return function (value, defaultValue) {
      return value || defaultValue || '(none)';
    }
  })
  .filter('toAuditDeltaValue', ["$filter", function ($filter) {
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
  }])
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
  .filter('displayDate', ["DateUtils", function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDate(dateValue);
    }
  }])
  .filter('displayDay', ["DateUtils", function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDay(dateValue);
    }
  }])
  .filter('displayDates', ["$filter", function ($filter) {
    return function (dateValues) {
      return _(dateValues).map(function (dateValue) {
        return $filter('displayDate')(dateValue);
      }).join(', ');
    }
  }])
  .filter('displayDateAndTime', ["DateUtils", function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDateAndTime(dateValue);
    }
  }])
  .filter('fromExcelDate', ["DateUtils", function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDate(dateValue);
    }
  }])
  .filter('lastLoggedInDateDisplayed', ["DateUtils", function (DateUtils) {
    return function (dateValue) {
      return DateUtils.displayDateAndTime(dateValue);
    }
  }])
  .filter('lastConfirmedDateDisplayed', ["DateUtils", function (DateUtils) {
    return function (member) {
      return member && member.profileSettingsConfirmedAt ? 'by ' + (member.profileSettingsConfirmedBy || 'member') + ' at ' + DateUtils.displayDateAndTime(member.profileSettingsConfirmedAt) : 'not confirmed yet';
    }
  }])
  .filter('createdAudit', ["StringUtils", function (StringUtils) {
    return function (resource, members) {
      return StringUtils.formatAudit(resource.createdBy, resource.createdDate, members)
    }
  }])
  .filter('updatedAudit', ["StringUtils", function (StringUtils) {
    return function (resource, members) {
      return StringUtils.formatAudit(resource.updatedBy, resource.updatedDate, members)
    }
  }]);


/* concatenated from src/legacy/src/app/js/forgotPasswordController.js */

angular.module("ekwgApp")
  .controller("ForgotPasswordController", ["$q", "$log", "$scope", "$rootScope", "$location", "$routeParams", "EmailSubscriptionService", "MemberService", "LoggedInMemberService", "URLService", "MailchimpConfig", "MailchimpSegmentService", "MailchimpCampaignService", "Notifier", "ValidationUtils", "close", function ($q, $log, $scope, $rootScope, $location, $routeParams, EmailSubscriptionService,
                                                    MemberService, LoggedInMemberService, URLService, MailchimpConfig, MailchimpSegmentService,
                                                    MailchimpCampaignService, Notifier, ValidationUtils, close) {
      var logger = $log.getInstance("ForgotPasswordController");
      $log.logLevels["ForgotPasswordController"] = $log.LEVEL.OFF;
      $scope.notify = {};
      var notify = Notifier($scope.notify);

      $scope.showSubmit = true;
      $scope.FORGOTTEN_PASSWORD_SEGMENT = "Forgotten Password";
      $scope.forgottenPasswordCredentials = {};

      $scope.actions = {
        close: function () {
          close();
        },
        submittable: function () {
          var onePopulated = ValidationUtils.fieldPopulated($scope.forgottenPasswordCredentials, "credentialOne");
          var twoPopulated = ValidationUtils.fieldPopulated($scope.forgottenPasswordCredentials, "credentialTwo");
          logger.info("notSubmittable: onePopulated", onePopulated, "twoPopulated", twoPopulated);
          return twoPopulated && onePopulated;
        },
        submit: function () {
          var userDetails = "User Name " + $scope.forgottenPasswordCredentials.credentialOne + " and Membership Number " + $scope.forgottenPasswordCredentials.credentialTwo;
          notify.setBusy();
          $scope.showSubmit = false;
          notify.success("Checking our records for " + userDetails, true);
          if ($scope.forgottenPasswordCredentials.credentialOne.length === 0 || $scope.forgottenPasswordCredentials.credentialTwo.length === 0) {
            $scope.showSubmit = true;
            notify.error({
              title: "Incorrect information entered",
              message: "Please enter both a User Name and a Membership Number"
            });
          } else {
            var forgotPasswordData = {loginResponse: {memberLoggedIn: false}};
            var message;
            LoggedInMemberService.getMemberForResetPassword($scope.forgottenPasswordCredentials.credentialOne, $scope.forgottenPasswordCredentials.credentialTwo)
              .then(function (member) {
                if (_.isEmpty(member)) {
                  message = "No member was found with " + userDetails;
                  forgotPasswordData.loginResponse.alertMessage = message;
                  $scope.showSubmit = true;
                  return {
                    forgotPasswordData: forgotPasswordData, notifyObject: {
                      title: "Incorrect information entered", message: message
                    }
                  };
                } else if (!member.mailchimpLists.general.subscribed) {
                  message = "Sorry, " + userDetails + " is not setup in our system to receive emails";
                  forgotPasswordData.member = member;
                  forgotPasswordData.loginResponse.alertMessage = message;
                  $scope.showSubmit = true;
                  return {
                    forgotPasswordData: forgotPasswordData, notifyObject: {
                      title: "Message cannot be sent", message: message
                    }
                  };
                } else {
                  LoggedInMemberService.setPasswordResetId(member);
                  EmailSubscriptionService.resetUpdateStatusForMember(member);
                  logger.debug("saving member", member);
                  $scope.forgottenPasswordMember = member;
                  member.$saveOrUpdate(sendForgottenPasswordEmailToMember, sendForgottenPasswordEmailToMember, saveFailed, saveFailed);
                  forgotPasswordData.member = member;
                  forgotPasswordData.loginResponse.alertMessage = "New password requested from login screen";
                  return {forgotPasswordData: forgotPasswordData};
                }
              }).then(function (response) {
              return LoggedInMemberService.auditMemberLogin($scope.forgottenPasswordCredentials.credentialOne, "", response.forgotPasswordData.member, response.forgotPasswordData.loginResponse)
                .then(function () {
                  if (response.notifyObject) {
                    notify.error(response.notifyObject)
                  }
                });
            });
          }
        }
      };

      function saveFailed(error) {
        notify.error({title: "The password reset failed", message: error});
      }

      function getMailchimpConfig() {
        return MailchimpConfig.getConfig()
          .then(function (config) {
            $scope.mailchimpConfig = config.mailchimp;
          });
      }

      function createOrSaveForgottenPasswordSegment() {
        return MailchimpSegmentService.saveSegment("general", {segmentId: $scope.mailchimpConfig.segments.general.forgottenPasswordSegmentId}, [{id: $scope.forgottenPasswordMember.$id()}], $scope.FORGOTTEN_PASSWORD_SEGMENT, [$scope.forgottenPasswordMember]);
      }

      function saveSegmentDataToMailchimpConfig(segmentResponse) {
        return MailchimpConfig.getConfig()
          .then(function (config) {
            config.mailchimp.segments.general.forgottenPasswordSegmentId = segmentResponse.segment.id;
            MailchimpConfig.saveConfig(config);
          });
      }

      function sendForgottenPasswordCampaign() {
        var member = $scope.forgottenPasswordMember.firstName + " " + $scope.forgottenPasswordMember.lastName;
        return MailchimpConfig.getConfig()
          .then(function (config) {
            logger.debug("config.mailchimp.campaigns.forgottenPassword.campaignId", config.mailchimp.campaigns.forgottenPassword.campaignId);
            logger.debug("config.mailchimp.segments.general.forgottenPasswordSegmentId", config.mailchimp.segments.general.forgottenPasswordSegmentId);
            return MailchimpCampaignService.replicateAndSendWithOptions({
              campaignId: config.mailchimp.campaigns.forgottenPassword.campaignId,
              campaignName: "EKWG website password reset instructions (" + member + ")",
              segmentId: config.mailchimp.segments.general.forgottenPasswordSegmentId
            });
          });
      }

      function updateGeneralList() {
        return EmailSubscriptionService.createBatchSubscriptionForList("general", [$scope.forgottenPasswordMember]);
      }

      function sendForgottenPasswordEmailToMember() {
        $q.when(notify.success("Sending forgotten password email"))
          .then(updateGeneralList)
          .then(getMailchimpConfig)
          .then(createOrSaveForgottenPasswordSegment)
          .then(saveSegmentDataToMailchimpConfig)
          .then(sendForgottenPasswordCampaign)
          .then(finalMessage)
          .then(notify.clearBusy)
          .catch(handleSendError);
      }

      function handleSendError(errorResponse) {
        notify.error({
          title: "Your email could not be sent",
          message: (errorResponse.message || errorResponse) + (errorResponse.error ? (". Error was: " + ErrorMessageService.stringify(errorResponse.error)) : "")
        });
      }

      function finalMessage() {
        return notify.success({
          title: "Message sent",
          message: "We've sent a message to the email address we have for you. Please check your inbox and follow the instructions in the message."
        })
      }

    }]
  );


/* concatenated from src/legacy/src/app/js/googleMapsServices.js */

angular.module('ekwgApp')
  .factory('GoogleMapsConfig', ["$http", "HTTPResponseService", function ($http, HTTPResponseService) {

    function getConfig() {
      return $http.get('/googleMaps/config').then(function (response) {
        return HTTPResponseService.returnResponse(response);
      });
    }

    return {
      getConfig: getConfig,
    }
  }]);




/* concatenated from src/legacy/src/app/js/homeController.js */

angular.module('ekwgApp')
  .controller('HomeController', ["$log", "$scope", "$routeParams", "LoggedInMemberService", "ContentMetaDataService", "CommitteeReferenceData", "InstagramService", "SiteEditService", function ($log, $scope, $routeParams, LoggedInMemberService, ContentMetaDataService, CommitteeReferenceData, InstagramService, SiteEditService) {
    var logger = $log.getInstance('HomeController');
    $log.logLevels['HomeController'] = $log.LEVEL.OFF;

    $scope.feeds = {instagram: {recentMedia: []}, facebook: {}};

    ContentMetaDataService.getMetaData('imagesHome')
      .then(function (contentMetaData) {
        $scope.interval = 5000;
        $scope.slides = contentMetaData.files;
      });

    InstagramService.recentMedia()
      .then(function (recentMediaResponse) {
        $scope.feeds.instagram.recentMedia = _.take(recentMediaResponse.instagram, 14);
        logger.debug("Refreshed social media", $scope.feeds.instagram.recentMedia, 'count =', $scope.feeds.instagram.recentMedia.length);
      });

    $scope.mediaUrlFor = function (media) {
      logger.debug('mediaUrlFor:media', media);
      return (media && media.images) ? media.images.standard_resolution.url : "";
    };

    $scope.mediaCaptionFor = function (media) {
      logger.debug('mediaCaptionFor:media', media);
      return media ? media.caption.text : "";
    };

    $scope.allowEdits = function () {
      return SiteEditService.active() && LoggedInMemberService.allowContentEdits();
    };

  }]);





/* concatenated from src/legacy/src/app/js/howTo.js */

angular.module('ekwgApp')
  .controller("HowToDialogController", ["$rootScope", "$log", "$q", "$scope", "$filter", "FileUtils", "DateUtils", "EKWGFileUpload", "DbUtils", "LoggedInMemberService", "ErrorMessageService", "MailchimpLinkService", "MailchimpCampaignService", "Notifier", "MemberResourcesReferenceData", "memberResource", "close", function ($rootScope, $log, $q, $scope, $filter, FileUtils, DateUtils, EKWGFileUpload, DbUtils, LoggedInMemberService, ErrorMessageService,
                                                 MailchimpLinkService, MailchimpCampaignService, Notifier, MemberResourcesReferenceData, memberResource, close) {
    var logger = $log.getInstance("HowToDialogController");
    $log.logLevels["HowToDialogController"] = $log.LEVEL.OFF;
    $scope.notify = {};
    var notify = Notifier($scope.notify);
    notify.setBusy();
    $scope.fileUtils = FileUtils;
    $scope.mailchimpLinkService = MailchimpLinkService;
    $scope.memberResourcesReferenceData = MemberResourcesReferenceData;
    $scope.memberResource = memberResource;
    logger.debug("memberResourcesReferenceData:", $scope.memberResourcesReferenceData, "memberResource:", memberResource);
    $scope.resourceDateCalendar = {
      open: function () {
        $scope.resourceDateCalendar.opened = true;
      }
    };

    $scope.cancel = function () {
      close();
    };

    $scope.onSelect = function (file) {
      if (file) {
        logger.debug("onSelect:file:about to upload ->", file);
        $scope.uploadedFile = file;
        EKWGFileUpload.onFileSelect(file, notify, "memberResources")
          .then(function (fileNameData) {
            logger.debug("onSelect:file:upload complete -> fileNameData", fileNameData);
            $scope.memberResource.data.fileNameData = fileNameData;
            $scope.memberResource.data.fileNameData.title = $scope.oldTitle || file.name;
          });
      }
    };

    $scope.attach = function (file) {
      $("#hidden-input").click();
    };

    $scope.save = function () {
      notify.setBusy();
      logger.debug("save ->", $scope.memberResource);
      return $scope.memberResource.$saveOrUpdate(notify.success, notify.success, notify.error, notify.error)
        .then($scope.hideDialog)
        .then(notify.clearBusy)
        .catch(handleError);

      function handleError(errorResponse) {
        notify.error({
          title: "Your changes could not be saved",
          message: (errorResponse && errorResponse.error ? (". Error was: " + JSON.stringify(errorResponse.error)) : "")
        });
        notify.clearBusy();
      }

    };

    $scope.cancelChange = function () {
      $q.when($scope.hideDialog()).then(notify.clearBusy);
    };

    $scope.campaignDate = function (campaign) {
      return DateUtils.asValueNoTime(campaign.send_time || campaign.create_time);
    };

    $scope.campaignTitle = function (campaign) {
      return campaign.title + " (" + $filter("displayDate")($scope.campaignDate(campaign)) + ")";
    };

    $scope.campaignChange = function () {
      logger.debug("campaignChange:memberResource.data.campaign", $scope.memberResource.data.campaign);
      if ($scope.memberResource.data.campaign) {
        $scope.memberResource.title = $scope.memberResource.data.campaign.title;
        $scope.memberResource.resourceDate = $scope.campaignDate($scope.memberResource.data.campaign);
      }
    };

    $scope.performCampaignSearch = function (selectFirst) {
      var campaignSearchTerm = $scope.memberResource.data.campaignSearchTerm;
      if (campaignSearchTerm) {
        notify.setBusy();
        notify.progress({
          title: "Email search",
          message: "searching for campaigns matching '" + campaignSearchTerm + "'"
        });
        var options = {
          limit: $scope.memberResource.data.campaignSearchLimit,
          concise: true,
          status: "sent",
          campaignSearchTerm: campaignSearchTerm
        };
        options[$scope.memberResource.data.campaignSearchField] = campaignSearchTerm;
        return MailchimpCampaignService.list(options).then(function (response) {
          $scope.campaigns = response.data;
          if (selectFirst) {
            $scope.memberResource.data.campaign = _.first($scope.campaigns);
            $scope.campaignChange();
          } else {
            logger.debug("$scope.memberResource.data.campaign", $scope.memberResource.data.campaign, "first campaign=", _.first($scope.campaigns))
          }
          logger.debug("response.data", response.data);
          notify.success({
            title: "Email search",
            message: "Found " + $scope.campaigns.length + " campaigns matching '" + campaignSearchTerm + "'"
          });
          notify.clearBusy();
          return true;
        });
      } else {
        return $q.when(true);
      }
    };

    $scope.hideDialog = function () {
      $rootScope.$broadcast("memberResourcesChanged");
      close();
    };
    $scope.editMode = $scope.memberResource.$id() ? "Edit" : "Add";
    logger.debug("editMode:", $scope.editMode);
    if ($scope.memberResource.resourceType === "email" && $scope.memberResource.$id()) {
      $scope.performCampaignSearch(false).then(notify.clearBusy)
    } else {
      notify.clearBusy();
    }
  }])
  .controller("HowToController", ["$rootScope", "$window", "$log", "$sce", "$timeout", "$templateRequest", "$compile", "$q", "$scope", "$filter", "$routeParams", "$location", "URLService", "DateUtils", "MailchimpLinkService", "FileUtils", "NumberUtils", "LoggedInMemberService", "MemberService", "ContentMetaDataService", "MailchimpSegmentService", "MailchimpCampaignService", "MemberResourcesReferenceData", "MailchimpConfig", "Notifier", "MemberResourcesService", "CommitteeReferenceData", "ModalService", "SiteEditService", function ($rootScope, $window, $log, $sce, $timeout, $templateRequest, $compile, $q, $scope, $filter, $routeParams,
                                           $location, URLService, DateUtils, MailchimpLinkService, FileUtils, NumberUtils, LoggedInMemberService, MemberService,
                                           ContentMetaDataService, MailchimpSegmentService, MailchimpCampaignService, MemberResourcesReferenceData,
                                           MailchimpConfig, Notifier, MemberResourcesService, CommitteeReferenceData, ModalService, SiteEditService) {

    var logger = $log.getInstance("HowToController");
    $log.logLevels["HowToController"] = $log.LEVEL.OFF;
    $scope.notify = {};
    var notify = Notifier($scope.notify);
    notify.setBusy();
    $scope.fileUtils = FileUtils;
    $scope.memberResourcesReferenceData = MemberResourcesReferenceData;
    $scope.mailchimpLinkService = MailchimpLinkService;
    $scope.destinationType = "";
    $scope.members = [];
    $scope.memberResources = [];
    $scope.alertMessages = [];
    $scope.allowConfirmDelete = false;

    $scope.selected = {
      addingNew: false,
    };

    $scope.isActive = function (memberResource) {
      var active = SiteEditService.active() && LoggedInMemberService.memberLoggedIn() && memberResource === $scope.selected.memberResource;
      logger.debug("isActive =", active, "with memberResource", memberResource);
      return active;
    };

    $scope.allowAdd = function () {
      return SiteEditService.active() && LoggedInMemberService.allowFileAdmin();
    };

    $scope.allowEdit = function (memberResource) {
      return $scope.allowAdd() && memberResource && memberResource.$id();
    };

    $scope.allowDelete = function (memberResource) {
      return $scope.allowEdit(memberResource);
    };

    var defaultMemberResource = function () {
      return new MemberResourcesService({
        data: {campaignSearchLimit: "1000", campaignSearchField: "title"},
        resourceType: "email",
        accessLevel: "hidden",
        createdDate: DateUtils.nowAsValue(),
        createdBy: LoggedInMemberService.loggedInMember().memberId
      })
    };

    function removeDeleteOrAddOrInProgressFlags() {
      $scope.allowConfirmDelete = false;
      $scope.selected.addingNew = false;
    }

    $scope.delete = function () {
      $scope.allowConfirmDelete = true;
    };

    $scope.cancelDelete = function () {
      removeDeleteOrAddOrInProgressFlags();
    };

    $scope.confirmDelete = function () {
      notify.setBusy();

      function showDeleted() {
        return notify.success("member resource was deleted successfully");
      }

      $scope.selected.memberResource.$remove(showDeleted, showDeleted, notify.error, notify.error)
        .then($scope.hideDialog)
        .then(refreshMemberResources)
        .then(removeDeleteOrAddOrInProgressFlags)
        .then(notify.clearBusy);
    };

    $scope.selectMemberResource = function (memberResource) {
      logger.debug("selectMemberResource with memberResource", memberResource, "$scope.selected.addingNew", $scope.selected.addingNew);
      if (!$scope.selected.addingNew) {
        $scope.selected.memberResource = memberResource;
      }
    };

    $scope.edit = function () {
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/howTo/how-to-dialog.html",
        controller: "HowToDialogController",
        preClose: function (modal) {
          logger.debug("preClose event with modal", modal);
          modal.element.modal("hide");
        },
        inputs: {
          memberResource: $scope.selected.memberResource
        }
      }).then(function (modal) {
        logger.debug("modal event with modal", modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.debug("close event with result", result);
        });
      })

    };

    $scope.add = function () {
      $scope.selected.addingNew = true;
      var memberResource = defaultMemberResource();
      $scope.selected.memberResource = memberResource;
      logger.debug("add:", memberResource);
      $scope.edit();
    };

    $scope.hideDialog = function () {
      removeDeleteOrAddOrInProgressFlags();
    };

    $scope.$on("memberResourcesChanged", function () {
      refreshAll();
    });

    $scope.$on("memberResourcesChanged", function () {
      refreshAll();
    });

    $scope.$on("memberLoginComplete", function () {
      refreshAll();
    });

    $scope.$on("memberLogoutComplete", function () {
      refreshAll();
    });

    $scope.$on("editSite", function (event, data) {
      logger.debug("editSite:", data);
      refreshAll();
    });


    function refreshMemberResources() {
      MemberResourcesService.all()
        .then(function (memberResources) {
          if (URLService.hasRouteParameter("memberResourceId")) {
            $scope.memberResources = _.filter(memberResources, function (memberResource) {
              return memberResource.$id() === $routeParams.memberResourceId;
            });
          } else {
            $scope.memberResources = _.chain(memberResources)
              .filter(function (memberResource) {
                return $scope.memberResourcesReferenceData.accessLevelFor(memberResource.accessLevel).filter();
              }).sortBy("resourceDate")
              .value()
              .reverse();
            logger.debug(memberResources.length, "memberResources", $scope.memberResources.length, "filtered memberResources");
          }
        });
    }

    function refreshAll() {
      refreshMemberResources();
    }

    refreshAll();

  }]);


/* concatenated from src/legacy/src/app/js/httpServices.js */

angular.module('ekwgApp')
  .factory('HTTPResponseService', ["$log", function ($log) {

    var logger = $log.getInstance('HTTPResponseService');
    $log.logLevels['HTTPResponseService'] = $log.LEVEL.OFF;

    function returnResponse(response) {
      logger.debug('response.data=', response.data);
      var returnObject = (typeof response.data === 'object') || !response.data ? response.data : JSON.parse(response.data);
      logger.debug('returned ', typeof response.data, 'response status =', response.status, returnObject.length, 'response items:', returnObject);
      return returnObject;
    }

    return {
      returnResponse: returnResponse
    }

  }]);


/* concatenated from src/legacy/src/app/js/imageEditor.js */

angular.module('ekwgApp')
  .controller('ImageEditController', ["$scope", "$location", "Upload", "$http", "$q", "$routeParams", "$window", "LoggedInMemberService", "ContentMetaDataService", "Notifier", "EKWGFileUpload", function($scope, $location, Upload, $http, $q, $routeParams, $window, LoggedInMemberService, ContentMetaDataService, Notifier, EKWGFileUpload) {
    var notify = Notifier($scope);

    $scope.imageSource = $routeParams.imageSource;

    applyAllowEdits();

    $scope.onFileSelect = function(file) {
      if (file) {
        $scope.uploadedFile = file;
        EKWGFileUpload.onFileSelect(file, notify, $scope.imageSource).then(function(fileNameData) {
          $scope.currentImageMetaDataItem.image = $scope.imageMetaData.baseUrl + '/' + fileNameData.awsFileName;
          console.log(' $scope.currentImageMetaDataItem.image', $scope.currentImageMetaDataItem.image);
        });
      }
    };

    $scope.refreshImageMetaData = function(imageSource) {
      notify.setBusy();
      $scope.imageSource = imageSource;
      ContentMetaDataService.getMetaData(imageSource).then(function(contentMetaData) {
        $scope.imageMetaData = contentMetaData;
        notify.clearBusy();
      }, function(response) {
        notify.error(response);
      });
    };

    $scope.refreshImageMetaData($scope.imageSource);

    $scope.$on('memberLoginComplete', function() {
      applyAllowEdits();
    });

    $scope.$on('memberLogoutComplete', function() {
      applyAllowEdits();
    });


    $scope.exitBackToPreviousWindow = function() {
      $window.history.back();
    };

    $scope.reverseSortOrder = function() {
      $scope.imageMetaData.files = $scope.imageMetaData.files.reverse();
    };

    $scope.imageTitleLength = function() {
      if ($scope.imageSource === 'imagesHome') {
        return 50;
      } else {
        return 20
      }
    };

    $scope.replace = function(imageMetaDataItem) {
      $scope.files = [];
      $scope.currentImageMetaDataItem = imageMetaDataItem;
      $('#hidden-input').click();
    };

    $scope.moveUp = function(imageMetaDataItem) {
      var currentIndex = $scope.imageMetaData.files.indexOf(imageMetaDataItem);
      if (currentIndex > 0) {
        $scope.delete(imageMetaDataItem);
        $scope.imageMetaData.files.splice(currentIndex - 1, 0, imageMetaDataItem);
      }
    };

    $scope.moveDown = function(imageMetaDataItem) {
      var currentIndex = $scope.imageMetaData.files.indexOf(imageMetaDataItem);
      if (currentIndex < $scope.imageMetaData.files.length) {
        $scope.delete(imageMetaDataItem);
        $scope.imageMetaData.files.splice(currentIndex + 1, 0, imageMetaDataItem);
      }
    };

    $scope.delete = function(imageMetaDataItem) {
      $scope.imageMetaData.files = _.without($scope.imageMetaData.files, imageMetaDataItem);
    };

    $scope.insertHere = function(imageMetaDataItem) {
      var insertedImageMetaDataItem = new ContentMetaDataService.createNewMetaData(true);
      var currentIndex = $scope.imageMetaData.files.indexOf(imageMetaDataItem);
      $scope.imageMetaData.files.splice(currentIndex, 0, insertedImageMetaDataItem);
      $scope.replace(insertedImageMetaDataItem);
    };

    $scope.currentImageMetaDataItemBeingUploaded = function(imageMetaDataItem) {
      return ($scope.currentImageMetaDataItem && $scope.currentImageMetaDataItem.$$hashKey === imageMetaDataItem.$$hashKey);
    };


    $scope.saveAll = function() {
      ContentMetaDataService.saveMetaData($scope.imageMetaData, saveOrUpdateSuccessful, notify.error)
        .then(function(contentMetaData) {
          $scope.exitBackToPreviousWindow();
        }, function(response) {
          notify.error(response);
        });
    };

    function applyAllowEdits() {
      $scope.allowEdits = LoggedInMemberService.allowContentEdits();
    }

    function saveOrUpdateSuccessful() {
      notify.success('data for ' + $scope.imageMetaData.files.length + ' images was saved successfully.');
    }

  }]);





/* concatenated from src/legacy/src/app/js/indexController.js */

angular.module('ekwgApp')
  .controller("IndexController", ["$q", "$cookieStore", "$log", "$scope", "$rootScope", "URLService", "LoggedInMemberService", "ProfileConfirmationService", "AuthenticationModalsService", "Notifier", "DateUtils", function ($q, $cookieStore, $log, $scope, $rootScope, URLService, LoggedInMemberService, ProfileConfirmationService, AuthenticationModalsService, Notifier, DateUtils) {

    var logger = $log.getInstance("IndexController");
    $log.logLevels["IndexController"] = $log.LEVEL.OFF;
    $scope.notify = {};

    var notify = Notifier($scope.notify);

    logger.info('called IndexController');
    $scope.ready = false;
    $scope.year = DateUtils.asString(DateUtils.momentNow().valueOf(), undefined, "YYYY");
    $scope.actions = {
      forgotPassword: function () {
        URLService.navigateTo("forgot-password");
      },
      loginOrLogout: function () {
        if (LoggedInMemberService.memberLoggedIn()) {
          LoggedInMemberService.logout();
        } else {
          URLService.navigateTo("login");
        }
      }
    };

    $scope.memberLoggedIn = function () {
      return LoggedInMemberService.memberLoggedIn()
    };


    $scope.memberLoginStatus = function () {
      if (LoggedInMemberService.memberLoggedIn()) {
        var loggedInMember = LoggedInMemberService.loggedInMember();
        return "Logout " + loggedInMember.firstName + " " + loggedInMember.lastName;
      } else {
        return "Login to EWKG Site";
      }
    };

    $scope.allowEdits = function () {
      return LoggedInMemberService.allowContentEdits();
    };


    $scope.isHome = function () {
      return URLService.relativeUrlFirstSegment() === "/";
    };


    $scope.isOnPage = function (data) {
      var matchedUrl = s.endsWith(URLService.relativeUrlFirstSegment(), data);
      logger.debug("isOnPage", matchedUrl, "data=", data);
      return matchedUrl;
    };

    $scope.isProfileOrAdmin = function () {
      return $scope.isOnPage("profile") || $scope.isOnPage("admin");
    };

  }]);



/* concatenated from src/legacy/src/app/js/instagramServices.js */

angular.module('ekwgApp')
  .factory('InstagramService', ["$http", "HTTPResponseService", function ($http, HTTPResponseService) {

    function recentMedia() {
      return $http.get('/instagram/recentMedia').then(HTTPResponseService.returnResponse);
    }

    return {
      recentMedia: recentMedia,
    }
  }]);




/* concatenated from src/legacy/src/app/js/letterheadController.js */

angular.module('ekwgApp')
  .controller('LetterheadController', ["$scope", "$location", function ($scope, $location) {
    var pathParts = $location.path().replace('/letterhead/', '').split('/');
    $scope.firstPart = _.first(pathParts);
    $scope.lastPart = _.last(pathParts);
  }]);

/* concatenated from src/legacy/src/app/js/links.js */

angular.module('ekwgApp')
  .factory('ContactUsAmendService', ["$filter", "LoggedInMemberService", "DateUtils", function ($filter, LoggedInMemberService, DateUtils) {
  }])
  .controller('ContactUsController', ["$log", "$rootScope", "$routeParams", "$scope", "CommitteeReferenceData", "LoggedInMemberService", function ($log, $rootScope, $routeParams, $scope, CommitteeReferenceData, LoggedInMemberService) {
    var logger = $log.getInstance('ContactUsController');
    $log.logLevels['ContactUsController'] = $log.LEVEL.OFF;

    $scope.contactUs = {
      ready: function () {
        return CommitteeReferenceData.ready;
      }
    };

    $scope.allowEdits = function () {
      return LoggedInMemberService.allowMemberAdminEdits();
    }

  }]);


/* concatenated from src/legacy/src/app/js/loggedInMemberService.js */

angular.module('ekwgApp')
  .factory('LoggedInMemberService', ["$rootScope", "$q", "$routeParams", "$cookieStore", "URLService", "MemberService", "MemberAuditService", "DateUtils", "NumberUtils", "$log", function ($rootScope, $q, $routeParams, $cookieStore, URLService, MemberService, MemberAuditService, DateUtils, NumberUtils, $log) {

      var logger = $log.getInstance('LoggedInMemberService');
      var noLogger = $log.getInstance('NoLogger');
      $log.logLevels['NoLogger'] = $log.LEVEL.OFF;
      $log.logLevels['LoggedInMemberService'] = $log.LEVEL.OFF;

      function loggedInMember() {
        if (!getCookie('loggedInMember')) setCookie('loggedInMember', {});
        return getCookie('loggedInMember');
      }

      function loginResponse() {
        if (!getCookie('loginResponse')) setCookie('loginResponse', {memberLoggedIn: false});
        return getCookie('loginResponse');
      }

      function showResetPassword() {
        return getCookie('showResetPassword');
      }

      function allowContentEdits() {
        return memberLoggedIn() ? loggedInMember().contentAdmin : false;
      }

      function allowMemberAdminEdits() {
        return loginResponse().memberLoggedIn ? loggedInMember().memberAdmin : false;
      }

      function allowFinanceAdmin() {
        return loginResponse().memberLoggedIn ? loggedInMember().financeAdmin : false;
      }

      function allowCommittee() {
        return loginResponse().memberLoggedIn ? loggedInMember().committee : false;
      }

      function allowTreasuryAdmin() {
        return loginResponse().memberLoggedIn ? loggedInMember().treasuryAdmin : false;
      }

      function allowFileAdmin() {
        return loginResponse().memberLoggedIn ? loggedInMember().fileAdmin : false;
      }

      function memberLoggedIn() {
        return !_.isEmpty(loggedInMember()) && loginResponse().memberLoggedIn;
      }

      function showLoginPromptWithRouteParameter(routeParameter) {
        if (URLService.hasRouteParameter(routeParameter) && !memberLoggedIn()) $('#login-dialog').modal();
      }

      function allowWalkAdminEdits() {
        return memberLoggedIn() ? loggedInMember().walkAdmin : false;
      }

      function allowSocialAdminEdits() {
        return memberLoggedIn() ? loggedInMember().socialAdmin : false;
      }

      function allowSocialDetailView() {
        return memberLoggedIn() ? loggedInMember().socialMember : false;
      }

      function logout() {
        var member = loggedInMember();
        var loginResponseValue = loginResponse();
        if (!_.isEmpty(member)) {
          loginResponseValue.alertMessage = 'The member ' + member.userName + ' logged out successfully';
          auditMemberLogin(member.userName, undefined, member, loginResponseValue)
        }
        removeCookie('loginResponse');
        removeCookie('loggedInMember');
        removeCookie('showResetPassword');
        removeCookie('editSite');
        $rootScope.$broadcast('memberLogoutComplete');
      }

      function auditMemberLogin(userName, password, member, loginResponse) {
        var audit = new MemberAuditService({
          userName: userName,
          password: password,
          loginTime: DateUtils.nowAsValue(),
          loginResponse: loginResponse
        });
        if (!_.isEmpty(member)) audit.member = member;
        return audit.$save();
      }

      function setCookie(key, value) {
        noLogger.debug('setting cookie ' + key + ' with value ', value);
        $cookieStore.put(key, value);
      }

      function removeCookie(key) {
        logger.info('removing cookie ' + key);
        $cookieStore.remove(key);
      }

      function getCookie(key) {
        var object = $cookieStore.get(key);
        noLogger.debug('getting cookie ' + key + ' with value', object);
        return object;
      }

      function login(userName, password) {
        return getMemberForUserName(userName)
          .then(function (member) {
            removeCookie('showResetPassword');
            var loginResponse = {};
            if (!_.isEmpty(member)) {
              loginResponse.memberLoggedIn = false;
              if (!member.groupMember) {
                loginResponse.alertMessage = 'Logins for member ' + userName + ' have been disabled. Please';
              } else if (member.password !== password) {
                loginResponse.alertMessage = 'The password was incorrectly entered for ' + userName + '. Please try again or';
              } else if (member.expiredPassword) {
                setCookie('showResetPassword', true);
                loginResponse.alertMessage = 'The password for ' + userName + ' has expired. You must enter a new password before continuing. Alternatively';
              } else {
                loginResponse.memberLoggedIn = true;
                loginResponse.alertMessage = 'The member ' + userName + ' logged in successfully';
                setLoggedInMemberCookie(member);
              }
            } else {
              removeCookie('loggedInMember');
              loginResponse.alertMessage = 'The member ' + userName + ' was not recognised. Please try again or';
            }
            return {loginResponse: loginResponse, member: member};
          })
          .then(function (loginData) {
            setCookie('loginResponse', loginData.loginResponse);
            return auditMemberLogin(userName, password, loginData.member, loginData.loginResponse)
              .then(function () {
                  logger.debug('loginResponse =', loginData.loginResponse);
                  return $rootScope.$broadcast('memberLoginComplete');
                }
              );
          }, function (response) {
            throw new Error('Something went wrong...' + response);
          })
      }

      function setLoggedInMemberCookie(member) {
        var memberId = member.$id();
        var cookie = getCookie('loggedInMember');
        if (_.isEmpty(cookie) || (cookie.memberId === memberId)) {
          var newCookie = angular.extend(member, {memberId: memberId});
          logger.debug('saving loggedInMember ->', newCookie);
          setCookie('loggedInMember', newCookie);
        } else {
          logger.debug('not saving member (' + memberId + ') to cookie as not currently logged in member (' + cookie.memberId + ')', member);
        }
      }


      function saveMember(memberToSave, saveCallback, errorSaveCallback) {
        memberToSave.$saveOrUpdate(saveCallback, saveCallback, errorSaveCallback, errorSaveCallback)
          .then(function () {
            setLoggedInMemberCookie(memberToSave);
          })
          .then(function () {
            $rootScope.$broadcast('memberSaveComplete');
          });
      }

      function resetPassword(userName, newPassword, newPasswordConfirm) {

        return getMemberForUserName(userName)
          .then(validateNewPassword)
          .then(saveSuccessfulPasswordReset)
          .then(broadcastMemberLoginComplete)
          .then(auditPasswordChange);


        function validateNewPassword(member) {
          var loginResponse = {memberLoggedIn: false};
          var showResetPassword = true;
          if (member.password === newPassword) {
            loginResponse.alertMessage = 'The new password was the same as the old one for ' + member.userName + '. Please try again or';
          } else if (!newPassword || newPassword.length < 6) {
            loginResponse.alertMessage = 'The new password needs to be at least 6 characters long. Please try again or';
          } else if (newPassword !== newPasswordConfirm) {
            loginResponse.alertMessage = 'The new password was not confirmed correctly for ' + member.userName + '. Please try again or';
          } else {
            showResetPassword = false;
            logger.debug('Saving new password for ' + member.userName + ' and removing expired status');
            delete member.expiredPassword;
            delete member.passwordResetId;
            member.password = newPassword;
            loginResponse.memberLoggedIn = true;
            loginResponse.alertMessage = 'The password for ' + member.userName + ' was changed successfully';
          }
          return {loginResponse: loginResponse, member: member, showResetPassword: showResetPassword};
        }

        function saveSuccessfulPasswordReset(resetPasswordData) {
          logger.debug('saveNewPassword.resetPasswordData:', resetPasswordData);
          setCookie('loginResponse', resetPasswordData.loginResponse);
          setCookie('showResetPassword', resetPasswordData.showResetPassword);
          if (!resetPasswordData.showResetPassword) {
            return resetPasswordData.member.$update().then(function () {
              setLoggedInMemberCookie(resetPasswordData.member);
              return resetPasswordData;
            })
          } else {
            return resetPasswordData;
          }
        }

        function auditPasswordChange(resetPasswordData) {
          return auditMemberLogin(userName, resetPasswordData.member.password, resetPasswordData.member, resetPasswordData.loginResponse)
        }

        function broadcastMemberLoginComplete(resetPasswordData) {
          $rootScope.$broadcast('memberLoginComplete');
          return resetPasswordData
        }

      }

      function getMemberForUserName(userName) {
        return MemberService.query({userName: userName.toLowerCase()}, {limit: 1})
          .then(function (queryResults) {
            return (queryResults && queryResults.length > 0) ? queryResults[0] : {};
          });
      }

      function getMemberForResetPassword(credentialOne, credentialTwo) {
        var credentialOneCleaned = credentialOne.toLowerCase().trim();
        var credentialTwoCleaned = credentialTwo.toUpperCase().trim();
        var orOne = {$or: [{userName: {$eq: credentialOneCleaned}}, {email: {$eq: credentialOneCleaned}}]};
        var orTwo = {$or: [{membershipNumber: {$eq: credentialTwoCleaned}}, {postcode: {$eq: credentialTwoCleaned}}]};
        var criteria = {$and: [orOne, orTwo]};
        logger.info("querying member using", criteria);
        return MemberService.query(criteria, {limit: 1})
          .then(function (queryResults) {
            logger.info("queryResults:", queryResults);
            return (queryResults && queryResults.length > 0) ? queryResults[0] : {};
          });
      }

      function getMemberForMemberId(memberId) {
        return MemberService.getById(memberId)
      }

      function getMemberByPasswordResetId(passwordResetId) {
        return MemberService.query({passwordResetId: passwordResetId}, {limit: 1})
          .then(function (queryResults) {
            return (queryResults && queryResults.length > 0) ? queryResults[0] : {};
          });
      }

      function setPasswordResetId(member) {
        member.passwordResetId = NumberUtils.generateUid();
        logger.debug('member.userName', member.userName, 'member.passwordResetId', member.passwordResetId);
        return member;
      }

      return {
        auditMemberLogin: auditMemberLogin,
        setPasswordResetId: setPasswordResetId,
        getMemberByPasswordResetId: getMemberByPasswordResetId,
        getMemberForResetPassword: getMemberForResetPassword,
        getMemberForUserName: getMemberForUserName,
        getMemberForMemberId: getMemberForMemberId,
        loggedInMember: loggedInMember,
        loginResponse: loginResponse,
        logout: logout,
        login: login,
        saveMember: saveMember,
        resetPassword: resetPassword,
        memberLoggedIn: memberLoggedIn,
        allowContentEdits: allowContentEdits,
        allowMemberAdminEdits: allowMemberAdminEdits,
        allowWalkAdminEdits: allowWalkAdminEdits,
        allowSocialAdminEdits: allowSocialAdminEdits,
        allowSocialDetailView: allowSocialDetailView,
        allowCommittee: allowCommittee,
        allowFinanceAdmin: allowFinanceAdmin,
        allowTreasuryAdmin: allowTreasuryAdmin,
        allowFileAdmin: allowFileAdmin,
        showResetPassword: showResetPassword,
        showLoginPromptWithRouteParameter: showLoginPromptWithRouteParameter
      };

    }]
  );


/* concatenated from src/legacy/src/app/js/loginController.js */

angular.module('ekwgApp')
  .controller('LoginController', ["$log", "$scope", "$routeParams", "LoggedInMemberService", "AuthenticationModalsService", "Notifier", "URLService", "ValidationUtils", "close", function ($log, $scope, $routeParams, LoggedInMemberService, AuthenticationModalsService, Notifier, URLService, ValidationUtils, close) {

      $scope.notify = {};
      var logger = $log.getInstance('LoginController');
      $log.logLevels['LoginController'] = $log.LEVEL.OFF;

      var notify = Notifier($scope.notify);
      LoggedInMemberService.logout();
      $scope.actions = {
        submittable: function () {
          var userNamePopulated = ValidationUtils.fieldPopulated($scope.enteredMemberCredentials, "userName");
          var passwordPopulated = ValidationUtils.fieldPopulated($scope.enteredMemberCredentials, "password");
          logger.info("submittable: userNamePopulated", userNamePopulated, "passwordPopulated", passwordPopulated);
          return passwordPopulated && userNamePopulated;
        },
        forgotPassword: function () {
          URLService.navigateTo("forgot-password");
        },
        close: function () {
          close()
        },
        login: function () {
          notify.showContactUs(false);
          notify.setBusy();
          notify.progress({
            busy: true,
            title: "Logging in",
            message: "using credentials for " + $scope.enteredMemberCredentials.userName + " - please wait"
          });
          LoggedInMemberService.login($scope.enteredMemberCredentials.userName, $scope.enteredMemberCredentials.password).then(function () {
            var loginResponse = LoggedInMemberService.loginResponse();
            if (LoggedInMemberService.memberLoggedIn()) {
              close();
              if (!LoggedInMemberService.loggedInMember().profileSettingsConfirmed) {
                return URLService.navigateTo("mailing-preferences");
              }
              return true;
            }
            else if (LoggedInMemberService.showResetPassword()) {
              return AuthenticationModalsService.showResetPasswordModal($scope.enteredMemberCredentials.userName, "Your password has expired, therefore you need to reset it to a new one before continuing.");
            } else {
              notify.showContactUs(true);
              notify.error({
                title: "Login failed",
                message: loginResponse.alertMessage
              });
            }
          });
        },
      }
    }]
  );



/* concatenated from src/legacy/src/app/js/mailChimpServices.js */

angular.module('ekwgApp')
  .factory('MailchimpConfig', ["Config", function (Config) {

    function getConfig() {
      return Config.getConfig('mailchimp', {
        mailchimp: {
          interestGroups: {
            walks: {interestGroupingId: undefined},
            socialEvents: {interestGroupingId: undefined},
            general: {interestGroupingId: undefined}
          },
          segments: {
            walks: {segmentId: undefined},
            socialEvents: {segmentId: undefined},
            general: {
              passwordResetSegmentId: undefined,
              forgottenPasswordSegmentId: undefined,
              committeeSegmentId: undefined
            }
          }
        }
      })
    }

    function saveConfig(config, key, saveCallback, errorSaveCallback) {
      return Config.saveConfig('mailchimp', config, key, saveCallback, errorSaveCallback);
    }

    return {
      getConfig: getConfig,
      saveConfig: saveConfig
    }

  }])
  .factory('MailchimpHttpService', ["$log", "$q", "$http", "MailchimpErrorParserService", function ($log, $q, $http, MailchimpErrorParserService) {

    var logger = $log.getInstance('MailchimpHttpService');
    $log.logLevels['MailchimpHttpService'] = $log.LEVEL.OFF;

    function call(serviceCallType, method, url, data, params) {
      var deferredTask = $q.defer();
      deferredTask.notify(serviceCallType);
      logger.debug(serviceCallType);
      $http({
        method: method,
        data: data,
        params: params,
        url: url
      }).then(function (response) {
        var responseData = response.data;
        var errorObject = MailchimpErrorParserService.extractError(responseData);
        if (errorObject.error) {
          var errorResponse = {message: serviceCallType + ' was not successful', error: errorObject.error};
          logger.debug(errorResponse);
          deferredTask.reject(errorResponse);
        } else {
          logger.debug('success', responseData);
          deferredTask.resolve(responseData);
          return responseData;
        }
      }).catch(function (response) {
        var responseData = response.data;
        var errorObject = MailchimpErrorParserService.extractError(responseData);
        var errorResponse = {message: serviceCallType + ' was not successful', error: errorObject.error};
        logger.debug(errorResponse);
        deferredTask.reject(errorResponse);
      });
      return deferredTask.promise;
    }

    return {
      call: call
    }

  }])
  .factory('MailchimpErrorParserService', ["$log", function ($log) {

    var logger = $log.getInstance('MailchimpErrorParserService');
    $log.logLevels['MailchimpErrorParserService'] = $log.LEVEL.OFF;

    function extractError(responseData) {
      var error;
      if (responseData && (responseData.error || responseData.errno)) {
        error = {error: responseData}
      } else if (responseData && responseData.errors && responseData.errors.length > 0) {
        error = {
          error: _.map(responseData.errors, function (error) {
            var response = error.error;
            if (error.email && error.email.email) {
              response += (': ' + error.email.email);
            }
            return response;
          }).join(', ')
        }
      } else {
        error = {error: undefined}
      }
      logger.debug('responseData:', responseData, 'error:', error)
      return error;
    }

    return {
      extractError: extractError
    }

  }])
  .factory('MailchimpLinkService', ["$log", "MAILCHIMP_APP_CONSTANTS", function ($log, MAILCHIMP_APP_CONSTANTS) {

    var logger = $log.getInstance('MailchimpLinkService');
    $log.logLevels['MailchimpLinkService'] = $log.LEVEL.OFF;

    function campaignPreview(webId) {
      return MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns/preview-content-html?id=" + webId;
    }

    function campaignEdit(webId) {
      return MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns/preview-content-html?id=" + webId;
    }

    return {
      campaignPreview: campaignPreview
    }

  }])
  .factory('MailchimpGroupService', ["$log", "$rootScope", "$q", "$filter", "DateUtils", "MailchimpConfig", "MailchimpHttpService", function ($log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService) {

    var logger = $log.getInstance('MailchimpGroupService');
    $log.logLevels['MailchimpGroupService'] = $log.LEVEL.OFF;

    var addInterestGroup = function (listType, interestGroupName, interestGroupingId) {
      return MailchimpHttpService.call('Adding Mailchimp Interest Group for ' + listType, 'POST', 'mailchimp/lists/' + listType + '/interestGroupAdd', {
        interestGroupingId: interestGroupingId,
        interestGroupName: interestGroupName
      });
    };

    var deleteInterestGroup = function (listType, interestGroupName, interestGroupingId) {
      return MailchimpHttpService.call('Deleting Mailchimp Interest Group for ' + listType, 'DELETE', 'mailchimp/lists/' + listType + '/interestGroupDel', {
        interestGroupingId: interestGroupingId,
        interestGroupName: interestGroupName
      });
    };

    var addInterestGrouping = function (listType, interestGroupingName, groups) {
      return MailchimpHttpService.call('Adding Mailchimp Interest Grouping for ' + listType, 'POST', 'mailchimp/lists/' + listType + '/interestGroupingAdd', {
        groups: groups,
        interestGroupingName: interestGroupingName
      });
    };

    var deleteInterestGrouping = function (listType, interestGroupingId) {
      return MailchimpHttpService.call('Deleting Mailchimp Interest Grouping for ' + listType, 'DELETE', 'mailchimp/lists/' + listType + '/interestGroupingDel', {interestGroupingId: interestGroupingId});
    };

    var listInterestGroupings = function (listType) {
      return MailchimpHttpService.call('Listing Mailchimp Interest Groupings for ' + listType, 'GET', 'mailchimp/lists/' + listType + '/interestGroupings');
    };

    var updateInterestGrouping = function (listType, interestGroupingId, interestGroupingName, interestGroupingValue) {
      return MailchimpHttpService.call('Updating Mailchimp Interest Groupings for ' + listType, 'PUT', 'mailchimp/lists/' + listType + '/interestGroupingUpdate',
        {
          interestGroupingId: interestGroupingId,
          interestGroupingName: interestGroupingName,
          interestGroupingValue: interestGroupingValue
        });
    };

    var updateInterestGroup = function (listType, oldName, newName) {
      return function (config) {
        var interestGroupingId = config.mailchimp.interestGroups[listType].interestGroupingId;
        return MailchimpHttpService.call('Updating Mailchimp Interest Group for ' + listType, 'PUT', 'mailchimp/lists/' + listType + '/interestGroupUpdate',
          {
            interestGroupingId: interestGroupingId,
            oldName: oldName,
            newName: newName
          })
          .then(returnInterestGroupingId(interestGroupingId));
      }
    };

    var saveInterestGroup = function (listType, oldName, newName) {
      oldName = oldName.substring(0, 60);
      newName = newName.substring(0, 60);
      return MailchimpConfig.getConfig()
        .then(updateInterestGroup(listType, oldName, newName))
        .then(findInterestGroup(listType, newName));
    };

    var createInterestGroup = function (listType, interestGroupName) {
      return MailchimpConfig.getConfig()
        .then(createOrUpdateInterestGroup(listType, interestGroupName))
        .then(findInterestGroup(listType, interestGroupName));
    };

    var createOrUpdateInterestGroup = function (listType, interestGroupName) {
      return function (config) {
        logger.debug('createOrUpdateInterestGroup using config', config);
        var interestGroupingName = s.titleize(s.humanize(listType));
        var interestGroupingId = config.mailchimp.interestGroups[listType].interestGroupingId;
        if (interestGroupingId) {
          return addInterestGroup(listType, interestGroupName, interestGroupingId)
            .then(returnInterestGroupingId(interestGroupingId));
        } else {
          return addInterestGrouping(listType, interestGroupingName + ' Interest Groups', [interestGroupName])
            .then(saveInterestGroupConfigAndReturnInterestGroupingId(listType, config));
        }
      }
    };

    var returnInterestGroupingId = function (interestGroupingId) {
      return function (response) {
        logger.debug('received', response, 'returning', interestGroupingId);
        return interestGroupingId;
      }
    };

    var saveInterestGroupConfigAndReturnInterestGroupingId = function (listType, config) {
      return function (response) {
        config.mailchimp.interestGroups[listType].interestGroupingId = response.id;
        logger.debug('saving config', config);
        return MailchimpConfig.saveConfig(config, function () {
          logger.debug('config save was successful');
          return response.id;
        }, function (error) {
          throw Error('config save was not successful. ' + error)
        });
      }
    };

    var findInterestGroup = function (listType, interestGroupName) {
      return function (interestGroupingId) {
        logger.debug('finding findInterestGroup ', interestGroupingId);
        return listInterestGroupings(listType)
          .then(filterInterestGroupings(interestGroupingId, interestGroupName));
      }
    };


    var filterInterestGroupings = function (interestGroupingId, interestGroupName) {
      return function (interestGroupings) {
        logger.debug('filterInterestGroupings: interestGroupings passed in ', interestGroupings, 'for interestGroupingId', interestGroupingId);

        var interestGrouping = _.find(interestGroupings, function (interestGrouping) {
          return interestGrouping.id === interestGroupingId;
        });

        logger.debug('filterInterestGroupings: interestGrouping returned ', interestGrouping);

        var interestGroup = _.find(interestGrouping.groups, function (group) {
          return group.name === interestGroupName;
        });

        logger.debug('filterInterestGroupings: interestGroup returned', interestGroup);
        return interestGroup;
      }
    };

    return {
      createInterestGroup: createInterestGroup,
      saveInterestGroup: saveInterestGroup
    }
  }])
  .factory('MailchimpSegmentService', ["$log", "$rootScope", "$q", "$filter", "DateUtils", "MailchimpConfig", "MailchimpHttpService", "EmailSubscriptionService", "MemberService", "StringUtils", function ($log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService, EmailSubscriptionService, MemberService, StringUtils) {

    var logger = $log.getInstance('MailchimpSegmentService');
    $log.logLevels['MailchimpSegmentService'] = $log.LEVEL.OFF;

    function addSegment(listType, segmentName) {
      return MailchimpHttpService.call('Adding Mailchimp segment for ' + listType, 'POST', 'mailchimp/lists/' + listType + '/segmentAdd', {segmentName: segmentName});
    }

    function resetSegment(listType, segmentId) {
      return MailchimpHttpService.call('Resetting Mailchimp segment for ' + listType, 'PUT', 'mailchimp/lists/' + listType + '/segmentReset', {segmentId: segmentId});
    }

    function deleteSegment(listType, segmentId) {
      return MailchimpHttpService.call('Deleting Mailchimp segment for ' + listType, 'DELETE', 'mailchimp/lists/' + listType + '/segmentDel/' + segmentId);
    }

    function callRenameSegment(listType, segmentId, segmentName) {
      return function () {
        return renameSegment(listType, segmentId, segmentName);
      }
    }

    function renameSegment(listType, segmentId, segmentNameInput) {
      var segmentName = StringUtils.stripLineBreaks(StringUtils.left(segmentNameInput, 99), true);
      logger.debug('renaming segment with name=\'' + segmentName + '\' length=' + segmentName.length);
      return MailchimpHttpService.call('Renaming Mailchimp segment for ' + listType, 'POST', 'mailchimp/lists/' + listType + '/segmentRename', {
        segmentId: segmentId,
        segmentName: segmentName
      });
    }

    function callAddSegmentMembers(listType, segmentId, segmentMembers) {
      return function () {
        return addSegmentMembers(listType, segmentId, segmentMembers);
      }
    }

    function addSegmentMembers(listType, segmentId, segmentMembers) {
      return MailchimpHttpService.call('Adding Mailchimp segment members ' + JSON.stringify(segmentMembers) + ' for ' + listType, 'POST', 'mailchimp/lists/' + listType + '/segmentMembersAdd', {
        segmentId: segmentId,
        segmentMembers: segmentMembers
      });
    }

    function callDeleteSegmentMembers(listType, segmentId, segmentMembers) {
      return function () {
        return deleteSegmentMembers(listType, segmentId, segmentMembers);
      }
    }

    function deleteSegmentMembers(listType, segmentId, segmentMembers) {
      return MailchimpHttpService.call('Deleting Mailchimp segment members ' + segmentMembers + ' for ' + listType, 'DELETE', 'mailchimp/lists/' + listType + '/segmentMembersDel', {
        segmentId: segmentId,
        segmentMembers: segmentMembers
      });
    }

    function listSegments(listType) {
      return MailchimpHttpService.call('Listing Mailchimp segments for ' + listType, 'GET', 'mailchimp/lists/' + listType + '/segments');
    }


    function buildSegmentMemberData(listType, memberIds, members) {
      var segmentMembers = _.chain(memberIds)
        .map(function (memberId) {
          return MemberService.toMember(memberId, members)
        })
        .filter(function (member) {
          return member && member.email;
        })
        .map(function (member) {
          return EmailSubscriptionService.addMailchimpIdentifiersToRequest(member, listType);
        })
        .value();
      if (!segmentMembers || segmentMembers.length === 0) throw new Error('No members were added to the ' + listType + ' email segment from the ' + memberIds.length + ' supplied members. Please check that they have a valid email address and are subscribed to ' + listType);

      return segmentMembers;
    }

    function saveSegment(listType, mailchimpConfig, memberIds, segmentName, members) {
      var segmentMembers = buildSegmentMemberData(listType, memberIds, members);
      logger.debug('saveSegment:buildSegmentMemberData:', listType, memberIds, segmentMembers);
      if (mailchimpConfig && mailchimpConfig.segmentId) {
        var segmentId = mailchimpConfig.segmentId;
        logger.debug('saveSegment:segmentId', mailchimpConfig);
        return resetSegment(listType, segmentId)
          .then(callRenameSegment(listType, segmentId, segmentName))
          .then(addSegmentMembersDuringUpdate(listType, segmentId, segmentMembers))
          .then(returnAddSegmentResponse({id: segmentId}));
      } else {
        return addSegment(listType, segmentName)
          .then(addSegmentMembersDuringAdd(listType, segmentMembers))
      }
    }

    function returnAddSegmentResponse(addSegmentResponse) {
      return function (addSegmentMembersResponse) {
        return {members: addSegmentMembersResponse.members, segment: addSegmentResponse};
      };
    }

    function returnAddSegmentAndMemberResponse(addSegmentResponse) {
      return function (addMemberResponse) {
        return ({segment: addSegmentResponse, members: addMemberResponse});
      };
    }

    function addSegmentMembersDuringUpdate(listType, segmentId, segmentMembers) {
      return function (renameSegmentResponse) {
        if (segmentMembers.length > 0) {
          return addSegmentMembers(listType, segmentId, segmentMembers)
            .then(returnAddSegmentAndMemberResponse(renameSegmentResponse));
        } else {
          return {segment: renameSegmentResponse.id, members: {}};
        }
      }
    }

    function addSegmentMembersDuringAdd(listType, segmentMembers) {
      return function (addSegmentResponse) {
        if (segmentMembers.length > 0) {
          return addSegmentMembers(listType, addSegmentResponse.id, segmentMembers)
            .then(returnAddSegmentAndMemberResponse(addSegmentResponse));
        } else {
          return {segment: addSegmentResponse, members: {}};
        }
      }
    }

    function getMemberSegmentId(member, segmentType) {
      if (member.mailchimpSegmentIds) return member.mailchimpSegmentIds[segmentType];
    }

    function setMemberSegmentId(member, segmentType, segmentId) {
      if (!member.mailchimpSegmentIds) member.mailchimpSegmentIds = {};
      member.mailchimpSegmentIds[segmentType] = segmentId;
    }

    function formatSegmentName(prefix) {
      var date = ' (' + DateUtils.nowAsValue() + ')';
      var segmentName = prefix.substring(0, 99 - date.length) + date;
      logger.debug('segmentName', segmentName, 'length', segmentName.length);
      return segmentName;
    }

    return {
      formatSegmentName: formatSegmentName,
      saveSegment: saveSegment,
      deleteSegment: deleteSegment,
      getMemberSegmentId: getMemberSegmentId,
      setMemberSegmentId: setMemberSegmentId
    }

  }])
  .factory('MailchimpListService', ["$log", "$rootScope", "$q", "$filter", "DateUtils", "MailchimpConfig", "MailchimpHttpService", "EmailSubscriptionService", "MemberService", function ($log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService, EmailSubscriptionService, MemberService) {

    var logger = $log.getInstance('MailchimpListService');
    $log.logLevels['MailchimpListService'] = $log.LEVEL.OFF;

    var listSubscribers = function (listType) {
      return MailchimpHttpService.call('Listing Mailchimp subscribers for ' + listType, 'GET', 'mailchimp/lists/' + listType);
    };

    var batchUnsubscribe = function (listType, subscribers) {
      return MailchimpHttpService.call('Batch unsubscribing members from Mailchimp List for ' + listType, 'POST', 'mailchimp/lists/' + listType + '/batchUnsubscribe', subscribers);
    };

    var batchUnsubscribeMembers = function (listType, allMembers, notificationCallback) {
      return listSubscribers(listType)
        .then(filterSubscriberResponsesForUnsubscriptions(listType, allMembers))
        .then(batchUnsubscribeForListType(listType, allMembers, notificationCallback))
        .then(returnUpdatedMembers);
    };

    function returnUpdatedMembers() {
      return MemberService.all();
    }

    function batchUnsubscribeForListType(listType, allMembers, notificationCallback) {
      return function (subscribers) {
        if (subscribers.length > 0) {
          return batchUnsubscribe(listType, subscribers)
            .then(removeSubscriberDetailsFromMembers(listType, allMembers, subscribers, notificationCallback));
        } else {
          notificationCallback('No members needed to be unsubscribed from ' + listType + ' list');
        }
      }
    }

    function removeSubscriberDetailsFromMembers(listType, allMembers, subscribers, notificationCallback) {
      return function () {
        var updatedMembers = _.chain(subscribers)
          .map(function (subscriber) {
            var member = EmailSubscriptionService.responseToMember(listType, allMembers, subscriber);
            if (member) {
              member.mailchimpLists[listType] = {subscribed: false, updated: true};
              member.$saveOrUpdate();
            } else {
              notificationCallback('Could not find member from ' + listType + ' response containing data ' + JSON.stringify(subscriber));
            }
            return member;
          })
          .filter(function (member) {
            return member;
          })
          .value();
        $q.all(updatedMembers).then(function () {
          notificationCallback('Successfully unsubscribed ' + updatedMembers.length + ' member(s) from ' + listType + ' list');
          return updatedMembers;
        })
      }
    }

    function filterSubscriberResponsesForUnsubscriptions(listType, allMembers) {
      return function (listResponse) {
        return _.chain(listResponse.data)
          .filter(function (subscriber) {
            return EmailSubscriptionService.includeSubscriberInUnsubscription(listType, allMembers, subscriber);
          })
          .map(function (subscriber) {
            return {
              email: subscriber.email,
              euid: subscriber.euid,
              leid: subscriber.leid
            };
          })
          .value();
      }
    }

    return {
      batchUnsubscribeMembers: batchUnsubscribeMembers
    }

  }])
  .factory('MailchimpCampaignService', ["MAILCHIMP_APP_CONSTANTS", "$log", "$rootScope", "$q", "$filter", "DateUtils", "MailchimpConfig", "MailchimpHttpService", function (MAILCHIMP_APP_CONSTANTS, $log, $rootScope, $q, $filter, DateUtils, MailchimpConfig, MailchimpHttpService) {

    var logger = $log.getInstance('MailchimpCampaignService');
    $log.logLevels['MailchimpCampaignService'] = $log.LEVEL.OFF;

    function addCampaign(campaignId, campaignName) {
      return MailchimpHttpService.call('Adding Mailchimp campaign ' + campaignId + ' with name ' + campaignName, 'POST', 'mailchimp/campaigns/' + campaignId + '/campaignAdd', {campaignName: campaignName});
    }

    function deleteCampaign(campaignId) {
      return MailchimpHttpService.call('Deleting Mailchimp campaign ' + campaignId, 'DELETE', 'mailchimp/campaigns/' + campaignId + '/delete');
    }

    function getContent(campaignId) {
      return MailchimpHttpService.call('Getting Mailchimp content for campaign ' + campaignId, 'GET', 'mailchimp/campaigns/' + campaignId + '/content');
    }

    function list(options) {
      return MailchimpHttpService.call('Listing Mailchimp campaigns', 'GET', 'mailchimp/campaigns/list', {}, options);
    }

    function setContent(campaignId, contentSections) {
      return contentSections ? MailchimpHttpService.call('Setting Mailchimp content for campaign ' + campaignId, 'POST', 'mailchimp/campaigns/' + campaignId + '/update', {
        updates: {
          name: "content",
          value: contentSections
        }
      }) : $q.when({
        result: "success",
        campaignId: campaignId,
        message: "setContent skipped as no content provided"
      })
    }

    function setOrClearSegment(replicatedCampaignId, optionalSegmentId) {
      if (optionalSegmentId) {
        return setSegmentId(replicatedCampaignId, optionalSegmentId);
      } else {
        return clearSegment(replicatedCampaignId)
      }
    }

    function setSegmentId(campaignId, segmentId) {
      return setSegmentOpts(campaignId, {saved_segment_id: segmentId});
    }

    function clearSegment(campaignId) {
      return setSegmentOpts(campaignId, []);
    }

    function setSegmentOpts(campaignId, value) {
      return MailchimpHttpService.call('Setting Mailchimp segment opts for campaign ' + campaignId + ' with value ' + JSON.stringify(value), 'POST', 'mailchimp/campaigns/' + campaignId + '/update', {
        updates: {
          name: "segment_opts",
          value: value
        }
      });
    }

    function setCampaignOptions(campaignId, campaignName, otherOptions) {
      var value = angular.extend({}, {
        title: campaignName.substring(0, 99),
        subject: campaignName
      }, otherOptions);

      return MailchimpHttpService.call('Setting Mailchimp campaign options for id ' + campaignId + ' with ' + JSON.stringify(value), 'POST', 'mailchimp/campaigns/' + campaignId + '/update', {
        updates: {
          name: "options",
          value: value
        }
      });
    }

    function replicateCampaign(campaignId) {
      return MailchimpHttpService.call('Replicating Mailchimp campaign ' + campaignId, 'POST', 'mailchimp/campaigns/' + campaignId + '/replicate');
    }

    function sendCampaign(campaignId) {
      if (!MAILCHIMP_APP_CONSTANTS.allowSendCampaign) throw new Error('You cannot send campaign ' + campaignId + ' as sending has been disabled');
      return MailchimpHttpService.call('Sending Mailchimp campaign ' + campaignId, 'POST', 'mailchimp/campaigns/' + campaignId + '/send');
    }

    function listCampaigns() {
      return MailchimpHttpService.call('Listing Mailchimp campaigns', 'GET', 'mailchimp/campaigns/list');
    }

    function replicateAndSendWithOptions(options) {
      logger.debug('replicateAndSendWithOptions:options', options);
      return replicateCampaign(options.campaignId)
        .then(function (replicateCampaignResponse) {
          logger.debug('replicateCampaignResponse', replicateCampaignResponse);
          var replicatedCampaignId = replicateCampaignResponse.id;
          return setCampaignOptions(replicatedCampaignId, options.campaignName, options.otherSegmentOptions)
            .then(function (renameResponse) {
              logger.debug('renameResponse', renameResponse);
              return setContent(replicatedCampaignId, options.contentSections)
                .then(function (setContentResponse) {
                  logger.debug('setContentResponse', setContentResponse);
                  return setOrClearSegment(replicatedCampaignId, options.segmentId)
                    .then(function (setSegmentResponse) {
                      logger.debug('setSegmentResponse', setSegmentResponse);
                      return options.dontSend ? replicateCampaignResponse : sendCampaign(replicatedCampaignId)
                    })
                })
            })
        });
    }

    return {
      replicateAndSendWithOptions: replicateAndSendWithOptions,
      list: list
    }

  }]);

/* concatenated from src/legacy/src/app/js/mailingPreferencesController.js */

angular.module('ekwgApp')
  .controller('MailingPreferencesController', ["$log", "$scope", "ProfileConfirmationService", "Notifier", "URLService", "LoggedInMemberService", "memberId", "close", function ($log, $scope, ProfileConfirmationService, Notifier, URLService, LoggedInMemberService, memberId, close) {

    var logger = $log.getInstance("MailingPreferencesController");
    $log.logLevels["MailingPreferencesController"] = $log.LEVEL.OFF;

    $scope.notify = {};
    var notify = Notifier($scope.notify);

    LoggedInMemberService.getMemberForMemberId(memberId)
      .then(function (member) {
        logger.info('memberId ->', memberId, 'member ->', member);
        $scope.member = member;
      });

    function saveOrUpdateUnsuccessful(message) {
      notify.showContactUs(true);
      notify.error({
        continue: true,
        title: "Error in saving mailing preferences",
        message: "Changes to your mailing preferences could not be saved. " + (message || "Please try again later.")
      });
    }

    $scope.actions = {
      save: function () {
        ProfileConfirmationService.confirmProfile($scope.member);
        LoggedInMemberService.saveMember($scope.member, $scope.actions.close, saveOrUpdateUnsuccessful);
      },
      close: function () {
        close();
      }
    };

  }]);

/* concatenated from src/legacy/src/app/js/markdownEditor.js */

angular.module('ekwgApp')
  .component('markdownEditor', {
    templateUrl: 'ekwg-legacy/partials/components/markdown-editor.html',
    controller: ["$cookieStore", "$log", "$rootScope", "$scope", "$element", "$attrs", "ContentText", function ($cookieStore, $log, $rootScope, $scope, $element, $attrs, ContentText) {
      var logger = $log.getInstance('MarkdownEditorController');
      $log.logLevels['MarkdownEditorController'] = $log.LEVEL.OFF;
      var ctrl = this;
      ctrl.userEdits = {preview: true, saveInProgress: false, revertInProgress: false};

      function assignData(data) {
        ctrl.data = data;
        ctrl.originalData = _.clone(data);
        logger.debug(ctrl.name, 'content retrieved:', data);
        return data;
      }

      function populateContent(type) {
        if (type) ctrl.userEdits[type + 'InProgress'] = true;
        return ContentText.forName(ctrl.name).then(function (data) {
          data = assignData(data);
          if (type) ctrl.userEdits[type + 'InProgress'] = false;
          return data;
        });
      }

      ctrl.edit = function () {
        ctrl.userEdits.preview = false;
      };

      ctrl.revert = function () {
        logger.debug('reverting ' + ctrl.name, 'content');
        ctrl.data = _.clone(ctrl.originalData);
      };

      ctrl.dirty = function () {
        var dirty = ctrl.data && ctrl.originalData && (ctrl.data.text !== ctrl.originalData.text);
        logger.debug(ctrl.name, 'dirty ->', dirty);
        return dirty;
      };

      ctrl.revertGlyph = function () {
        return ctrl.userEdits.revertInProgress ? "fa fa-spinner fa-spin" : "glyphicon glyphicon-remove markdown-preview-icon"
      };

      ctrl.saveGlyph = function () {
        return ctrl.userEdits.saveInProgress ? "fa fa-spinner fa-spin" : "glyphicon glyphicon-ok markdown-preview-icon"
      };

      ctrl.save = function () {
        ctrl.userEdits.saveInProgress = true;
        logger.info('saving', ctrl.name, 'content', ctrl.data, $element, $attrs);
        ctrl.data.$saveOrUpdate().then(function (data) {
          ctrl.userEdits.saveInProgress = false;
          assignData(data);
        })
      };

      ctrl.editSite = function () {
        return $cookieStore.get('editSite');
      };

      ctrl.rows = function () {
        var text = _.property(["data", "text"])(ctrl);
        var rows = text ? text.split(/\r*\n/).length + 1 : 1;
        logger.info('number of rows in text ', text, '->', rows);
        return rows;
      };


      ctrl.preview = function () {
        logger.info('previewing ' + ctrl.name, 'content', $element, $attrs);
        ctrl.userEdits.preview = true;
      };

      ctrl.$onInit = function () {
        logger.debug('initialising:', ctrl.name, 'content, editSite:', ctrl.editSite());
        if (!ctrl.description) {
          ctrl.description = ctrl.name;
        }
        populateContent();
      };

    }],
    bindings: {
      name: '@',
      description: '@',
    }
  });


/* concatenated from src/legacy/src/app/js/meetupServices.js */

angular.module('ekwgApp')
  .factory('MeetupService', ["$log", "$http", "HTTPResponseService", function ($log, $http, HTTPResponseService) {

    var logger = $log.getInstance('MeetupService');
    $log.logLevels['MeetupService'] = $log.LEVEL.OFF;

    return {
      config: function () {
        return $http.get('/meetup/config').then(HTTPResponseService.returnResponse);
      },
      eventUrlFor: function (meetupEventUrl) {
        return $http.get('/meetup/config').then(HTTPResponseService.returnResponse).then(function (meetupConfig) {
          return meetupConfig.url + '/' + meetupConfig.group + '/events/' + meetupEventUrl;
        });
      },
      eventsForStatus: function (status) {
        var queriedStatus = status || 'upcoming';
        return $http({
          method: 'get',
          params: {
            status: queriedStatus,
          },
          url: '/meetup/events'
        }).then(function (response) {
          var returnValue = HTTPResponseService.returnResponse(response);
          logger.debug('eventsForStatus', queriedStatus, returnValue);
          return returnValue;
        })
      }
    }
  }]);




/* concatenated from src/legacy/src/app/js/memberAdmin.js */

angular.module('ekwgApp')
  .controller('MemberAdminController',
    ["$timeout", "$location", "$window", "$log", "$q", "$rootScope", "$routeParams", "$scope", "ModalService", "Upload", "StringUtils", "DbUtils", "URLService", "LoggedInMemberService", "MemberService", "MemberAuditService", "MemberBulkLoadAuditService", "MemberUpdateAuditService", "ProfileConfirmationService", "EmailSubscriptionService", "DateUtils", "MailchimpConfig", "MailchimpSegmentService", "MemberNamingService", "MailchimpCampaignService", "MailchimpListService", "Notifier", "ErrorMessageService", "MemberBulkUploadService", "ContentMetaDataService", "MONGOLAB_CONFIG", "MAILCHIMP_APP_CONSTANTS", function ($timeout, $location, $window, $log, $q, $rootScope, $routeParams, $scope, ModalService, Upload, StringUtils, DbUtils, URLService, LoggedInMemberService, MemberService, MemberAuditService,
              MemberBulkLoadAuditService, MemberUpdateAuditService, ProfileConfirmationService, EmailSubscriptionService, DateUtils, MailchimpConfig, MailchimpSegmentService, MemberNamingService,
              MailchimpCampaignService, MailchimpListService, Notifier, ErrorMessageService, MemberBulkUploadService, ContentMetaDataService, MONGOLAB_CONFIG, MAILCHIMP_APP_CONSTANTS) {

      var logger = $log.getInstance('MemberAdminController');
      var noLogger = $log.getInstance('MemberAdminControllerNoLogger');
      $log.logLevels['MemberAdminController'] = $log.LEVEL.OFF;
      $log.logLevels['MemberAdminControllerNoLogger'] = $log.LEVEL.OFF;
      $scope.memberAdminBaseUrl = ContentMetaDataService.baseUrl('memberAdmin');

      $scope.notify = {};
      var notify = Notifier($scope.notify);
      notify.setBusy();

      var DESCENDING = '▼';
      var ASCENDING = '▲';

      $scope.today = DateUtils.momentNowNoTime().valueOf();
      $scope.currentMember = {};

      $scope.display = {
        saveInProgress: false
      };

      $scope.calculateMemberFilterDate = function () {
        $scope.display.memberFilterDate = DateUtils.momentNowNoTime().subtract($scope.display && $scope.display.emailType.monthsInPast, 'months').valueOf();
      };

      $scope.showArea = function (area) {
        URLService.navigateTo('admin', area)
      };

      $scope.display.emailTypes = [$scope.display.emailType];
      $scope.dropSupported = true;
      $scope.memberAdminOpen = !URLService.hasRouteParameter('expenseId') && (URLService.isArea('member-admin') || URLService.noArea());
      $scope.memberBulkLoadOpen = URLService.isArea('member-bulk-load');
      $scope.memberAuditOpen = URLService.isArea('member-audit');

      LoggedInMemberService.showLoginPromptWithRouteParameter('expenseId');

      if (LoggedInMemberService.memberLoggedIn()) {
        refreshMembers()
          .then(refreshMemberAudit)
          .then(refreshMemberBulkLoadAudit)
          .then(refreshMemberUpdateAudit)
          .then(notify.clearBusy);
      } else {
        notify.clearBusy();
      }

      $scope.currentMemberBulkLoadDisplayDate = function () {
        return DateUtils.currentMemberBulkLoadDisplayDate();
      };

      $scope.viewMailchimpListEntry = function (item) {
        $window.open(MAILCHIMP_APP_CONSTANTS.apiServer + "/lists/members/view?id=" + item, '_blank');
      };


      $scope.showSendEmailsDialog = function () {
        $scope.alertTypeResetPassword = false;
        $scope.display.emailMembers = [];
        ModalService.showModal({
          templateUrl: "ekwg-legacy/partials/admin/send-emails-dialog.html",
          controller: "MemberAdminSendEmailsController",
          preClose: function (modal) {
            logger.debug('preClose event with modal', modal);
            modal.element.modal('hide');
          },
          inputs: {
            members: $scope.members
          }
        }).then(function (modal) {
          logger.debug('modal event with modal', modal);
          modal.element.modal();
          modal.close.then(function (result) {
            logger.debug('close event with result', result);
          });
        })
      };


      function handleSaveError(errorResponse) {
        $scope.display.saveInProgress = false;
        applyAllowEdits();
        var message = ErrorMessageService.stringify(errorResponse);
        var duplicate = s.include(message, 'duplicate');
        logger.debug('errorResponse', errorResponse, 'duplicate', duplicate);
        if (duplicate) {
          message = 'Duplicate data was detected. A member record must have a unique Email Address, Display Name, Ramblers Membership Number and combination of First Name, Last Name and Alias. Please amend the current member and try again.';
          $scope.display.duplicate = true;
        }
        notify.clearBusy();
        notify.error({
          title: 'Member could not be saved',
          message: message
        });
      }

      function resetSendFlags() {
        logger.debug('resetSendFlags');
        $scope.display.saveInProgress = false;
        return applyAllowEdits();
      }

      $scope.showPasswordResetAlert = function () {
        return $scope.notify.showAlert && $scope.alertTypeResetPassword;
      };

      $scope.uploadSessionStatuses = [
        {title: "All"},
        {status: "created", title: "Created"},
        {status: "summary", title: "Summary"},
        {status: "skipped", title: "Skipped"},
        {status: "updated", title: "Updated"},
        {status: "error", title: "Error"}];


      $scope.filters = {
        uploadSession: {selected: undefined},
        memberUpdateAudit: {
          query: $scope.uploadSessionStatuses[0],
          orderByField: 'updateTime',
          reverseSort: true,
          sortDirection: DESCENDING
        },
        membersUploaded: {
          query: '',
          orderByField: 'email',
          reverseSort: true,
          sortDirection: DESCENDING
        }
      };

      function applySortTo(field, filterSource) {
        logger.debug('sorting by field', field, 'current value of filterSource', filterSource);
        if (field === 'member') {
          filterSource.orderByField = 'memberId | memberIdToFullName : members : "" : true';
        } else {
          filterSource.orderByField = field;
        }
        filterSource.reverseSort = !filterSource.reverseSort;
        filterSource.sortDirection = filterSource.reverseSort ? DESCENDING : ASCENDING;
        logger.debug('sorting by field', field, 'new value of filterSource', filterSource);
      }

      $scope.uploadSessionChanged = function () {
        notify.setBusy();
        notify.hide();
        refreshMemberUpdateAudit().then(notify.clearBusy);
      };

      $scope.sortMembersUploadedBy = function (field) {
        applySortTo(field, $scope.filters.membersUploaded);
      };

      $scope.sortMemberUpdateAuditBy = function (field) {
        applySortTo(field, $scope.filters.memberUpdateAudit);
      };

      $scope.showMemberUpdateAuditColumn = function (field) {
        return s.startsWith($scope.filters.memberUpdateAudit.orderByField, field);
      };

      $scope.showMembersUploadedColumn = function (field) {
        return $scope.filters.membersUploaded.orderByField === field;
      };

      $scope.sortMembersBy = function (field) {
        applySortTo(field, $scope.filters.members);
      };

      $scope.showMembersColumn = function (field) {
        return s.startsWith($scope.filters.members.orderByField, field);
      };

      $scope.toGlyphicon = function (status) {
        if (status === 'created') return "glyphicon glyphicon-plus green-icon";
        if (status === 'complete' || status === 'summary') return "glyphicon-ok green-icon";
        if (status === 'success') return "glyphicon-ok-circle green-icon";
        if (status === 'info') return "glyphicon-info-sign blue-icon";
        if (status === 'updated') return "glyphicon glyphicon-pencil green-icon";
        if (status === 'error') return "glyphicon-remove-circle red-icon";
        if (status === 'skipped') return "glyphicon glyphicon-thumbs-up green-icon";
      };

      $scope.filters.members = {
        query: '',
        orderByField: 'firstName',
        reverseSort: false,
        sortDirection: ASCENDING,
        filterBy: [
          {
            title: "Active Group Member", group: 'Group Settings', filter: function (member) {
              return member.groupMember;
            }
          },
          {
            title: "All Members", filter: function () {
              return true;
            }
          },
          {
            title: "Active Social Member", group: 'Group Settings', filter: MemberService.filterFor.SOCIAL_MEMBERS
          },
          {
            title: "Membership Date Active/Not set", group: 'From Ramblers Supplied Datas', filter: function (member) {
              return !member.membershipExpiryDate || (member.membershipExpiryDate >= $scope.today);
            }
          },
          {
            title: "Membership Date Expired", group: 'From Ramblers Supplied Data', filter: function (member) {
              return member.membershipExpiryDate < $scope.today;
            }
          },
          {
            title: "Not received in last Ramblers Bulk Load",
            group: 'From Ramblers Supplied Data',
            filter: function (member) {
              return !member.receivedInLastBulkLoad;
            }
          },
          {
            title: "Was received in last Ramblers Bulk Load",
            group: 'From Ramblers Supplied Data',
            filter: function (member) {
              return member.receivedInLastBulkLoad;
            }
          },
          {
            title: "Password Expired", group: 'Other Settings', filter: function (member) {
              return member.expiredPassword;
            }
          },
          {
            title: "Walk Admin", group: 'Administrators', filter: function (member) {
              return member.walkAdmin;
            }
          },
          {
            title: "Walk Change Notifications", group: 'Administrators', filter: function (member) {
              return member.walkChangeNotifications;
            }
          },
          {
            title: "Social Admin", group: 'Administrators', filter: function (member) {
              return member.socialAdmin;
            }
          },
          {
            title: "Member Admin", group: 'Administrators', filter: function (member) {
              return member.memberAdmin;
            }
          },
          {
            title: "Finance Admin", group: 'Administrators', filter: function (member) {
              return member.financeAdmin;
            }
          },
          {
            title: "File Admin", group: 'Administrators', filter: function (member) {
              return member.fileAdmin;
            }
          },
          {
            title: "Treasury Admin", group: 'Administrators', filter: function (member) {
              return member.treasuryAdmin;
            }
          },
          {
            title: "Content Admin", group: 'Administrators', filter: function (member) {
              return member.contentAdmin;
            }
          },
          {
            title: "Committee Member", group: 'Administrators', filter: function (member) {
              return member.committee;
            }
          },
          {
            title: "Subscribed to the General emails list",
            group: 'Email Subscriptions',
            filter: MemberService.filterFor.GENERAL_MEMBERS_SUBSCRIBED
          },
          {
            title: "Subscribed to the Walks email list",
            group: 'Email Subscriptions',
            filter: MemberService.filterFor.WALKS_MEMBERS_SUBSCRIBED
          },
          {
            title: "Subscribed to the Social email list",
            group: 'Email Subscriptions',
            filter: MemberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED
          }
        ]
      };

      $scope.filters.members.filterSelection = $scope.filters.members.filterBy[0].filter;

      $scope.memberAuditTabs = [
        {title: "All Member Logins", active: true}
      ];

      applyAllowEdits();
      $scope.allowConfirmDelete = false;
      $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      $scope.members = [];
      $scope.memberAudit = [];
      $scope.memberUpdateAudit = [];
      $scope.membersUploaded = [];

      $scope.resetAllBatchSubscriptions = function () {
        // careful with calling this - it resets all batch subscriptions to default values
        return EmailSubscriptionService.resetAllBatchSubscriptions($scope.members, false);
      };

      function updateWalksList(members) {
        return EmailSubscriptionService.createBatchSubscriptionForList('walks', members);
      }

      function updateSocialEventsList(members) {
        return EmailSubscriptionService.createBatchSubscriptionForList('socialEvents', members);
      }

      function updateGeneralList(members) {
        return EmailSubscriptionService.createBatchSubscriptionForList('general', members);
      }

      function notifyUpdatesComplete(members) {
        notify.success({title: 'Mailchimp updates', message: 'Mailchimp lists were updated successfully'});
        $scope.members = members;
        notify.clearBusy();
      }

      $scope.deleteMemberAudit = function (filteredMemberAudit) {
        removeAllRecordsAndRefresh(filteredMemberAudit, refreshMemberAudit, 'member audit');
      };

      $scope.deleteMemberUpdateAudit = function (filteredMemberUpdateAudit) {
        removeAllRecordsAndRefresh(filteredMemberUpdateAudit, refreshMemberUpdateAudit, 'member update audit');
      };

      function removeAllRecordsAndRefresh(records, refreshFunction, type) {
        notify.success('Deleting ' + records.length + ' ' + type + ' record(s)');
        var removePromises = [];
        angular.forEach(records, function (record) {
          removePromises.push(record.$remove())
        });

        $q.all(removePromises).then(function () {
          notify.success('Deleted ' + records.length + ' ' + type + ' record(s)');
          refreshFunction.apply();
        });
      }

      $scope.$on('memberLoginComplete', function () {
        applyAllowEdits('memberLoginComplete');
        refreshMembers();
        refreshMemberAudit();
        refreshMemberBulkLoadAudit()
          .then(refreshMemberUpdateAudit);
      });

      $scope.$on('memberSaveComplete', function () {
        refreshMembers();
      });

      $scope.$on('memberLogoutComplete', function () {
        applyAllowEdits('memberLogoutComplete');
      });

      $scope.createMemberFromAudit = function (memberFromAudit) {
        var member = new MemberService(memberFromAudit);
        EmailSubscriptionService.defaultMailchimpSettings(member, true);
        member.groupMember = true;
        showMemberDialog(member, 'Add New');
        notify.warning({
          title: 'Recreating Member',
          message: "Note that clicking Save immediately on this member is likely to cause the same error to occur as was originally logged in the audit. Therefore make the necessary changes here to allow the member record to be saved successfully"
        })
      };

      $scope.addMember = function () {
        var member = new MemberService();
        EmailSubscriptionService.defaultMailchimpSettings(member, true);
        member.groupMember = true;
        showMemberDialog(member, 'Add New');
      };

      $scope.viewMember = function (member) {
        showMemberDialog(member, 'View');
      };

      $scope.editMember = function (member) {
        showMemberDialog(member, 'Edit Existing');
      };

      $scope.deleteMemberDetails = function () {
        $scope.allowDelete = false;
        $scope.allowConfirmDelete = true;
      };

      function unsubscribeWalksList() {
        return MailchimpListService.batchUnsubscribeMembers('walks', $scope.members, notify.success);
      }

      function unsubscribeSocialEventsList(members) {
        return MailchimpListService.batchUnsubscribeMembers('socialEvents', members, notify.success);
      }

      function unsubscribeGeneralList(members) {
        return MailchimpListService.batchUnsubscribeMembers('general', members, notify.success);
      }

      $scope.updateMailchimpLists = function () {
        $scope.display.saveInProgress = true;
        return $q.when(notify.success('Sending updates to Mailchimp lists', true))
          .then(refreshMembers, notify.error, notify.success)
          .then(updateWalksList, notify.error, notify.success)
          .then(updateSocialEventsList, notify.error, notify.success)
          .then(updateGeneralList, notify.error, notify.success)
          .then(unsubscribeWalksList, notify.error, notify.success)
          .then(unsubscribeSocialEventsList, notify.error, notify.success)
          .then(unsubscribeGeneralList, notify.error, notify.success)
          .then(notifyUpdatesComplete, notify.error, notify.success)
          .then(resetSendFlags)
          .catch(mailchimpError);
      };

      function mailchimpError(errorResponse) {
        resetSendFlags();
        notify.error({
          title: 'Mailchimp updates failed',
          message: (errorResponse.message || errorResponse) + (errorResponse.error ? ('. Error was: ' + ErrorMessageService.stringify(errorResponse.error)) : '')
        });
        notify.clearBusy();
      }

      $scope.confirmDeleteMemberDetails = function () {
        $scope.currentMember.$remove(hideMemberDialogAndRefreshMembers);
      };

      $scope.cancelMemberDetails = function () {
        hideMemberDialogAndRefreshMembers();
      };

      $scope.profileSettingsConfirmedChecked = function () {
        ProfileConfirmationService.processMember($scope.currentMember);
      };

      $scope.refreshMemberAudit = refreshMemberAudit;

      $scope.memberUrl = function () {
        return $scope.currentMember && $scope.currentMember.$id && (MONGOLAB_CONFIG.baseUrl + MONGOLAB_CONFIG.database + '/collections/members/' + $scope.currentMember.$id());
      };

      $scope.saveMemberDetails = function () {
        var member = DateUtils.convertDateFieldInObject($scope.currentMember, 'membershipExpiryDate');
        $scope.display.saveInProgress = true;

        if (!member.userName) {
          member.userName = MemberNamingService.createUniqueUserName(member, $scope.members);
          logger.debug('creating username', member.userName);
        }

        if (!member.displayName) {
          member.displayName = MemberNamingService.createUniqueDisplayName(member, $scope.members);
          logger.debug('creating displayName', member.displayName);
        }

        function preProcessMemberBeforeSave() {
          DbUtils.removeEmptyFieldsIn(member);
          return EmailSubscriptionService.resetUpdateStatusForMember(member);
        }

        function removeEmptyFieldsIn(obj) {
          _.each(obj, function (value, field) {
            logger.debug('processing', typeof(field), 'field', field, 'value', value);
            if (_.contains([null, undefined, ""], value)) {
              logger.debug('removing non-populated', typeof(field), 'field', field);
              delete obj[field];
            }
          });
        }

        function saveAndHide() {
          return DbUtils.auditedSaveOrUpdate(member, hideMemberDialogAndRefreshMembers, notify.error)
        }

        $q.when(notify.success('Saving member', true))
          .then(preProcessMemberBeforeSave, notify.error, notify.success)
          .then(saveAndHide, notify.error, notify.success)
          .then(resetSendFlags)
          .then(function () {
            return notify.success('Member saved successfully');
          })
          .catch(handleSaveError)
      };

      $scope.copyDetailsToNewMember = function () {
        var copiedMember = new MemberService($scope.currentMember);
        delete copiedMember._id;
        EmailSubscriptionService.defaultMailchimpSettings(copiedMember, true);
        ProfileConfirmationService.unconfirmProfile(copiedMember);
        showMemberDialog(copiedMember, 'Copy Existing');
        notify.success('Existing Member copied! Make changes here and save to create new member.')
      };

      function applyAllowEdits() {
        $scope.allowEdits = LoggedInMemberService.allowMemberAdminEdits();
        $scope.allowCopy = LoggedInMemberService.allowMemberAdminEdits();
        return true;
      }

      function findLastLoginTimeForMember(member) {
        var memberAudit = _.chain($scope.memberAudit)
          .filter(function (memberAudit) {
            return memberAudit.userName === member.userName;
          })
          .sortBy(function (memberAudit) {
            return memberAudit.lastLoggedIn;
          })
          .last()
          .value();
        return memberAudit === undefined ? undefined : memberAudit.loginTime;
      }


      $scope.bulkUploadRamblersDataStart = function () {
        $('#select-bulk-load-file').click();
      };

      $scope.resetSendFlagsAndNotifyError = function (error) {
        logger.error('resetSendFlagsAndNotifyError', error);
        resetSendFlags();
        return notify.error(error);
      };

      $scope.bulkUploadRamblersDataOpenFile = function (file) {
        if (file) {
          var fileUpload = file;
          $scope.display.saveInProgress = true;

          function bulkUploadRamblersResponse(memberBulkLoadServerResponse) {
            return MemberBulkUploadService.processMembershipRecords(file, memberBulkLoadServerResponse, $scope.members, notify)
          }

          function bulkUploadRamblersProgress(evt) {
            fileUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
            logger.debug("bulkUploadRamblersProgress:progress event", evt);
          }

          $scope.uploadedFile = Upload.upload({
            url: 'uploadRamblersData',
            method: 'POST',
            file: file
          }).then(bulkUploadRamblersResponse, $scope.resetSendFlagsAndNotifyError, bulkUploadRamblersProgress)
            .then(refreshMemberBulkLoadAudit)
            .then(refreshMemberUpdateAudit)
            .then(validateBulkUploadProcessingBeforeMailchimpUpdates)
            .catch($scope.resetSendFlagsAndNotifyError);
        }
      };

      function showMemberDialog(member, memberEditMode) {
        logger.debug('showMemberDialog:', memberEditMode, member);
        $scope.alertTypeResetPassword = false;
        var existingRecordEditEnabled = $scope.allowEdits && s.startsWith(memberEditMode, 'Edit');
        $scope.allowConfirmDelete = false;
        $scope.allowCopy = existingRecordEditEnabled;
        $scope.allowDelete = existingRecordEditEnabled;
        $scope.memberEditMode = memberEditMode;
        $scope.currentMember = member;
        $scope.currentMemberUpdateAudit = [];
        if ($scope.currentMember.$id()) {
          logger.debug('querying MemberUpdateAuditService for memberId', $scope.currentMember.$id());
          MemberUpdateAuditService.query({memberId: $scope.currentMember.$id()}, {sort: {updateTime: -1}})
            .then(function (data) {
              logger.debug('MemberUpdateAuditService:', data.length, 'events', data);
              $scope.currentMemberUpdateAudit = data;
            });

          $scope.lastLoggedIn = findLastLoginTimeForMember(member);
        } else {
          logger.debug('new member with default values', $scope.currentMember);
        }
        $('#member-admin-dialog').modal();

      }

      function hideMemberDialogAndRefreshMembers() {
        $q.when($('#member-admin-dialog').modal('hide'))
          .then(refreshMembers)
          .then(notify.clearBusy)
          .then(notify.hide)
      }

      function refreshMembers() {
        if (LoggedInMemberService.allowMemberAdminEdits()) {
          return MemberService.all()
            .then(function (refreshedMembers) {
              $scope.members = refreshedMembers;
              return $scope.members;
            });

        }
      }

      function refreshMemberAudit() {
        if (LoggedInMemberService.allowMemberAdminEdits()) {
          MemberAuditService.all({limit: 100, sort: {loginTime: -1}}).then(function (memberAudit) {
            logger.debug('refreshed', memberAudit && memberAudit.length, 'member audit records');
            $scope.memberAudit = memberAudit;
          });
        }
        return true;
      }

      function refreshMemberBulkLoadAudit() {
        if (LoggedInMemberService.allowMemberAdminEdits()) {
          return MemberBulkLoadAuditService.all({limit: 100, sort: {createdDate: -1}}).then(function (uploadSessions) {
            logger.debug('refreshed', uploadSessions && uploadSessions.length, 'upload sessions');
            $scope.uploadSessions = uploadSessions;
            $scope.filters.uploadSession.selected = _.first(uploadSessions);
            return $scope.filters.uploadSession.selected;
          });
        } else {
          return true;
        }
      }

      function migrateAudits() {
        // temp - remove this!
        MemberUpdateAuditService.all({
          limit: 10000,
          sort: {updateTime: -1}
        }).then(function (allMemberUpdateAudit) {

          logger.debug('temp queried all', allMemberUpdateAudit && allMemberUpdateAudit.length, 'member audit records');
          var keys = [];
          var memberUpdateAuditServicePromises = [];
          var memberBulkLoadAuditServicePromises = [];
          var bulkAudits = _.chain(allMemberUpdateAudit)
          // .filter(function (audit) {
          //   return !audit.uploadSessionId;
          // })
            .map(function (audit) {
              var auditLog = {
                fileName: audit.fileName,
                createdDate: DateUtils.asValueNoTime(audit.updateTime),
                auditLog: [
                  {
                    "status": "complete",
                    "message": "Migrated audit log for upload of file " + audit.fileName
                  }
                ]
              };

              return auditLog;
            })
            .uniq(JSON.stringify)
            .map(function (auditLog) {
              return new MemberBulkLoadAuditService(auditLog).$save()
                .then(function (auditResponse) {
                  memberBulkLoadAuditServicePromises.push(auditResponse);
                  logger.debug('saved bulk load session id', auditResponse.$id(), 'number', memberBulkLoadAuditServicePromises.length);
                  return auditResponse;
                });
            })
            .value();

          function saveAudit(audit) {
            memberUpdateAuditServicePromises.push(audit.$saveOrUpdate());
            logger.debug('saved', audit.uploadSessionId, 'to audit number', memberUpdateAuditServicePromises.length);
          }

          $q.all(bulkAudits).then(function (savedBulkAuditRecords) {
            logger.debug('saved bulk load sessions', savedBulkAuditRecords);
            _.each(allMemberUpdateAudit, function (audit) {
              var parentBulkAudit = _.findWhere(savedBulkAuditRecords, {
                fileName: audit.fileName,
                createdDate: DateUtils.asValueNoTime(audit.updateTime)
              });
              if (parentBulkAudit) {
                audit.uploadSessionId = parentBulkAudit.$id();
                saveAudit(audit);
              } else {
                logger.error('no match for audit record', audit);
              }
            });
            $q.all(memberUpdateAuditServicePromises).then(function (values) {
              logger.debug('saved', values.length, 'audit records');
            });
          });
        });
      }

      function refreshMemberUpdateAudit() {
        if (LoggedInMemberService.allowMemberAdminEdits()) {
          // migrateAudits();
          if ($scope.filters.uploadSession.selected && $scope.filters.uploadSession.selected.$id) {
            var uploadSessionId = $scope.filters.uploadSession.selected.$id();
            var query = {uploadSessionId: uploadSessionId};
            if ($scope.filters.memberUpdateAudit.query.status) {
              angular.extend(query, {memberAction: $scope.filters.memberUpdateAudit.query.status})
            }
            logger.debug('querying member audit records with', query);
            return MemberUpdateAuditService.query(query, {sort: {updateTime: -1}}).then(function (memberUpdateAudit) {
              $scope.memberUpdateAudit = memberUpdateAudit;
              logger.debug('refreshed', memberUpdateAudit && memberUpdateAudit.length, 'member audit records');
              return $scope.memberUpdateAudit;
            });
          } else {
            $scope.memberUpdateAudit = [];
            logger.debug('no member audit records');
            return $q.when($scope.memberUpdateAudit);
          }
        }
      }

      function auditSummary() {
        return _.groupBy($scope.memberUpdateAudit, function (auditItem) {
          return auditItem.memberAction || 'unknown';
        });
      }

      function auditSummaryFormatted(auditSummary) {

        var total = _.reduce(auditSummary, function (memo, value) {
          return memo + value.length;
        }, 0);

        var summary = _.map(auditSummary, function (items, key) {
          return items.length + ':' + key;
        }).join(', ');

        return total + " Member audits " + (total ? '(' + summary + ')' : '');
      }

      $scope.memberUpdateAuditSummary = function () {
        return auditSummaryFormatted(auditSummary());
      };

      function validateBulkUploadProcessingBeforeMailchimpUpdates() {
        logger.debug('validateBulkUploadProcessing:$scope.filters.uploadSession', $scope.filters.uploadSession);
        if ($scope.filters.uploadSession.selected.error) {
          notify.error({title: 'Bulk upload failed', message: $scope.filters.uploadSession.selected.error});
        } else {

          var summary = auditSummary();
          var summaryFormatted = auditSummaryFormatted(summary);

          logger.debug('summary', summary, 'summaryFormatted', summaryFormatted);
          if (summary.error) {
            notify.error({
              title: "Bulk upload was not successful",
              message: "One or more errors occurred - " + summaryFormatted
            });
            return false;
          } else return $scope.updateMailchimpLists();
        }
      }
    }]
  )
;


/* concatenated from src/legacy/src/app/js/memberAdminSendEmailsController.js */

angular.module('ekwgApp')
  .controller('MemberAdminSendEmailsController', ["$log", "$q", "$scope", "$filter", "DateUtils", "DbUtils", "LoggedInMemberService", "ErrorMessageService", "EmailSubscriptionService", "MailchimpSegmentService", "MailchimpCampaignService", "MailchimpConfig", "Notifier", "members", "close", function ($log, $q, $scope, $filter, DateUtils, DbUtils, LoggedInMemberService, ErrorMessageService,
                                                           EmailSubscriptionService, MailchimpSegmentService, MailchimpCampaignService,
                                                           MailchimpConfig, Notifier, members, close) {
      var logger = $log.getInstance('MemberAdminSendEmailsController');
      $log.logLevels['MemberAdminSendEmailsController'] = $log.LEVEL.OFF;
      var notify = Notifier($scope);
      notify.setBusy();

      var CAMPAIGN_TYPE_WELCOME = "welcome";
      var CAMPAIGN_TYPE_PASSWORD_RESET = "passwordReset";
      var CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING = "expiredMembersWarning";
      var CAMPAIGN_TYPE_EXPIRED_MEMBERS = "expiredMembers";
      $scope.today = DateUtils.momentNowNoTime().valueOf();
      $scope.members = members;
      $scope.memberFilterDateCalendar = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.memberFilterDateCalendar.opened = true;
        }
      };

      $scope.showHelp = function (show) {
        $scope.display.showHelp = show;
      };

      $scope.cancel = function () {
        close();
      };

      $scope.display = {
        showHelp: false,
        selectableMembers: [],
        emailMembers: [],
        saveInProgress: false,
        monthsInPast: 1,
        memberFilterDate: undefined,
        emailType: {name: "(loading)"},
        passwordResetCaption: function () {
          return 'About to send a ' + $scope.display.emailType.name + ' to ' + $scope.display.emailMembers.length + ' member' + ($scope.display.emailMembers.length === 1 ? '' : 's');
        },
        expiryEmailsSelected: function () {
          var returnValue = $scope.display.emailType.type === CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING || $scope.display.emailType.type === CAMPAIGN_TYPE_EXPIRED_MEMBERS;
          logger.debug('expiryEmailsSelected -> ', returnValue);
          return returnValue;
        },
        recentMemberEmailsSelected: function () {
          return $scope.display.emailType.type === CAMPAIGN_TYPE_WELCOME || $scope.display.emailType.type === CAMPAIGN_TYPE_PASSWORD_RESET;
        }
      };

      $scope.populateSelectableMembers = function () {
        $scope.display.selectableMembers = _.chain($scope.members)
          .filter(function (member) {
            return EmailSubscriptionService.includeMemberInEmailList('general', member);
          })
          .map(extendWithInformation)
          .value();
        logger.debug('populateSelectableMembers:found', $scope.display.selectableMembers.length, 'members');
      };

      $scope.populateSelectableMembers();

      $scope.calculateMemberFilterDate = function () {
        $scope.display.memberFilterDate = DateUtils.momentNowNoTime().subtract($scope.display && $scope.display.emailType.monthsInPast, 'months').valueOf();
      };

      $scope.clearDisplayEmailMembers = function () {
        $scope.display.emailMembers = [];
        notify.warning({
          title: 'Member selection',
          message: 'current member selection was cleared'
        });
      };

      function extendWithInformation(member) {
        return $scope.display.expiryEmailsSelected() ? extendWithExpiryInformation(member) : extendWithCreatedInformation(member);
      }

      function extendWithExpiryInformation(member) {
        var expiredActive = member.membershipExpiryDate < $scope.today ? 'expired' : 'active';
        var memberGrouping = member.receivedInLastBulkLoad ? expiredActive : 'missing from last bulk load';
        var datePrefix = memberGrouping === 'expired' ? ': ' : ', ' + (member.membershipExpiryDate < $scope.today ? 'expired' : 'expiry') + ': ';
        var text = $filter('fullNameWithAlias')(member) + ' (' + memberGrouping + datePrefix + (DateUtils.displayDate(member.membershipExpiryDate) || 'not known') + ')';
        return angular.extend({}, member, {id: member.$id(), text: text, memberGrouping: memberGrouping});
      }

      function extendWithCreatedInformation(member) {
        var memberGrouping = member.membershipExpiryDate < $scope.today ? 'expired' : 'active';
        var text = $filter('fullNameWithAlias')(member) + ' (created ' + (DateUtils.displayDate(member.createdDate) || 'not known') + ')';
        return angular.extend({}, member, {id: member.$id(), text: text, memberGrouping: memberGrouping});
      }

      $scope.memberGrouping = function (member) {
        return member.memberGrouping;
      };

      function populateMembersBasedOnFilter(filter) {
        logger.debug('populateExpiredMembers: display.emailType ->', $scope.display.emailType);
        notify.setBusy();
        notify.warning({
          title: 'Automatically adding expired members',
          message: ' - please wait for list to be populated'
        });

        $scope.display.memberFilterDate = DateUtils.convertDateField($scope.display.memberFilterDate);

        $scope.display.emailMembers = _($scope.display.selectableMembers)
          .filter(filter);
        notify.warning({
          title: 'Members added to email selection',
          message: 'automatically added ' + $scope.display.emailMembers.length + ' members'
        });
        notify.clearBusy();
      }

      $scope.populateMembers = function (recalcMemberFilterDate) {
        logger.debug('$scope.display.memberSelection', $scope.display.emailType.memberSelection);
        this.populateSelectableMembers();
        switch ($scope.display.emailType.memberSelection) {
          case 'recently-added':
            $scope.populateRecentlyAddedMembers(recalcMemberFilterDate);
            break;
          case 'expired-members':
            $scope.populateExpiredMembers(recalcMemberFilterDate);
            break
        }
      };
      $scope.populateRecentlyAddedMembers = function (recalcMemberFilterDate) {
        if (recalcMemberFilterDate) {
          $scope.calculateMemberFilterDate();
        }
        populateMembersBasedOnFilter(function (member) {
          return member.groupMember && (member.createdDate >= $scope.display.memberFilterDate);
        });
      };

      $scope.populateExpiredMembers = function (recalcMemberFilterDate) {
        if (recalcMemberFilterDate) {
          $scope.calculateMemberFilterDate();
        }
        populateMembersBasedOnFilter(function (member) {
          return member.groupMember && member.membershipExpiryDate && (member.membershipExpiryDate < $scope.display.memberFilterDate);
        });
      };

      $scope.populateMembersMissingFromBulkLoad = function (recalcMemberFilterDate) {
        if (recalcMemberFilterDate) {
          $scope.calculateMemberFilterDate();
        }
        populateMembersBasedOnFilter(function (member) {
          return member.groupMember && member.membershipExpiryDate && !member.receivedInLastBulkLoad;
        })
      };

      function displayEmailMembersToMembers() {
        return _.chain($scope.display.emailMembers)
          .map(function (memberId) {
            return _.find($scope.members, function (member) {
              return member.$id() === memberId.id;
            })
          })
          .filter(function (member) {
            return member && member.email;
          }).value();
      }

      function addPasswordResetIdToMembers() {

        var saveMemberPromises = [];

        _.map(displayEmailMembersToMembers(), function (member) {
          LoggedInMemberService.setPasswordResetId(member);
          EmailSubscriptionService.resetUpdateStatusForMember(member);
          saveMemberPromises.push(DbUtils.auditedSaveOrUpdate(member))
        });

        return $q.all(saveMemberPromises).then(function () {
          return notify.success('Password reset prepared for ' + saveMemberPromises.length + ' member(s)');
        });

      }

      function includeInNextMailchimpListUpdate() {

        var saveMemberPromises = [];

        _.map(displayEmailMembersToMembers(), function (member) {
          EmailSubscriptionService.resetUpdateStatusForMember(member);
          saveMemberPromises.push(DbUtils.auditedSaveOrUpdate(member))
        });

        return $q.all(saveMemberPromises).then(function () {
          return notify.success('Member expiration prepared for ' + saveMemberPromises.length + ' member(s)');
        });

      }

      function noAction() {
      }

      function removeExpiredMembersFromGroup() {
        logger.debug('removing ', $scope.display.emailMembers.length, 'members from group');
        var saveMemberPromises = [];

        _($scope.display.emailMembers)
          .map(function (memberId) {
            return _.find($scope.members, function (member) {
              return member.$id() === memberId.id;
            })
          }).map(function (member) {
          member.groupMember = false;
          EmailSubscriptionService.resetUpdateStatusForMember(member);
          saveMemberPromises.push(DbUtils.auditedSaveOrUpdate(member))
        });

        return $q.all(saveMemberPromises)
          .then(function () {
            return notify.success('EKWG group membership removed for ' + saveMemberPromises.length + ' member(s)');
          })
      }

      $scope.cancelSendEmails = function () {
        $scope.cancel();
      };

      $scope.sendEmailsDisabled = function () {
        return $scope.display.emailMembers.length === 0
      };

      $scope.sendEmails = function () {
        $scope.alertTypeResetPassword = true;
        $scope.display.saveInProgress = true;
        $scope.display.duplicate = false;
        $q.when(notify.success('Preparing to email ' + $scope.display.emailMembers.length + ' member' + ($scope.display.emailMembers.length === 1 ? '' : 's'), true))
          .then($scope.display.emailType.preSend)
          .then(updateGeneralList)
          .then(createOrSaveMailchimpSegment)
          .then(saveSegmentDataToMailchimpConfig)
          .then(sendEmailCampaign)
          .then($scope.display.emailType.postSend)
          .then(notify.clearBusy)
          .then($scope.cancel)
          .then(resetSendFlags)
          .catch(handleSendError);

      };

      function resetSendFlags() {
        logger.debug('resetSendFlags');
        $scope.display.saveInProgress = false;
      }

      function updateGeneralList() {
        return EmailSubscriptionService.createBatchSubscriptionForList('general', $scope.members).then(function (updatedMembers) {
          $scope.members = updatedMembers;
        });
      }

      function createOrSaveMailchimpSegment() {
        return MailchimpSegmentService.saveSegment('general', {segmentId: $scope.display.emailType.segmentId}, $scope.display.emailMembers, $scope.display.emailType.name, $scope.members);
      }

      function saveSegmentDataToMailchimpConfig(segmentResponse) {
        logger.debug('saveSegmentDataToMailchimpConfig:segmentResponse', segmentResponse);
        return MailchimpConfig.getConfig()
          .then(function (config) {
            config.mailchimp.segments.general[$scope.display.emailType.type + 'SegmentId'] = segmentResponse.segment.id;
            return MailchimpConfig.saveConfig(config)
              .then(function () {
                logger.debug('saveSegmentDataToMailchimpConfig:returning segment id', segmentResponse.segment.id);
                return segmentResponse.segment.id;
              });
          });
      }

      function sendEmailCampaign(segmentId) {
        var members = $scope.display.emailMembers.length + ' member(s)';
        notify.success('Sending ' + $scope.display.emailType.name + ' email to ' + members);
        logger.debug('about to sendEmailCampaign:', $scope.display.emailType.type, 'campaign Id', $scope.display.emailType.campaignId, 'segmentId', segmentId, 'campaignName', $scope.display.emailType.name);
        return MailchimpCampaignService.replicateAndSendWithOptions({
          campaignId: $scope.display.emailType.campaignId,
          campaignName: $scope.display.emailType.name,
          segmentId: segmentId
        }).then(function () {
          notify.success('Sending of ' + $scope.display.emailType.name + ' to ' + members + ' was successful');
        });
      }

      $scope.emailMemberList = function () {
        return _($scope.display.emailMembers)
          .sortBy(function (emailMember) {
            return emailMember.text;
          }).map(function (emailMember) {
            return emailMember.text;
          }).join(', ');
      };

      function handleSendError(errorResponse) {
        $scope.display.saveInProgress = false;
        notify.error({
          title: 'Your notification could not be sent',
          message: (errorResponse.message || errorResponse) + (errorResponse.error ? ('. Error was: ' + ErrorMessageService.stringify(errorResponse.error)) : '')
        });
        notify.clearBusy();
      }

      MailchimpConfig.getConfig()
        .then(function (config) {
          $scope.display.emailTypes = [
            {
              preSend: addPasswordResetIdToMembers,
              type: CAMPAIGN_TYPE_WELCOME,
              name: config.mailchimp.campaigns.welcome.name,
              monthsInPast: config.mailchimp.campaigns.welcome.monthsInPast,
              campaignId: config.mailchimp.campaigns.welcome.campaignId,
              segmentId: config.mailchimp.segments.general.welcomeSegmentId,
              memberSelection: 'recently-added',
              postSend: noAction,
              dateTooltip: "All members created in the last " + config.mailchimp.campaigns.welcome.monthsInPast + " month are displayed as a default, as these are most likely to need a welcome email sent"
            },
            {
              preSend: addPasswordResetIdToMembers,
              type: CAMPAIGN_TYPE_PASSWORD_RESET,
              name: config.mailchimp.campaigns.passwordReset.name,
              monthsInPast: config.mailchimp.campaigns.passwordReset.monthsInPast,
              campaignId: config.mailchimp.campaigns.passwordReset.campaignId,
              segmentId: config.mailchimp.segments.general.passwordResetSegmentId,
              memberSelection: 'recently-added',
              postSend: noAction,
              dateTooltip: "All members created in the last " + config.mailchimp.campaigns.passwordReset.monthsInPast + " month are displayed as a default"
            },
            {
              preSend: includeInNextMailchimpListUpdate,
              type: CAMPAIGN_TYPE_EXPIRED_MEMBERS_WARNING,
              name: config.mailchimp.campaigns.expiredMembersWarning.name,
              monthsInPast: config.mailchimp.campaigns.expiredMembersWarning.monthsInPast,
              campaignId: config.mailchimp.campaigns.expiredMembersWarning.campaignId,
              segmentId: config.mailchimp.segments.general.expiredMembersWarningSegmentId,
              memberSelection: 'expired-members',
              postSend: noAction,
              dateTooltip: "Using the expiry date field, you can choose which members will automatically be included. " +
                "A date " + config.mailchimp.campaigns.expiredMembersWarning.monthsInPast + " months in the past has been pre-selected, to avoid including members whose membership renewal is still progress"
            },
            {
              preSend: includeInNextMailchimpListUpdate,
              type: CAMPAIGN_TYPE_EXPIRED_MEMBERS,
              name: config.mailchimp.campaigns.expiredMembers.name,
              monthsInPast: config.mailchimp.campaigns.expiredMembers.monthsInPast,
              campaignId: config.mailchimp.campaigns.expiredMembers.campaignId,
              segmentId: config.mailchimp.segments.general.expiredMembersSegmentId,
              memberSelection: 'expired-members',
              postSend: removeExpiredMembersFromGroup,
              dateTooltip: "Using the expiry date field, you can choose which members will automatically be included. " +
                "A date 3 months in the past has been pre-selected, to avoid including members whose membership renewal is still progress"
            }
          ];
          $scope.display.emailType = $scope.display.emailTypes[0];
          $scope.populateMembers(true);
        });
    }]
  );


/* concatenated from src/legacy/src/app/js/memberResources.js */

angular.module('ekwgApp')
  .factory('MemberResourcesService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberResources');
  }])
  .factory('MemberResourcesReferenceData', ["$log", "URLService", "ContentMetaDataService", "FileUtils", "LoggedInMemberService", "SiteEditService", function ($log, URLService, ContentMetaDataService, FileUtils, LoggedInMemberService, SiteEditService) {
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
          return "ekwg-legacy/assets/images/local/mailchimp.ico"
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
          return "ekwg-legacy/assets/images/ramblers/favicon.ico"
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
          return SiteEditService.active() || LoggedInMemberService.allowCommittee();
        }
      },
      {
        id: "loggedInMember",
        description: "Logged-in member",
        filter: function () {
          return SiteEditService.active() || LoggedInMemberService.memberLoggedIn();
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
  }]);


/* concatenated from src/legacy/src/app/js/memberServices.js */

angular.module('ekwgApp')
  .factory('MemberUpdateAuditService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberUpdateAudit');
  }])
  .factory('MemberBulkLoadAuditService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberBulkLoadAudit');
  }])
  .factory('MemberAuditService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberAudit');
  }])
  .factory('ExpenseClaimsService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('expenseClaims');
  }])
  .factory('MemberNamingService', ["$log", "StringUtils", function ($log, StringUtils) {

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
  }])
  .factory('MemberService', ["$mongolabResourceHttp", "$log", function ($mongolabResourceHttp, $log) {

    var logger = $log.getInstance('MemberService');
    var noLogger = $log.getInstance('MemberServiceMuted');
    $log.logLevels['MemberServiceMuted'] = $log.LEVEL.OFF;
    $log.logLevels['MemberService'] = $log.LEVEL.OFF;

    var memberService = $mongolabResourceHttp('members');

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
  }]);


/* concatenated from src/legacy/src/app/js/notificationUrl.js */

angular.module("ekwgApp")
  .component("notificationUrl", {
    templateUrl: "ekwg-legacy/partials/components/notification-url.html",
    controller: ["$log", "URLService", "FileUtils", function ($log, URLService, FileUtils) {
      var ctrl = this;
      var logger = $log.getInstance("NotificationUrlController");
      $log.logLevels['NotificationUrlController'] = $log.LEVEL.OFF;

      ctrl.anchor_href = function () {
        return URLService.notificationHref(ctrl);
      };

      ctrl.anchor_target = function () {
        return "_blank";
      };

      ctrl.anchor_text = function () {
        var text = (!ctrl.text && ctrl.name) ? FileUtils.basename(ctrl.name) : ctrl.text || ctrl.anchor_href();
        logger.debug("text", text);
        return text;
      };

    }],
    bindings: {
      name: "@",
      text: "@",
      type: "@",
      id: "@",
      area: "@"
    }
  });


/* concatenated from src/legacy/src/app/js/notifier.js */

angular.module('ekwgApp')
  .factory('Notifier', ["$log", "ErrorMessageService", function ($log, ErrorMessageService) {

    var ALERT_ERROR = {class: 'alert-danger', icon: 'glyphicon-exclamation-sign', failure: true};
    var ALERT_WARNING = {class: 'alert-warning', icon: 'glyphicon-info-sign'};
    var ALERT_INFO = {class: 'alert-success', icon: 'glyphicon-info-sign'};
    var ALERT_SUCCESS = {class: 'alert-success', icon: 'glyphicon-ok'};

    var logger = $log.getInstance('Notifier');
    $log.logLevels['Notifier'] = $log.LEVEL.OFF;

    return function (scope) {

      scope.alertClass = ALERT_SUCCESS.class;
      scope.alert = ALERT_SUCCESS;
      scope.alertMessages = [];
      scope.alertHeading = [];
      scope.ready = false;

      function setReady() {
        clearBusy();
        return scope.ready = true;
      }

      function clearBusy() {
        logger.debug('clearing busy');
        return scope.busy = false;
      }

      function setBusy() {
        logger.debug('setting busy');
        return scope.busy = true;
      }

      function showContactUs(state) {
        logger.debug('setting showContactUs', state);
        return scope.showContactUs = state;
      }

      function notifyAlertMessage(alertType, message, append, busy) {
        var messageText = message && ErrorMessageService.stringify(_.has(message, 'message') ? message.message : message);
        if (busy) setBusy();
        if (!append || alertType === ALERT_ERROR) scope.alertMessages = [];
        if (messageText) scope.alertMessages.push(messageText);
        scope.alertTitle = message && _.has(message, 'title') ? message.title : undefined;
        scope.alert = alertType;
        scope.alertClass = alertType.class;
        scope.showAlert = scope.alertMessages.length > 0;
        scope.alertMessage = scope.alertMessages.join(', ');
        if (alertType === ALERT_ERROR && !_.has(message, 'continue')) {
          logger.error('notifyAlertMessage:', 'class =', alertType, 'messageText =', messageText, 'append =', append);
          clearBusy();
          throw message;
        } else {
          return logger.debug('notifyAlertMessage:', 'class =', alertType, 'messageText =', messageText, 'append =', append, 'showAlert =', scope.showAlert);
        }
      }


      function progress(message, busy) {
        return notifyAlertMessage(ALERT_INFO, message, false, busy)
      }

      function hide() {
        notifyAlertMessage(ALERT_SUCCESS);
        return clearBusy();
      }

      function success(message, busy) {
        return notifyAlertMessage(ALERT_SUCCESS, message, false, busy)
      }

      function successWithAppend(message, busy) {
        return notifyAlertMessage(ALERT_SUCCESS, message, true, busy)
      }

      function error(message, append, busy) {
        return notifyAlertMessage(ALERT_ERROR, message, append, busy)
      }

      function warning(message, append, busy) {
        return notifyAlertMessage(ALERT_WARNING, message, append, busy)
      }

      return {
        success: success,
        successWithAppend: successWithAppend,
        progress: progress,
        progressWithAppend: successWithAppend,
        error: error,
        warning: warning,
        showContactUs: showContactUs,
        setBusy: setBusy,
        clearBusy: clearBusy,
        setReady: setReady,
        hide: hide
      }
    }

  }]);

/* concatenated from src/legacy/src/app/js/profile.js */

angular.module('ekwgApp')
  .factory('ProfileConfirmationService', ["$filter", "LoggedInMemberService", "DateUtils", function ($filter, LoggedInMemberService, DateUtils) {

    var confirmProfile = function (member) {
      if (member) {
        member.profileSettingsConfirmed = true;
        member.profileSettingsConfirmedAt = DateUtils.nowAsValue();
        member.profileSettingsConfirmedBy = $filter('fullNameWithAlias')(LoggedInMemberService.loggedInMember());
      }
    };

    var unconfirmProfile = function (member) {
      if (member) {
        delete member.profileSettingsConfirmed;
        delete member.profileSettingsConfirmedAt;
        delete member.profileSettingsConfirmedBy;
      }
    };

    var processMember = function (member) {
      if (member) {
        if (member.profileSettingsConfirmed) {
          confirmProfile(member)
        } else {
          unconfirmProfile(member)
        }
      }
    };
    return {
      confirmProfile: confirmProfile,
      unconfirmProfile: unconfirmProfile,
      processMember: processMember
    };
  }])
  .controller('ProfileController', ["$q", "$rootScope", "$routeParams", "$scope", "LoggedInMemberService", "MemberService", "URLService", "ProfileConfirmationService", "EmailSubscriptionService", "CommitteeReferenceData", function ($q, $rootScope, $routeParams, $scope, LoggedInMemberService, MemberService,
                                             URLService, ProfileConfirmationService, EmailSubscriptionService, CommitteeReferenceData) {

    $scope.showArea = function (area) {
      URLService.navigateTo('admin', area)
    };

    $scope.contactUs = {
      ready: function () {
        return CommitteeReferenceData.ready;
      }
    };

    function isArea(area) {
      return (area === $routeParams.area);
    }

    var LOGIN_DETAILS = 'login details';
    var PERSONAL_DETAILS = 'personal details';
    var CONTACT_PREFERENCES = 'contact preferences';
    var ALERT_CLASS_DANGER = 'alert-danger';
    var ALERT_CLASS_SUCCESS = 'alert-success';
    $scope.currentMember = {};
    $scope.enteredMemberCredentials = {};
    $scope.alertClass = ALERT_CLASS_SUCCESS;
    $scope.alertType = LOGIN_DETAILS;
    $scope.alertMessages = [];
    $scope.personalDetailsOpen = isArea('personal-details');
    $scope.loginDetailsOpen = isArea('login-details');
    $scope.contactPreferencesOpen = isArea('contact-preferences');
    $scope.showAlertPersonalDetails = false;
    $scope.showAlertLoginDetails = false;
    $scope.showAlertContactPreferences = false;

    applyAllowEdits('controller init');

    refreshMember();

    $scope.$on('memberLoginComplete', function () {
      $scope.alertMessages = [];
      refreshMember();
      applyAllowEdits('memberLoginComplete');
    });

    $scope.$on('memberLogoutComplete', function () {
      $scope.alertMessages = [];
      applyAllowEdits('memberLogoutComplete');
    });

    $scope.undoChanges = function () {
      refreshMember();
    };

    function saveOrUpdateSuccessful() {
      $scope.enteredMemberCredentials.newPassword = null;
      $scope.enteredMemberCredentials.newPasswordConfirm = null;
      $scope.alertMessages.push('Your ' + $scope.alertType + ' were saved successfully and will be effective on your next login.');
      showAlert(ALERT_CLASS_SUCCESS, $scope.alertType);
    }

    function saveOrUpdateUnsuccessful(message) {
      var messageDefaulted = message || 'Please try again later.';
      $scope.alertMessages.push('Changes to your ' + $scope.alertType + ' could not be saved. ' + messageDefaulted);
      showAlert(ALERT_CLASS_DANGER, $scope.alertType);
    }

    $scope.saveLoginDetails = function () {
      $scope.alertMessages = [];
      validateUserNameExistence();
    };

    $scope.$on('userNameExistenceCheckComplete', function () {
      validatePassword();
      validateUserName();
      if ($scope.alertMessages.length === 0) {
        saveMemberDetails(LOGIN_DETAILS)
      } else {
        showAlert(ALERT_CLASS_DANGER, LOGIN_DETAILS);
      }
    });

    $scope.savePersonalDetails = function () {
      $scope.alertMessages = [];
      saveMemberDetails(PERSONAL_DETAILS);
    };

    $scope.saveContactPreferences = function () {
      $scope.alertMessages = [];
      ProfileConfirmationService.confirmProfile($scope.currentMember);
      saveMemberDetails(CONTACT_PREFERENCES);
    };


    $scope.loggedIn = function () {
      return LoggedInMemberService.memberLoggedIn();
    };

    function validatePassword() {
      if ($scope.enteredMemberCredentials.newPassword || $scope.enteredMemberCredentials.newPasswordConfirm) {
//        console.log('validating password change old=', $scope.enteredMemberCredentials.newPassword, 'new=', $scope.enteredMemberCredentials.newPasswordConfirm);
        if ($scope.currentMember.password === $scope.enteredMemberCredentials.newPassword) {
          $scope.alertMessages.push('The new password was the same as the old one.');
        } else if ($scope.enteredMemberCredentials.newPassword !== $scope.enteredMemberCredentials.newPasswordConfirm) {
          $scope.alertMessages.push('The new password was not confirmed correctly.');
        } else if ($scope.enteredMemberCredentials.newPassword.length < 6) {
          $scope.alertMessages.push('The new password needs to be at least 6 characters long.');
        } else {
          $scope.currentMember.password = $scope.enteredMemberCredentials.newPassword;
//          console.log('validating password change - successful');
        }
      }
    }

    function validateUserName() {
      if ($scope.enteredMemberCredentials.userName !== $scope.currentMember.userName) {
        $scope.enteredMemberCredentials.userName = $scope.enteredMemberCredentials.userName.trim();
        if ($scope.enteredMemberCredentials.userName.length === 0) {
          $scope.alertMessages.push('The new user name cannot be blank.');
        } else {
          $scope.currentMember.userName = $scope.enteredMemberCredentials.userName;
        }
      }
    }

    function undoChangesTo(alertType) {
      refreshMember();
      $scope.alertMessages = ['Changes to your ' + alertType + ' were reverted.'];
      showAlert(ALERT_CLASS_SUCCESS, alertType);
    }

    $scope.undoLoginDetails = function () {
      undoChangesTo(LOGIN_DETAILS);
    };

    $scope.undoPersonalDetails = function () {
      undoChangesTo(PERSONAL_DETAILS);
    };

    $scope.undoContactPreferences = function () {
      undoChangesTo(CONTACT_PREFERENCES);
    };

    function saveMemberDetails(alertType) {
      $scope.alertType = alertType;
      EmailSubscriptionService.resetUpdateStatusForMember($scope.currentMember);
      LoggedInMemberService.saveMember($scope.currentMember, saveOrUpdateSuccessful, saveOrUpdateUnsuccessful);
    }

    function showAlert(alertClass, alertType) {
      if ($scope.alertMessages.length > 0) {
        $scope.alertClass = alertClass;
        $scope.alertMessage = $scope.alertMessages.join(', ');
        $scope.showAlertLoginDetails = alertType === LOGIN_DETAILS;
        $scope.showAlertPersonalDetails = alertType === PERSONAL_DETAILS;
        $scope.showAlertContactPreferences = alertType === CONTACT_PREFERENCES;
      } else {
        $scope.showAlertLoginDetails = false;
        $scope.showAlertPersonalDetails = false;
        $scope.showAlertContactPreferences = false;
      }
    }

    function applyAllowEdits(event) {
      $scope.allowEdits = LoggedInMemberService.memberLoggedIn();
      $scope.isAdmin = LoggedInMemberService.allowMemberAdminEdits();
    }

    function refreshMember() {
      if (LoggedInMemberService.memberLoggedIn()) {
        LoggedInMemberService.getMemberForUserName(LoggedInMemberService.loggedInMember().userName)
          .then(function (member) {
            if (!_.isEmpty(member)) {
              $scope.currentMember = member;
              $scope.enteredMemberCredentials = {userName: $scope.currentMember.userName};
            } else {
              $scope.alertMessages.push('Could not refresh member');
              showAlert(ALERT_CLASS_DANGER, LOGIN_DETAILS);
            }
          }, function (response) {
            $scope.alertMessages.push('Unexpected error occurred: ' + response);
            showAlert(ALERT_CLASS_DANGER, LOGIN_DETAILS);
          })
      }
    }

    function validateUserNameExistence() {
      if ($scope.enteredMemberCredentials.userName !== $scope.currentMember.userName) {
        LoggedInMemberService.getMemberForUserName($scope.enteredMemberCredentials.userName)
          .then(function (member) {
            if (!_.isEmpty(member)) {
              $scope.alertMessages.push('The user name ' + $scope.enteredMemberCredentials.userName + ' is already used by another member. Please choose another.');
              $scope.enteredMemberCredentials.userName = $scope.currentMember.userName;
            }
            $rootScope.$broadcast('userNameExistenceCheckComplete');
          }, function (response) {
            $scope.alertMessages.push('Unexpected error occurred: ' + response);
            showAlert(ALERT_CLASS_DANGER, LOGIN_DETAILS);
          });
      } else {
        $rootScope.$broadcast('userNameExistenceCheckComplete');
      }
    }

  }]);


/* concatenated from src/legacy/src/app/js/ramblersWalksServices.js */

angular.module('ekwgApp')
  .factory('RamblersHttpService', ["$q", "$http", function ($q, $http) {
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
  }])
  .factory('RamblersWalksAndEventsService', ["$log", "$rootScope", "$http", "$q", "$filter", "DateUtils", "RamblersHttpService", "LoggedInMemberService", "CommitteeReferenceData", function ($log, $rootScope, $http, $q, $filter, DateUtils, RamblersHttpService, LoggedInMemberService, CommitteeReferenceData) {

      var logger = $log.getInstance('RamblersWalksAndEventsService');
      $log.logLevels['RamblersWalksAndEventsService'] = $log.LEVEL.OFF;

      function uploadRamblersWalks(data) {
        return RamblersHttpService.call('Upload Ramblers walks', 'POST', 'walksAndEventsManager/uploadWalks', data);
      }

      function listRamblersWalks() {
        return RamblersHttpService.call('List Ramblers walks', 'GET', 'walksAndEventsManager/listWalks');
      }

      var walkDescriptionPrefix = function () {
        return RamblersHttpService.call('Ramblers description Prefix', 'GET', 'walksAndEventsManager/walkDescriptionPrefix');
      };

      var walkBaseUrl = function () {
        return RamblersHttpService.call('Ramblers walk url', 'GET', 'walksAndEventsManager/walkBaseUrl');
      };

      function exportWalksFileName() {
        return 'walks-export-' + DateUtils.asMoment().format('DD-MMMM-YYYY-HH-mm') + '.csv'
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
            }
            else {
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
        var walkValidations = [];
        if (_.isEmpty(walk)) {
          walkValidations.push('walk does not exist');
        } else {
          if (_.isEmpty(walkTitle(walk))) walkValidations.push('title is missing');
          if (_.isEmpty(walkDistanceMiles(walk))) walkValidations.push('distance is missing');
          if (_.isEmpty(walk.startTime)) walkValidations.push('start time is missing');
          if (walkStartTime(walk) === 'Invalid date') walkValidations.push('start time [' + walk.startTime + '] is invalid');
          if (_.isEmpty(walk.grade)) walkValidations.push('grade is missing');
          if (_.isEmpty(walk.longerDescription)) walkValidations.push('description is missing');
          if (_.isEmpty(walk.postcode) && _.isEmpty(walk.gridReference)) walkValidations.push('both postcode and grid reference are missing');
          if (_.isEmpty(walk.contactId)) {
            var contactIdMessage = LoggedInMemberService.allowWalkAdminEdits() ? 'this can be supplied for this walk on Walk Leader tab' : 'this will need to be setup for you by ' + CommitteeReferenceData.contactUsField('walks', 'fullName');
            walkValidations.push('walk leader has no Ramblers contact Id setup on their member record (' + contactIdMessage + ')');
          }
          if (_.isEmpty(walk.displayName) && _.isEmpty(walk.displayName)) walkValidations.push('displayName for walk leader is missing');
        }
        return {
          walk: walk,
          walkValidations: walkValidations,
          publishedOnRamblers: walk && !_.isEmpty(walk.ramblersWalkId),
          selected: walk && walkValidations.length === 0 && _.isEmpty(walk.ramblersWalkId)
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
    }]
  );

/* concatenated from src/legacy/src/app/js/resetPasswordController.js */

angular.module("ekwgApp")
  .controller("ResetPasswordController", ["$q", "$log", "$scope", "AuthenticationModalsService", "ValidationUtils", "LoggedInMemberService", "URLService", "Notifier", "userName", "message", "close", function ($q, $log, $scope, AuthenticationModalsService, ValidationUtils, LoggedInMemberService, URLService, Notifier, userName, message, close) {
      var logger = $log.getInstance('ResetPasswordController');
      $log.logLevels['ResetPasswordController'] = $log.LEVEL.OFF;

      $scope.notify = {};
      $scope.memberCredentials = {userName: userName};
      var notify = Notifier($scope.notify);

      if (message) {
        notify.progress({
          title: "Reset password",
          message: message
        });
      }

      $scope.actions = {
        submittable: function () {
          var newPasswordPopulated = ValidationUtils.fieldPopulated($scope.memberCredentials, "newPassword");
          var newPasswordConfirmPopulated = ValidationUtils.fieldPopulated($scope.memberCredentials, "newPasswordConfirm");
          logger.info("notSubmittable: newPasswordConfirmPopulated", newPasswordConfirmPopulated, "newPasswordPopulated", newPasswordPopulated);
          return newPasswordPopulated && newPasswordConfirmPopulated;
        },
        close: function () {
          close()
        },
        resetPassword: function () {
          notify.showContactUs(false);
          notify.setBusy();
          notify.progress({
            busy: true,
            title: "Reset password",
            message: "Attempting reset of password for " + $scope.memberCredentials.userName
          });
          LoggedInMemberService.resetPassword($scope.memberCredentials.userName, $scope.memberCredentials.newPassword, $scope.memberCredentials.newPasswordConfirm).then(function () {
            var loginResponse = LoggedInMemberService.loginResponse();
            if (LoggedInMemberService.memberLoggedIn()) {
              notify.hide();
              close();
              if (!LoggedInMemberService.loggedInMember().profileSettingsConfirmed) {
                return URLService.navigateTo("mailing-preferences");
              }
              return true;
            }
            else {
              notify.showContactUs(true);
              notify.error({
                title: "Reset password failed",
                message: loginResponse.alertMessage
              });

            }
            return true;
          });
        }
      }
    }]
  );

/* concatenated from src/legacy/src/app/js/resetPasswordFailedController.js */

angular.module('ekwgApp')
  .controller('ResetPasswordFailedController', ["$log", "$scope", "URLService", "Notifier", "CommitteeReferenceData", "close", function ($log, $scope, URLService, Notifier, CommitteeReferenceData, close) {
    var logger = $log.getInstance('ResetPasswordFailedController');
    $log.logLevels['MemberAdminController'] = $log.LEVEL.OFF;

    $scope.notify = {};
    var notify = Notifier($scope.notify);

    logger.info("CommitteeReferenceData:", CommitteeReferenceData.ready);
    notify.showContactUs(true);
    notify.error({
      continue: true,
      title: "Reset password failed",
      message: "The password reset link you followed has either expired or is invalid. Click Restart Forgot Password to try again"
    });
    $scope.actions = {
      close: function () {
        close()
      },
      forgotPassword: function () {
        URLService.navigateTo("forgot-password");
      },
    }
  }]);



/* concatenated from src/legacy/src/app/js/services.js */

angular.module('ekwgApp')
  .factory('DateUtils', ["$log", function ($log) {

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
  }])
  .factory('DbUtils', ["$log", "DateUtils", "LoggedInMemberService", "AUDIT_CONFIG", function ($log, DateUtils, LoggedInMemberService, AUDIT_CONFIG) {
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
  }])
  .factory('FileUtils', ["$log", "DateUtils", "URLService", "ContentMetaDataService", function ($log, DateUtils, URLService, ContentMetaDataService) {
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
      return "ekwg-legacy/assets/images/ramblers/" + icon;
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

  }])
  .factory('StringUtils', ["DateUtils", "$filter", function (DateUtils, $filter) {

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
  }]).factory('ValidationUtils', function () {
  function fieldPopulated(object, path) {
    return (_.property(path)(object) || "").length > 0;
  }

  return {
    fieldPopulated: fieldPopulated,
  }
})
  .factory('NumberUtils', ["$log", function ($log) {

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
  }])
  .factory('ContentMetaData', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('contentMetaData');
  }])
  .factory('ConfigData', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('config');
  }])
  .factory('Config', ["$log", "ConfigData", "ErrorMessageService", function ($log, ConfigData, ErrorMessageService) {
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

  }])
  .factory('ExpenseClaimsService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('expenseClaims');
  }])
  .factory('RamblersUploadAudit', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('ramblersUploadAudit');
  }])
  .factory('ErrorTransformerService', ["ErrorMessageService", function (ErrorMessageService) {
    function transform(errorResponse) {
      var message = ErrorMessageService.stringify(errorResponse);
      var duplicate = s.include(errorResponse, 'duplicate');

      if (duplicate) {
        message = 'Duplicate data was detected. A member record must have a unique Contact Email, Display Name, Ramblers Membership Number and combination of First Name, Last Name and Alias. Please amend the current member and try again.';
      }
      return {duplicate: duplicate, message: message}
    }

    return {transform: transform}
  }])
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


/* concatenated from src/legacy/src/app/js/siteEditActions.js */

angular.module('ekwgApp')
  .component('siteEditActions', {
    templateUrl: 'ekwg-legacy/partials/components/site-edit.html',
    controller: ["$log", "SiteEditService", function ($log, SiteEditService){
  var logger = $log.getInstance('SiteEditActionsController');
  $log.logLevels['SiteEditActionsController'] = $log.LEVEL.OFF;
  var ctrl = this;
  logger.info("initialised with SiteEditService.active()", SiteEditService.active());

  ctrl.userEdits = {preview: true, saveInProgress: false, revertInProgress: false};

  ctrl.editSiteActive = function () {
    return SiteEditService.active() ? "active" : "";
  };

  ctrl.editSiteCaption = function () {
    return SiteEditService.active() ? "editing site" : "edit site";
  };

  ctrl.toggleEditSite = function () {
    SiteEditService.toggle();
  };

}],
    bindings: {
      name: '@',
      description: '@',
    }
  });


/* concatenated from src/legacy/src/app/js/siteEditService.js */

angular.module('ekwgApp')
  .factory('SiteEditService', ["$log", "$cookieStore", "$rootScope", function ($log, $cookieStore, $rootScope) {

    var logger = $log.getInstance('SiteEditService');
    $log.logLevels['SiteEditService'] = $log.LEVEL.OFF;

    function active() {
      var active = Boolean($cookieStore.get("editSite"));
      logger.debug("active:", active);
      return active;
    }

    function toggle() {
      var priorState = active();
      var newState = !priorState;
      logger.debug("toggle:priorState", priorState, "newState", newState);
      $cookieStore.put("editSite", newState);
      return $rootScope.$broadcast("editSite", newState);
    }

    return {
      active: active,
      toggle: toggle
    }

  }]);


/* concatenated from src/legacy/src/app/js/socialEventNotifications.js */

angular.module('ekwgApp')
  .controller('SocialEventNotificationsController', ["MAILCHIMP_APP_CONSTANTS", "$window", "$log", "$sce", "$timeout", "$templateRequest", "$compile", "$q", "$rootScope", "$scope", "$filter", "$routeParams", "$location", "URLService", "DateUtils", "NumberUtils", "LoggedInMemberService", "MemberService", "ContentMetaDataService", "CommitteeFileService", "MailchimpSegmentService", "MailchimpCampaignService", "MailchimpConfig", "Notifier", "CommitteeReferenceData", "socialEvent", "close", function (MAILCHIMP_APP_CONSTANTS, $window, $log, $sce, $timeout, $templateRequest, $compile, $q, $rootScope, $scope, $filter, $routeParams,
                                                              $location, URLService, DateUtils, NumberUtils, LoggedInMemberService, MemberService,
                                                              ContentMetaDataService, CommitteeFileService, MailchimpSegmentService, MailchimpCampaignService,
                                                              MailchimpConfig, Notifier, CommitteeReferenceData, socialEvent, close) {
      var logger = $log.getInstance('SocialEventNotificationsController');
      $log.logLevels['SocialEventNotificationsController'] = $log.LEVEL.OFF;
      $scope.notify = {};
      var notify = Notifier($scope.notify);
      notify.setBusy();
      logger.debug('created with social event', socialEvent);
      $scope.attachmentBaseUrl = ContentMetaDataService.baseUrl('socialEvents');
      $scope.destinationType = '';
      $scope.members = [];
      $scope.selectableRecipients = [];
      $scope.committeeFiles = [];
      $scope.alertMessages = [];
      $scope.allowConfirmDelete = false;
      $scope.latestYearOpen = true;
      $scope.roles = {signoff: [], replyTo: []};
      $scope.showAlertMessage = function () {
        return ($scope.notify.alert.class === 'alert-danger') || $scope.userEdits.sendInProgress;
      };

      function initialiseNotification(socialEvent) {

        if (socialEvent) {
          $scope.socialEvent = socialEvent;
          onFirstNotificationOnly();
          forEveryNotification();
        } else {
          logger.error('no socialEvent - problem!');
        }

        function onFirstNotificationOnly() {
          if (!$scope.socialEvent.notification) {
            $scope.socialEvent.notification = {
              destinationType: 'all-ekwg-social',
              recipients: [],
              addresseeType: 'Hi *|FNAME|*,',
              items: {
                title: {include: true},
                notificationText: {include: true, value: ''},
                description: {include: true},
                attendees: {include: socialEvent.attendees.length > 0},
                attachment: {include: socialEvent.attachment},
                replyTo: {
                  include: $scope.socialEvent.displayName,
                  value: $scope.socialEvent.displayName ? 'organiser' : 'social'
                },
                signoffText: {
                  include: true,
                  value: 'If you have any questions about the above, please don\'t hesitate to contact me.\n\nBest regards,'
                }
              }
            };
            logger.debug('onFirstNotificationOnly - creating $scope.socialEvent.notification ->', $scope.socialEvent.notification);
          }
        }

        function forEveryNotification() {
          $scope.socialEvent.notification.items.signoffAs = {
            include: true,
            value: loggedOnRole().type || 'social'
          };
          logger.debug('forEveryNotification - $scope.socialEvent.notification.signoffAs ->', $scope.socialEvent.notification.signoffAs);
        }
      }

      function loggedOnRole() {
        var memberId = LoggedInMemberService.loggedInMember().memberId;
        var loggedOnRoleData = _(CommitteeReferenceData.contactUsRolesAsArray()).find(function (role) {
          return role.memberId === memberId
        });
        logger.debug('loggedOnRole for', memberId, '->', loggedOnRoleData);
        return loggedOnRoleData || {};
      }

      function roleForType(type) {
        var role = _($scope.roles.replyTo).find(function (role) {
          return role.type === type;
        });
        logger.debug('roleForType for', type, '->', role);
        return role;
      }

      function initialiseRoles() {
        $scope.roles.signoff = CommitteeReferenceData.contactUsRolesAsArray();
        $scope.roles.replyTo = _.clone($scope.roles.signoff);
        if ($scope.socialEvent.eventContactMemberId) {
          $scope.roles.replyTo.unshift({
            type: 'organiser',
            fullName: $scope.socialEvent.displayName,
            memberId: $scope.socialEvent.eventContactMemberId,
            description: 'Organiser (' + $scope.socialEvent.displayName + ')',
            email: $scope.socialEvent.contactEmail
          });
        }
        logger.debug('initialiseRoles -> $scope.roles ->', $scope.roles);
      }

      $scope.formattedText = function () {
        return $filter('lineFeedsToBreaks')($scope.socialEvent.notification.items.notificationText.value);
      };

      $scope.attachmentTitle = function (socialEvent) {
        return socialEvent && socialEvent.attachment ? (socialEvent.attachment.title || socialEvent.attachmentTitle || 'Attachment: ' + socialEvent.attachment.originalFileName) : '';
      };

      $scope.attachmentUrl = function (socialEvent) {
        return socialEvent && socialEvent.attachment ? URLService.baseUrl() + $scope.attachmentBaseUrl + '/' + socialEvent.attachment.awsFileName : '';
      };

      $scope.editAllSocialRecipients = function () {
        $scope.socialEvent.notification.destinationType = 'custom';
        $scope.socialEvent.notification.recipients = $scope.userEdits.socialList();
      };

      $scope.editAttendeeRecipients = function () {
        $scope.socialEvent.notification.destinationType = 'custom';
        $scope.socialEvent.notification.recipients = $scope.socialEvent.attendees;
      };

      $scope.clearRecipients = function () {
        $scope.socialEvent.notification.recipients = [];
      };

      $scope.formattedSignoffText = function () {
        return $filter('lineFeedsToBreaks')($scope.socialEvent.notification.items.signoffText.value);
      };

      $scope.attendeeList = function () {
        return _($scope.socialEvent.notification && $scope.socialEvent.attendees)
          .sortBy(function (attendee) {
            return attendee.text;
          }).map(function (attendee) {
            return attendee.text;
          }).join(', ');
      };

      $scope.memberGrouping = function (member) {
        return member.memberGrouping;
      };

      function toSelectMember(member) {
        var memberGrouping;
        var order;
        if (member.socialMember && member.mailchimpLists.socialEvents.subscribed) {
          memberGrouping = 'Subscribed to social emails';
          order = 0;
        } else if (member.socialMember && !member.mailchimpLists.socialEvents.subscribed) {
          memberGrouping = 'Not subscribed to social emails';
          order = 1;
        } else if (!member.socialMember) {
          memberGrouping = 'Not a social member';
          order = 2;
        } else {
          memberGrouping = 'Unexpected state';
          order = 3;
        }
        return {
          id: member.$id(),
          order: order,
          memberGrouping: memberGrouping,
          text: $filter('fullNameWithAlias')(member)
        };
      }

      function refreshMembers() {
        if (LoggedInMemberService.memberLoggedIn()) {
          MemberService.allLimitedFields(MemberService.filterFor.GROUP_MEMBERS).then(function (members) {
            $scope.members = members;
            logger.debug('refreshMembers -> populated ->', $scope.members.length, 'members');
            $scope.selectableRecipients = _.chain(members)
              .map(toSelectMember)
              .sortBy(function (member) {
                return member.order + member.text
              })
              .value();
            logger.debug('refreshMembers -> populated ->', $scope.selectableRecipients.length, 'selectableRecipients');
            notify.clearBusy();
          });
        }
      }

      $scope.contactUs = {
        ready: function () {
          return CommitteeReferenceData.ready;
        }
      };

      $scope.userEdits = {
        sendInProgress: false,
        cancelFlow: false,
        socialList: function () {
          return _.chain($scope.members)
            .filter(MemberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED)
            .map(toSelectMember).value();
        },
        replyToRole: function () {
          return _($scope.roles.replyTo).find(function (role) {
            return role.type === $scope.socialEvent.notification.items.replyTo.value;
          });
        },
        notReady: function () {
          return $scope.members.length === 0 || $scope.userEdits.sendInProgress;
        }
      };

      $scope.cancelSendNotification = function () {
        close();
        $('#social-event-dialog').modal('show');
      };

      $scope.completeInMailchimp = function () {
        notify.warning({
          title: 'Complete in Mailchimp',
          message: 'You can close this dialog now as the message was presumably completed and sent in Mailchimp'
        });
        $scope.confirmSendNotification(true);
      };

      $scope.confirmSendNotification = function (dontSend) {
        notify.setBusy();
        var campaignName = $scope.socialEvent.briefDescription;
        logger.debug('sendSocialNotification:notification->', $scope.socialEvent.notification);
        notify.progress({title: campaignName, message: 'preparing and sending notification'});
        $scope.userEdits.sendInProgress = true;
        $scope.userEdits.cancelFlow = false;

        function getTemplate() {
          return $templateRequest($sce.getTrustedResourceUrl('ekwg-legacy/partials/socialEvents/social-notification.html'))
        }

        return $q.when(createOrSaveMailchimpSegment())
          .then(getTemplate)
          .then(renderTemplateContent)
          .then(populateContentSections)
          .then(sendEmailCampaign)
          .then(saveSocialEvent)
          .then(notifyEmailSendComplete)
          .catch(handleError);

        function handleError(errorResponse) {
          $scope.userEdits.sendInProgress = false;
          notify.error({
            title: 'Your notification could not be sent',
            message: (errorResponse.message || errorResponse) + (errorResponse.error ? ('. Error was: ' + JSON.stringify(errorResponse.error)) : '')
          });
          notify.clearBusy();
        }

        function renderTemplateContent(templateData) {
          var task = $q.defer();
          var templateFunction = $compile(templateData);
          var templateElement = templateFunction($scope);
          $timeout(function () {
            $scope.$digest();
            task.resolve(templateElement.html());
          });
          return task.promise;
        }

        function populateContentSections(notificationText) {
          logger.debug('populateContentSections -> notificationText', notificationText);
          return {
            sections: {
              notification_text: notificationText
            }
          };
        }

        function writeSegmentResponseDataToEvent(segmentResponse) {
          $scope.socialEvent.mailchimp = {
            segmentId: segmentResponse.segment.id
          };

          if (segmentResponse.members) $scope.socialEvent.mailchimp.members = segmentResponse.members;

        }

        function createOrSaveMailchimpSegment() {
          var members = segmentMembers();
          if (members.length > 0) {
            return MailchimpSegmentService.saveSegment('socialEvents', $scope.socialEvent.mailchimp, members, MailchimpSegmentService.formatSegmentName($scope.socialEvent.briefDescription), $scope.members)
              .then(writeSegmentResponseDataToEvent)
              .catch(handleError);
          } else {
            logger.debug('not saving segment data as destination type is whole mailing list ->', $scope.socialEvent.notification.destinationType);
            return true;
          }
        }

        function segmentMembers() {
          switch ($scope.socialEvent.notification.destinationType) {
            case 'attendees':
              return $scope.socialEvent.attendees;
            case 'custom':
              return $scope.socialEvent.notification.recipients;
            default:
              return [];
          }
        }

        function sendEmailCampaign(contentSections) {
          var replyToRole = roleForType($scope.socialEvent.notification.items.replyTo.value || 'social');
          var otherOptions = ($scope.socialEvent.notification.items.replyTo.include && replyToRole.fullName && replyToRole.email) ? {
            from_name: replyToRole.fullName,
            from_email: replyToRole.email
          } : {};
          notify.progress(dontSend ? ('Preparing to complete ' + campaignName + ' in Mailchimp') : ('Sending ' + campaignName));
          logger.debug('Sending ' + campaignName, 'with otherOptions', otherOptions);
          return MailchimpConfig.getConfig()
            .then(function (config) {
              var campaignId = config.mailchimp.campaigns.socialEvents.campaignId;
              switch ($scope.socialEvent.notification.destinationType) {
                case 'all-ekwg-social':
                  logger.debug('about to replicateAndSendWithOptions to all-ekwg-social with campaignName', campaignName, 'campaign Id', campaignId);
                  return MailchimpCampaignService.replicateAndSendWithOptions({
                    campaignId: campaignId,
                    campaignName: campaignName,
                    contentSections: contentSections,
                    otherSegmentOptions: otherOptions,
                    dontSend: dontSend
                  }).then(openInMailchimpIf(dontSend));
                default:
                  if (!$scope.socialEvent.mailchimp) notify.warning('Cant send campaign due to previous request failing. This could be due to network problems - please try this again');
                  var segmentId = $scope.socialEvent.mailchimp.segmentId;
                  logger.debug('about to replicateAndSendWithOptions to social with campaignName', campaignName, 'campaign Id', campaignId, 'segmentId', segmentId);
                  return MailchimpCampaignService.replicateAndSendWithOptions({
                    campaignId: campaignId,
                    campaignName: campaignName,
                    contentSections: contentSections,
                    segmentId: segmentId,
                    otherSegmentOptions: otherOptions,
                    dontSend: dontSend
                  }).then(openInMailchimpIf(dontSend));
              }
            })
        }

        function openInMailchimpIf(dontSend) {
          return function (replicateCampaignResponse) {
            logger.debug('openInMailchimpIf:replicateCampaignResponse', replicateCampaignResponse, 'dontSend', dontSend);
            if (dontSend) {
              return $window.open(MAILCHIMP_APP_CONSTANTS.apiServer + "/campaigns/wizard/neapolitan?id=" + replicateCampaignResponse.web_id, '_blank');
            } else {
              return true;
            }
          }
        }

        function saveSocialEvent() {
          return $scope.socialEvent.$saveOrUpdate();
        }

        function notifyEmailSendComplete() {
          notify.success('Sending of ' + campaignName + ' was successful.', false);
          $scope.userEdits.sendInProgress = false;
          if (!$scope.userEdits.cancelFlow) {
            close();
          }
          notify.clearBusy();
        }
      };

      refreshMembers();
      initialiseNotification(socialEvent);
      initialiseRoles(CommitteeReferenceData);
    }]
  );


/* concatenated from src/legacy/src/app/js/socialEvents.js */

angular.module('ekwgApp')
  .factory('SocialEventsService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('socialEvents');
  }])
  .factory('SocialEventAttendeeService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('socialEventAttendees');
  }])
  .controller('SocialEventsController', ["$routeParams", "$log", "$q", "$scope", "$filter", "URLService", "Upload", "SocialEventsService", "SiteEditService", "SocialEventAttendeeService", "LoggedInMemberService", "MemberService", "AWSConfig", "ContentMetaDataService", "DateUtils", "MailchimpSegmentService", "ClipboardService", "Notifier", "EKWGFileUpload", "CommitteeReferenceData", "ModalService", function ($routeParams, $log, $q, $scope, $filter, URLService, Upload,
                                                  SocialEventsService, SiteEditService,
                                                  SocialEventAttendeeService, LoggedInMemberService, MemberService,
                                                  AWSConfig, ContentMetaDataService, DateUtils, MailchimpSegmentService,
                                                  ClipboardService, Notifier, EKWGFileUpload, CommitteeReferenceData, ModalService) {
    $scope.userEdits = {
      copyToClipboard: ClipboardService.copyToClipboard,
      longerDescriptionPreview: true,
      socialEventLink: function (socialEvent) {
        return socialEvent && socialEvent.$id() ? URLService.notificationHref({
          type: "socialEvent",
          area: "social",
          id: socialEvent.$id()
        }) : undefined;
      }
    };

    $scope.previewLongerDescription = function () {
      logger.debug('previewLongerDescription');
      $scope.userEdits.longerDescriptionPreview = true;
    };

    $scope.editLongerDescription = function () {
      logger.debug('editLongerDescription');
      $scope.userEdits.longerDescriptionPreview = false;
    };

    $scope.contactUs = {
      ready: function () {
        return CommitteeReferenceData.ready;
      }
    };

    var logger = $log.getInstance('SocialEventsController');
    $log.logLevels['SocialEventsController'] = $log.LEVEL.OFF;
    var notify = Notifier($scope);

    $scope.attachmentBaseUrl = ContentMetaDataService.baseUrl('socialEvents');
    $scope.selectMembers = [];
    $scope.display = {attendees: []};

    $scope.socialEventsDetailProgrammeOpen = true;
    $scope.socialEventsBriefProgrammeOpen = true;
    $scope.socialEventsInformationOpen = true;
    $scope.todayValue = DateUtils.momentNowNoTime().valueOf();
    applyAllowEdits('controllerInitialisation');

    $scope.eventDateCalendar = {
      open: function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.eventDateCalendar.opened = true;
      }
    };

    $scope.$on('memberLoginComplete', function () {
      applyAllowEdits('memberLoginComplete');
      refreshMembers();
      refreshSocialEvents();
    });

    $scope.$on('memberLogoutComplete', function () {
      applyAllowEdits('memberLogoutComplete');
    });

    $scope.$on('editSite', function () {
      applyAllowEdits('editSite');
    });

    $scope.addSocialEvent = function () {
      showSocialEventDialog(new SocialEventsService({eventDate: $scope.todayValue, attendees: []}), 'Add New');
    };

    $scope.viewSocialEvent = function (socialEvent) {
      showSocialEventDialog(socialEvent, 'View');
    };

    $scope.editSocialEvent = function (socialEvent) {
      showSocialEventDialog(socialEvent, 'Edit Existing');
    };

    $scope.deleteSocialEventDetails = function () {
      $scope.allowDelete = false;
      $scope.allowConfirmDelete = true;
    };

    $scope.cancelSocialEventDetails = function () {
      hideSocialEventDialogAndRefreshSocialEvents();
    };

    $scope.saveSocialEventDetails = function () {
      $q.when(notify.progress({title: 'Save in progress', message: 'Saving social event'}, true))
        .then(prepareToSave, notify.error, notify.progress)
        .then(saveSocialEvent, notify.error, notify.progress)
        .then(notify.clearBusy, notify.error, notify.progress)
        .catch(notify.error);
    };

    function prepareToSave() {
      DateUtils.convertDateFieldInObject($scope.currentSocialEvent, 'eventDate');
    }

    function saveSocialEvent() {
      return $scope.currentSocialEvent.$saveOrUpdate(hideSocialEventDialogAndRefreshSocialEvents, hideSocialEventDialogAndRefreshSocialEvents);
    }

    $scope.confirmDeleteSocialEventDetails = function () {
      $q.when(notify.progress('Deleting social event', true))
        .then(deleteMailchimpSegment, notify.error, notify.progress)
        .then(removeSocialEventHideSocialEventDialogAndRefreshSocialEvents, notify.error, notify.progress)
        .then(notify.clearBusy, notify.error, notify.progress)
        .catch(notify.error);
    };

    var deleteMailchimpSegment = function () {
      if ($scope.currentSocialEvent.mailchimp && $scope.currentSocialEvent.mailchimp.segmentId) {
        return MailchimpSegmentService.deleteSegment('socialEvents', $scope.currentSocialEvent.mailchimp.segmentId);
      }
    };

    var removeSocialEventHideSocialEventDialogAndRefreshSocialEvents = function () {
      $scope.currentSocialEvent.$remove(hideSocialEventDialogAndRefreshSocialEvents)
    };

    $scope.copyDetailsToNewSocialEvent = function () {
      var copiedSocialEvent = new SocialEventsService($scope.currentSocialEvent);
      delete copiedSocialEvent._id;
      delete copiedSocialEvent.mailchimp;
      DateUtils.convertDateFieldInObject(copiedSocialEvent, 'eventDate');
      showSocialEventDialog(copiedSocialEvent, 'Copy Existing');
      notify.success({
        title: 'Existing social event copied!',
        message: 'Make changes here and save to create a new social event.'
      });
    };

    $scope.selectMemberContactDetails = function () {
      var socialEvent = $scope.currentSocialEvent;
      var memberId = socialEvent.eventContactMemberId;
      if (memberId === null) {
        delete socialEvent.eventContactMemberId;
        delete socialEvent.displayName;
        delete socialEvent.contactPhone;
        delete socialEvent.contactEmail;
        // console.log('deleted contact details from', socialEvent);
      } else {
        var selectedMember = _.find($scope.members, function (member) {
          return member.$id() === memberId;
        });
        socialEvent.displayName = selectedMember.displayName;
        socialEvent.contactPhone = selectedMember.mobileNumber;
        socialEvent.contactEmail = selectedMember.email;
        // console.log('set contact details on', socialEvent);
      }
    };

    $scope.dataQueryParameters = {
      query: '',
      selectType: '1',
      newestFirst: 'false'
    };

    $scope.removeAttachment = function () {
      delete $scope.currentSocialEvent.attachment;
      delete $scope.currentSocialEvent.attachmentTitle;
      $scope.uploadedFile = undefined;
    };

    $scope.resetMailchimpData = function () {
      delete $scope.currentSocialEvent.mailchimp;
    };

    $scope.addOrReplaceAttachment = function () {
      $('#hidden-input').click();
    };

    $scope.attachmentTitle = function (socialEvent) {
      return socialEvent && socialEvent.attachment ? (socialEvent.attachment.title || socialEvent.attachmentTitle || 'Attachment: ' + socialEvent.attachment.originalFileName) : '';
    };

    $scope.attachmentUrl = function (socialEvent) {
      return socialEvent && socialEvent.attachment ? $scope.attachmentBaseUrl + '/' + socialEvent.attachment.awsFileName : '';
    };

    $scope.onFileSelect = function (file) {
      if (file) {
        $scope.uploadedFile = file;
        EKWGFileUpload.onFileSelect(file, notify, 'socialEvents').then(function (fileNameData) {
          $scope.currentSocialEvent.attachment = fileNameData;
        });
      }
    };

    function allowSummaryView() {
      return (LoggedInMemberService.allowSocialAdminEdits() || !LoggedInMemberService.allowSocialDetailView());
    }

    function applyAllowEdits(event) {
      $scope.allowDelete = false;
      $scope.allowConfirmDelete = false;
      $scope.allowDetailView = LoggedInMemberService.allowSocialDetailView();
      $scope.allowEdits = LoggedInMemberService.allowSocialAdminEdits();
      $scope.allowCopy = LoggedInMemberService.allowSocialAdminEdits();
      $scope.allowContentEdits = SiteEditService.active() && LoggedInMemberService.allowContentEdits();
      $scope.allowSummaryView = allowSummaryView();
    }

    $scope.showLoginTooltip = function () {
      return !LoggedInMemberService.memberLoggedIn();
    };

    $scope.login = function () {
      if (!LoggedInMemberService.memberLoggedIn()) {
        URLService.navigateTo("login");
      }
    };

    function showSocialEventDialog(socialEvent, socialEventEditMode) {
      $scope.uploadedFile = undefined;
      $scope.showAlert = false;
      $scope.allowConfirmDelete = false;
      if (!socialEvent.attendees) socialEvent.attendees = [];
      $scope.allowEdits = LoggedInMemberService.allowSocialAdminEdits();
      var existingRecordEditEnabled = $scope.allowEdits && s.startsWith(socialEventEditMode, 'Edit');
      $scope.allowCopy = existingRecordEditEnabled;
      $scope.allowDelete = existingRecordEditEnabled;
      $scope.socialEventEditMode = socialEventEditMode;
      $scope.currentSocialEvent = socialEvent;
      $('#social-event-dialog').modal('show');
    }

    $scope.attendeeCaption = function () {
      return $scope.currentSocialEvent && $scope.currentSocialEvent.attendees.length + ($scope.currentSocialEvent.attendees.length === 1 ? ' member is attending' : ' members are attending');
    };

    $scope.attendeeList = function () {
      return _($scope.display.attendees)
        .sortBy(function (attendee) {
          return attendee.text;
        }).map(function (attendee) {
          return attendee.text;
        }).join(', ');
    };

    function hideSocialEventDialogAndRefreshSocialEvents() {
      $('#social-event-dialog').modal('hide');
      refreshSocialEvents();
    }

    function refreshMembers() {
      if (LoggedInMemberService.memberLoggedIn()) {
        MemberService.allLimitedFields(MemberService.filterFor.SOCIAL_MEMBERS).then(function (members) {
          $scope.members = members;
          logger.debug('found', $scope.members.length, 'members');
          $scope.selectMembers = _($scope.members).map(function (member) {
            return {id: member.$id(), text: $filter('fullNameWithAlias')(member)};
          })
        });
      }
    }

    $scope.sendSocialEventNotification = function () {
      $('#social-event-dialog').modal('hide');
      ModalService.showModal({
        templateUrl: "ekwg-legacy/partials/socialEvents/send-notification-dialog.html",
        controller: "SocialEventNotificationsController",
        preClose: function (modal) {
          logger.debug('preClose event with modal', modal);
          modal.element.modal('hide');
        },
        inputs: {
          socialEvent: $scope.currentSocialEvent
        }
      }).then(function (modal) {
        logger.debug('modal event with modal', modal);
        modal.element.modal();
        modal.close.then(function (result) {
          logger.debug('close event with result', result);
        });
      })
    };

    function refreshSocialEvents() {
      if (URLService.hasRouteParameter('socialEventId')) {
        return SocialEventsService.getById($routeParams.socialEventId)
          .then(function (socialEvent) {
            if (!socialEvent) notify.error('Social event could not be found');
            $scope.socialEvents = [socialEvent];
          });
      } else {
        var socialEvents = LoggedInMemberService.allowSocialDetailView() ? SocialEventsService.all() : SocialEventsService.all({
          fields: {
            briefDescription: 1,
            eventDate: 1,
            thumbnail: 1
          }
        });
        socialEvents.then(function (socialEvents) {
          $scope.socialEvents = _.chain(socialEvents)
            .filter(function (socialEvent) {
              return socialEvent.eventDate >= $scope.todayValue
            })
            .sortBy(function (socialEvent) {
              return socialEvent.eventDate;
            })
            .value();
          logger.debug('found', $scope.socialEvents.length, 'social events');
        });
      }
    }

    $q.when(refreshSocialEvents())
      .then(refreshMembers)
      .then(refreshImages);

    function refreshImages() {
      ContentMetaDataService.getMetaData('imagesSocialEvents').then(function (contentMetaData) {
        $scope.interval = 5000;
        $scope.slides = contentMetaData.files;
        logger.debug('found', $scope.slides.length, 'slides');
      }, function (response) {
        throw new Error(response);
      });
    }

  }]);



/* concatenated from src/legacy/src/app/js/urlServices.js */

angular.module('ekwgApp')
  .factory('URLService', ["$window", "$rootScope", "$timeout", "$location", "$routeParams", "$log", "PAGE_CONFIG", "ContentMetaDataService", function ($window, $rootScope, $timeout, $location, $routeParams, $log, PAGE_CONFIG, ContentMetaDataService) {

    var logger = $log.getInstance('URLService');
    $log.logLevels['URLService'] = $log.LEVEL.OFF;

    function baseUrl(optionalUrl) {
      return _.first((optionalUrl || $location.absUrl()).split('/#'));
    }

    function relativeUrl(optionalUrl) {
      var relativeUrlValue = _.last((optionalUrl || $location.absUrl()).split("/#"));
      logger.debug("relativeUrlValue:", relativeUrlValue);
      return relativeUrlValue;
    }

    function relativeUrlFirstSegment(optionalUrl) {
      var relativeUrlValue = relativeUrl(optionalUrl);
      var index = relativeUrlValue.indexOf("/", 1);
      var relativeUrlFirstSegment = index === -1 ? relativeUrlValue : relativeUrlValue.substring(0, index);
      logger.debug("relativeUrl:", relativeUrlValue, "relativeUrlFirstSegment:", relativeUrlFirstSegment);
      return relativeUrlFirstSegment;
    }

    function resourceUrl(area, type, id) {
      return baseUrl() + '/#/' + area + '/' + type + 'Id/' + id;
    }

    function notificationHref(ctrl) {
      var href = (ctrl.name) ? resourceUrlForAWSFileName(ctrl.name) : resourceUrl(ctrl.area, ctrl.type, ctrl.id);
      logger.debug("href:", href);
      return href;
    }

    function resourceUrlForAWSFileName(fileName) {
      return baseUrl() + ContentMetaDataService.baseUrl(fileName);
    }

    function hasRouteParameter(parameter) {
      var hasRouteParameter = !!($routeParams[parameter]);
      logger.debug('hasRouteParameter', parameter, hasRouteParameter);
      return hasRouteParameter;
    }

    function isArea(areas) {
      logger.debug('isArea:areas', areas, '$routeParams', $routeParams);
      return _.some(_.isArray(areas) ? areas : [areas], function (area) {
        var matched = area === $routeParams.area;
        logger.debug('isArea', area, 'matched =', matched);
        return matched;
      });

    }

    let pageUrl = function (page) {
      var pageOrEmpty = (page ? page : "");
      return s.startsWith(pageOrEmpty, "/") ? pageOrEmpty : "/" + pageOrEmpty;
    };

    function navigateTo(page, area) {
      $timeout(function () {
        var url = pageUrl(page) + (area ? "/" + area : "");
        logger.info("navigating to page:", page, "area:", area, "->", url);
        $location.path(url);
        logger.info("$location.path is now", $location.path())
      }, 1);
    }

    function navigateBackToLastMainPage() {
      var lastPage = _.chain($rootScope.pageHistory.reverse())
        .find(function (page) {
          return _.contains(_.values(PAGE_CONFIG.mainPages), relativeUrlFirstSegment(page));
        })
        .value();

      logger.info("navigateBackToLastMainPage:$rootScope.pageHistory", $rootScope.pageHistory, "lastPage->", lastPage);
      navigateTo(lastPage || "/")
    }

    function noArea() {
      return !$routeParams.area;
    }

    function setRoot() {
      return navigateTo();
    }

    function area() {
      return $routeParams.area;
    }

    return {
      setRoot: setRoot,
      navigateBackToLastMainPage: navigateBackToLastMainPage,
      navigateTo: navigateTo,
      hasRouteParameter: hasRouteParameter,
      noArea: noArea,
      isArea: isArea,
      baseUrl: baseUrl,
      area: area,
      resourceUrlForAWSFileName: resourceUrlForAWSFileName,
      notificationHref: notificationHref,
      resourceUrl: resourceUrl,
      relativeUrlFirstSegment: relativeUrlFirstSegment,
      relativeUrl: relativeUrl
    }

  }]);



/* concatenated from src/legacy/src/app/js/walkNotifications.js */

angular.module('ekwgApp')
  .controller('WalkNotificationsController', ["$log", "$scope", "WalkNotificationService", "RamblersWalksAndEventsService", function ($log, $scope, WalkNotificationService, RamblersWalksAndEventsService) {
    $scope.dataAuditDelta = WalkNotificationService.dataAuditDelta($scope.walk, $scope.status);
    $scope.validateWalk = RamblersWalksAndEventsService.validateWalk($scope.walk);
    RamblersWalksAndEventsService.walkBaseUrl().then(function (walkBaseUrl) {
      $scope.ramblersWalkBaseUrl = walkBaseUrl;
    });
  }])
  .factory('WalkNotificationService', ["$sce", "$log", "$timeout", "$filter", "$location", "$rootScope", "$q", "$compile", "$templateRequest", "$routeParams", "$cookieStore", "URLService", "MemberService", "MailchimpConfig", "MailchimpSegmentService", "WalksReferenceService", "MemberAuditService", "RamblersWalksAndEventsService", "MailchimpCampaignService", "LoggedInMemberService", "DateUtils", function ($sce, $log, $timeout, $filter, $location, $rootScope, $q, $compile, $templateRequest, $routeParams,
                                                $cookieStore, URLService, MemberService, MailchimpConfig, MailchimpSegmentService, WalksReferenceService,
                                                MemberAuditService, RamblersWalksAndEventsService, MailchimpCampaignService, LoggedInMemberService, DateUtils) {

    var logger = $log.getInstance('WalkNotificationService');
    var noLogger = $log.getInstance('WalkNotificationServiceNoLog');
    $log.logLevels['WalkNotificationService'] = $log.LEVEL.OFF;
    $log.logLevels['WalkNotificationServiceNoLog'] = $log.LEVEL.OFF;
    var basePartialsUrl = 'ekwg-legacy/partials/walks/notifications';
    var auditedFields = ['grade', 'walkDate', 'walkType', 'startTime', 'briefDescriptionAndStartPoint', 'longerDescription', 'distance', 'nearestTown', 'gridReference', 'meetupEventUrl', 'meetupEventTitle', 'osMapsRoute', 'osMapsTitle', 'postcode', 'walkLeaderMemberId', 'contactPhone', 'contactEmail', 'contactId', 'displayName', 'ramblersWalkId'];

    function currentDataValues(walk) {
      return _.compactObject(_.pick(walk, auditedFields));
    }

    function previousDataValues(walk) {
      var event = latestWalkEvent(walk);
      return event && event.data || {};
    }

    function latestWalkEvent(walk) {
      return (walk.events && _.last(walk.events)) || {};
    }

    function eventsLatestFirst(walk) {
      var events = walk.events && _(walk.events).clone().reverse() || [];
      noLogger.info('eventsLatestFirst:', events);
      return events;
    }

    function latestEventWithStatusChange(walk) {
      return _(eventsLatestFirst(walk)).find(function (event) {
        return (WalksReferenceService.toEventType(event.eventType) || {}).statusChange;
      }) || {};
    }

    function dataAuditDelta(walk, status) {
      if (!walk) return {};
      var currentData = currentDataValues(walk);
      var previousData = previousDataValues(walk);
      var changedItems = calculateChangedItems();
      var eventExists = latestEventWithStatusChangeIs(walk, status);
      var dataChanged = changedItems.length > 0;
      var dataAuditDelta = {
        currentData: currentData,
        previousData: previousData,
        changedItems: changedItems,
        eventExists: eventExists,
        dataChanged: dataChanged,
        notificationRequired: dataChanged || !eventExists,
        eventType: dataChanged && eventExists ? WalksReferenceService.eventTypes.walkDetailsUpdated.eventType : status
      };
      dataAuditDelta.dataChanged && noLogger.info('dataAuditDelta', dataAuditDelta);
      return dataAuditDelta;

      function calculateChangedItems() {
        return _.compact(_.map(auditedFields, function (key) {
          var currentValue = currentData[key];
          var previousValue = previousData[key];
          noLogger.info('auditing', key, 'now:', currentValue, 'previous:', previousValue);
          if (previousValue !== currentValue) return {
            fieldName: key,
            previousValue: previousValue,
            currentValue: currentValue
          }
        }));
      }

    }

    function latestEventWithStatusChangeIs(walk, eventType) {
      if (!walk) return false;
      return latestEventWithStatusChange(walk).eventType === toEventTypeValue(eventType);
    }

    function toEventTypeValue(eventType) {
      return _.has(eventType, 'eventType') ? eventType.eventType : eventType;
    }

    function latestEventForEventType(walk, eventType) {
      if (walk) {
        var eventTypeString = toEventTypeValue(eventType);
        return eventsLatestFirst(walk).find(function (event) {
          return event.eventType === eventTypeString;
        });
      }
    }

    function populateWalkApprovedEventsIfRequired(walks) {
      return _(walks).map(function (walk) {
        if (_.isArray(walk.events)) {
          return walk
        } else {
          var event = createEventIfRequired(walk, WalksReferenceService.eventTypes.approved.eventType, 'Marking past walk as approved');
          writeEventIfRequired(walk, event);
          walk.$saveOrUpdate();
          return walk;
        }
      })
    }

    function createEventIfRequired(walk, status, reason) {
      var dataAuditDeltaInfo = dataAuditDelta(walk, status);
      logger.debug('createEventIfRequired:', dataAuditDeltaInfo);
      if (dataAuditDeltaInfo.notificationRequired) {
        var event = {
          "date": DateUtils.nowAsValue(),
          "memberId": LoggedInMemberService.loggedInMember().memberId,
          "data": dataAuditDeltaInfo.currentData,
          "eventType": dataAuditDeltaInfo.eventType
        };
        if (reason) event.reason = reason;
        if (dataAuditDeltaInfo.dataChanged) event.description = 'Changed: ' + $filter('toAuditDeltaChangedItems')(dataAuditDeltaInfo.changedItems);
        logger.debug('createEventIfRequired: event created:', event);
        return event;
      } else {
        logger.debug('createEventIfRequired: event creation not necessary');
      }
    }

    function writeEventIfRequired(walk, event) {
      if (event) {
        logger.debug('writing event', event);
        if (!_.isArray(walk.events)) walk.events = [];
        walk.events.push(event);
      } else {
        logger.debug('no event to write');
      }
    }

    function createEventAndSendNotifications(members, walk, status, notify, sendNotification, reason) {

      notify.setBusy();

      var event = createEventIfRequired(walk, status, reason);
      var notificationScope = $rootScope.$new();
      notificationScope.walk = walk;
      notificationScope.members = members;
      notificationScope.event = event;
      notificationScope.status = status;
      var eventType = event && WalksReferenceService.toEventType(event.eventType);

      if (event && sendNotification) {
        return sendNotificationsToAllRoles()
          .then(function () {
            return writeEventIfRequired(walk, event);
          })
          .then(function () {
            return true;
          })
          .catch(function (error) {
            logger.debug('failed with error', error);
            return notify.error({title: error.message, message: error.error})
          });
      } else {
        logger.debug('Not sending notification');
        return $q.when(writeEventIfRequired(walk, event))
          .then(function () {
            return false;
          });
      }

      function renderTemplateContent(templateData) {

        var task = $q.defer();
        var templateFunction = $compile(templateData);
        var templateElement = templateFunction(notificationScope);
        $timeout(function () {
          notificationScope.$digest();
          task.resolve(templateElement.html());
        });
        return task.promise;
      }


      function sendNotificationsToAllRoles() {

        return LoggedInMemberService.getMemberForMemberId(walk.walkLeaderMemberId)
          .then(function (member) {
            logger.debug('sendNotification:', 'memberId', walk.walkLeaderMemberId, 'member', member);
            var walkLeaderName = $filter('fullNameWithAlias')(member);
            var walkDate = $filter('displayDate')(walk.walkDate);

            return $q.when(notify.progress('Preparing to send email notifications'))
              .then(sendLeaderNotifications, notify.error, notify.progress)
              .then(sendCoordinatorNotifications, notify.error, notify.progress);

            function sendLeaderNotifications() {
              if (eventType.notifyLeader) return sendNotificationsTo({
                templateUrl: templateForEvent('leader', eventType.eventType),
                memberIds: [walk.walkLeaderMemberId],
                segmentType: 'walkLeader',
                segmentName: MailchimpSegmentService.formatSegmentName('Walk leader notifications for ' + walkLeaderName),
                emailSubject: 'Your walk on ' + walkDate,
                destination: 'walk leader'
              });
              logger.debug('not sending leader notification');
            }

            function sendCoordinatorNotifications() {
              if (eventType.notifyCoordinator) {
                var memberIds = MemberService.allMemberIdsWithPrivilege('walkChangeNotifications', members);
                if (memberIds.length > 0) {
                  return sendNotificationsTo({
                    templateUrl: templateForEvent('coordinator', eventType.eventType),
                    memberIds: memberIds,
                    segmentType: 'walkCoordinator',
                    segmentName: MailchimpSegmentService.formatSegmentName('Walk co-ordinator notifications for ' + walkLeaderName),
                    emailSubject: walkLeaderName + "'s walk on " + walkDate,
                    destination: 'walk co-ordinators'
                  });
                } else {
                  logger.debug('not sending coordinator notifications as none are configured with walkChangeNotifications');
                }
              } else {
                logger.debug('not sending coordinator notifications as event type is', eventType.eventType);
              }
            }

            function templateForEvent(role, eventTypeString) {
              return basePartialsUrl + '/' + role + '/' + s.dasherize(eventTypeString) + '.html';
            }

            function sendNotificationsTo(templateAndNotificationMembers) {
              if (templateAndNotificationMembers.memberIds.length === 0) throw new Error('No members have been configured as ' + templateAndNotificationMembers.destination + ' therefore notifications cannot be sent');
              var memberFullNames = $filter('memberIdsToFullNames')(templateAndNotificationMembers.memberIds, members);
              logger.debug('sendNotificationsTo:', templateAndNotificationMembers);
              var campaignName = templateAndNotificationMembers.emailSubject + ' (' + eventType.description + ')';
              var segmentName = templateAndNotificationMembers.segmentName;

              return $templateRequest($sce.getTrustedResourceUrl(templateAndNotificationMembers.templateUrl))
                .then(renderTemplateContent, notify.error)
                .then(populateContentSections, notify.error)
                .then(sendNotification(templateAndNotificationMembers), notify.error);

              function populateContentSections(walkNotificationText) {
                logger.debug('populateContentSections -> walkNotificationText', walkNotificationText);
                return {
                  sections: {
                    notification_text: walkNotificationText
                  }
                };
              }

              function sendNotification(templateAndNotificationMembers) {
                return function (contentSections) {
                  return createOrSaveMailchimpSegment()
                    .then(saveSegmentDataToMember, notify.error, notify.progress)
                    .then(sendEmailCampaign, notify.error, notify.progress)
                    .then(notifyEmailSendComplete, notify.error, notify.success);

                  function createOrSaveMailchimpSegment() {
                    return MailchimpSegmentService.saveSegment('walks', {segmentId: MailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType)}, templateAndNotificationMembers.memberIds, segmentName, members);
                  }

                  function saveSegmentDataToMember(segmentResponse) {
                    MailchimpSegmentService.setMemberSegmentId(member, templateAndNotificationMembers.segmentType, segmentResponse.segment.id);
                    return LoggedInMemberService.saveMember(member);
                  }

                  function sendEmailCampaign() {
                    notify.progress('Sending ' + campaignName);
                    return MailchimpConfig.getConfig()
                      .then(function (config) {
                        var campaignId = config.mailchimp.campaigns.walkNotification.campaignId;
                        var segmentId = MailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType);
                        logger.debug('about to send campaign', campaignName, 'campaign Id', campaignId, 'segmentId', segmentId);
                        return MailchimpCampaignService.replicateAndSendWithOptions({
                          campaignId: campaignId,
                          campaignName: campaignName,
                          contentSections: contentSections,
                          segmentId: segmentId
                        });
                      })
                      .then(function () {
                        notify.progress('Sending of ' + campaignName + ' was successful', true);
                      });
                  }

                  function notifyEmailSendComplete() {
                    notify.success('Sending of ' + campaignName + ' was successful. Check your inbox for details.');
                    return true;
                  }
                }
              }
            }
          });
      }
    }

    return {
      dataAuditDelta: dataAuditDelta,
      eventsLatestFirst: eventsLatestFirst,
      createEventIfRequired: createEventIfRequired,
      populateWalkApprovedEventsIfRequired: populateWalkApprovedEventsIfRequired,
      writeEventIfRequired: writeEventIfRequired,
      latestEventWithStatusChangeIs: latestEventWithStatusChangeIs,
      latestEventWithStatusChange: latestEventWithStatusChange,
      createEventAndSendNotifications: createEventAndSendNotifications
    }
  }]);


/* concatenated from src/legacy/src/app/js/walkSlots.js.js */

angular.module('ekwgApp')
  .controller('WalkSlotsController', ["$rootScope", "$log", "$scope", "$filter", "$q", "WalksService", "WalksQueryService", "WalksReferenceService", "WalkNotificationService", "LoggedInMemberService", "DateUtils", "Notifier", function ($rootScope, $log, $scope, $filter, $q, WalksService, WalksQueryService, WalksReferenceService, WalkNotificationService, LoggedInMemberService, DateUtils, Notifier) {

      var logger = $log.getInstance('WalkSlotsController');
      $log.logLevels['WalkSlotsController'] = $log.LEVEL.OFF;

      $scope.slotsAlert = {};
      $scope.todayValue = DateUtils.momentNowNoTime().valueOf();

      $scope.slot = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.slot.opened = true;
        },
        validDate: function (date) {
          return DateUtils.isDate(date);
        },
        until: DateUtils.momentNowNoTime().day(7 * 12).valueOf(),
        bulk: true
      };
      var notify = Notifier($scope.slotsAlert);

      function createSlots(requiredSlots, confirmAction, prompt) {
        $scope.requiredWalkSlots = requiredSlots.map(function (date) {
          var walk = new WalksService({
            walkDate: date
          });
          walk.events = [WalkNotificationService.createEventIfRequired(walk, WalksReferenceService.eventTypes.awaitingLeader.eventType, 'Walk slot created')];
          return walk;
        });
        logger.debug('$scope.requiredWalkSlots', $scope.requiredWalkSlots);
        if ($scope.requiredWalkSlots.length > 0) {
          $scope.confirmAction = confirmAction;
          notify.warning(prompt)
        } else {
          notify.error({title: "Nothing to do!", message: "All slots are already created between today and " + $filter('displayDate')($scope.slot.until)});
          delete $scope.confirmAction;
        }

      }

      $scope.addWalkSlots = function () {
        WalksService.query({walkDate: {$gte: $scope.todayValue}}, {fields: {events: 1, walkDate: 1}, sort: {walkDate: 1}})
          .then(function (walks) {
            var sunday = DateUtils.momentNowNoTime().day(7);
            var untilDate = DateUtils.asMoment($scope.slot.until).startOf('day');
            var weeks = untilDate.clone().diff(sunday, 'weeks');
            var allGeneratedSlots = _.times(weeks, function (index) {
              return DateUtils.asValueNoTime(sunday.clone().add(index, 'week'));
            }).filter(function (date) {
              return DateUtils.asString(date, undefined, 'DD-MMM') !== '25-Dec';
            });
            var existingDates = _.pluck(WalksQueryService.activeWalks(walks), 'walkDate');
            logger.debug('sunday', sunday, 'untilDate', untilDate, 'weeks', weeks);
            logger.debug('existingDatesAsDates', _(existingDates).map($filter('displayDateAndTime')));
            logger.debug('allGeneratedSlotsAsDates', _(allGeneratedSlots).map($filter('displayDateAndTime')));
            var requiredSlots = _.difference(allGeneratedSlots, existingDates);
            var requiredDates = $filter('displayDates')(requiredSlots);
            createSlots(requiredSlots, {addSlots: true}, {
              title: "Add walk slots",
              message: " - You are about to add " + requiredSlots.length + " empty walk slots up to " + $filter('displayDate')($scope.slot.until) + '. Slots are: ' + requiredDates
            });
          });
      };

      $scope.addWalkSlot = function () {
        createSlots([DateUtils.asValueNoTime($scope.slot.single)], {addSlot: true}, {
          title: "Add walk slots",
          message: " - You are about to add 1 empty walk slot for " + $filter('displayDate')($scope.slot.single)
        });
      };

      $scope.selectBulk = function (bulk) {
        $scope.slot.bulk = bulk;
        delete $scope.confirmAction;
        notify.hide();
      };

      $scope.allow = {
        addSlot: function () {
          return !$scope.confirmAction && !$scope.slot.bulk && LoggedInMemberService.allowWalkAdminEdits();
        },
        addSlots: function () {
          return !$scope.confirmAction && $scope.slot.bulk && LoggedInMemberService.allowWalkAdminEdits();
        },
        close: function () {
          return !$scope.confirmAction;
        }
      };

      $scope.cancelConfirmableAction = function () {
        delete $scope.confirmAction;
        notify.hide();
      };

      $scope.confirmAddWalkSlots = function () {
        notify.success({title: "Add walk slots - ", message: "now creating " + $scope.requiredWalkSlots.length + " empty walk slots up to " + $filter('displayDate')($scope.slot.until)});
        $q.all($scope.requiredWalkSlots.map(function (slot) {
          return slot.$saveOrUpdate();
        })).then(function () {
          notify.success({title: "Done!", message: "Choose Close to see your newly created slots"});
          delete $scope.confirmAction;
        });
      };

      $scope.$on('addWalkSlotsDialogOpen', function () {
        $('#add-slots-dialog').modal();
        delete $scope.confirmAction;
        notify.hide();
      });

      $scope.closeWalkSlotsDialog = function () {
        $('#add-slots-dialog').modal('hide');
        $rootScope.$broadcast('walkSlotsCreated');
      };

    }]
  );


/* concatenated from src/legacy/src/app/js/walks.js */

angular.module('ekwgApp')
  .factory('WalksService', ["$mongolabResourceHttp", function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('walks')
  }])
  .factory('WalksQueryService', ["WalkNotificationService", "WalksReferenceService", function (WalkNotificationService, WalksReferenceService) {

    function activeWalks(walks) {
      return _.filter(walks, function (walk) {
        return !WalkNotificationService.latestEventWithStatusChangeIs(walk, WalksReferenceService.eventTypes.deleted)
      })
    }

    return {
      activeWalks: activeWalks
    }
  }])
  .factory('WalksReferenceService', function () {

    var eventTypes = {
      awaitingLeader: {
        statusChange: true,
        eventType: 'awaitingLeader',
        description: 'Awaiting walk leader'
      },
      awaitingWalkDetails: {
        mustHaveLeader: true,
        statusChange: true,
        eventType: 'awaitingWalkDetails',
        description: 'Awaiting walk details from leader',
        notifyLeader: true,
        notifyCoordinator: true
      },
      walkDetailsRequested: {
        mustHaveLeader: true,
        eventType: 'walkDetailsRequested',
        description: 'Walk details requested from leader',
        notifyLeader: true,
        notifyCoordinator: true
      },
      walkDetailsUpdated: {
        eventType: 'walkDetailsUpdated',
        description: 'Walk details updated',
        notifyLeader: true,
        notifyCoordinator: true
      },
      walkDetailsCopied: {
        eventType: 'walkDetailsCopied',
        description: 'Walk details copied'
      },
      awaitingApproval: {
        mustHaveLeader: true,
        mustPassValidation: true,
        statusChange: true,
        eventType: 'awaitingApproval',
        readyToBe: 'approved',
        description: 'Awaiting confirmation of walk details',
        notifyLeader: true,
        notifyCoordinator: true
      },
      approved: {
        mustHaveLeader: true,
        mustPassValidation: true,
        showDetails: true,
        statusChange: true,
        eventType: 'approved',
        readyToBe: 'published',
        description: 'Approved',
        notifyLeader: true,
        notifyCoordinator: true
      },
      deleted: {
        statusChange: true,
        eventType: 'deleted',
        description: 'Deleted',
        notifyLeader: true,
        notifyCoordinator: true
      }
    };

    return {
      toEventType: function (eventTypeString) {
        if (eventTypeString) {
          if (_.includes(eventTypeString, ' ')) eventTypeString = s.camelcase(eventTypeString.toLowerCase());
          var eventType = eventTypes[eventTypeString];
          if (!eventType) throw new Error("Event Type '" + eventTypeString + "' does not exist. Must be one of: " + _.keys(eventTypes).join(', '));
          return eventType;
        }
      },
      walkEditModes: {
        add: {caption: 'add', title: 'Add new'},
        edit: {caption: 'edit', title: 'Edit existing', editEnabled: true},
        more: {caption: 'more', title: 'View'},
        lead: {caption: 'lead', title: 'Lead this', initialiseWalkLeader: true}
      },
      eventTypes: eventTypes,
      walkStatuses: _(eventTypes).filter(function (eventType) {
        return eventType.statusChange;
      })
    }
  })
  .controller('WalksController', ["$sce", "$log", "$routeParams", "$interval", "$rootScope", "$location", "$scope", "$filter", "$q", "RamblersUploadAudit", "WalksService", "WalksQueryService", "URLService", "ClipboardService", "WalksReferenceService", "WalkNotificationService", "LoggedInMemberService", "MemberService", "DateUtils", "BatchGeoExportService", "RamblersWalksAndEventsService", "Notifier", "CommitteeReferenceData", "GoogleMapsConfig", "MeetupService", function ($sce, $log, $routeParams, $interval, $rootScope, $location, $scope, $filter, $q, RamblersUploadAudit, WalksService, WalksQueryService, URLService,
                                           ClipboardService, WalksReferenceService, WalkNotificationService, LoggedInMemberService, MemberService, DateUtils, BatchGeoExportService,
                                           RamblersWalksAndEventsService, Notifier, CommitteeReferenceData, GoogleMapsConfig, MeetupService) {

      var logger = $log.getInstance('WalksController');
      var noLogger = $log.getInstance('WalksControllerNoLogger');
      $log.logLevels['WalksControllerNoLogger'] = $log.LEVEL.OFF;
      $log.logLevels['WalksController'] = $log.LEVEL.OFF;
      $scope.contactUs = {
        ready: function () {
          return CommitteeReferenceData.ready;
        }
      };

      $scope.$watch('filterParameters.quickSearch', function (quickSearch, oldQuery) {
        refreshFilteredWalks();
      });

      $scope.finalStatusError = function () {
        return _.findWhere($scope.ramblersUploadAudit, {status: "error"});
      };

      $scope.fileNameChanged = function () {
        logger.debug('filename changed to', $scope.userEdits.fileName);
        $scope.refreshRamblersUploadAudit();
      };

      $scope.refreshRamblersUploadAudit = function (stop) {
        logger.debug('refreshing audit trail records related to', $scope.userEdits.fileName);
        return RamblersUploadAudit.query({fileName: $scope.userEdits.fileName}, {sort: {auditTime: -1}})
          .then(function (auditItems) {
            logger.debug('Filtering', auditItems.length, 'audit trail records related to', $scope.userEdits.fileName);
            $scope.ramblersUploadAudit = _.chain(auditItems)
              .filter(function (auditItem) {
                return $scope.userEdits.showDetail || auditItem.type !== "detail";
              })
              .map(function (auditItem) {
                if (auditItem.status === "complete") {
                  logger.debug('Upload complete');
                  notifyWalkExport.success("Ramblers upload completed");
                  $interval.cancel(stop);
                  $scope.userEdits.saveInProgress = false;
                }
                return auditItem;
              })
              .value();
          });
      };

      $scope.ramblersUploadAudit = [];
      $scope.walksForExport = [];
      $scope.walkEditModes = WalksReferenceService.walkEditModes;
      $scope.walkStatuses = WalksReferenceService.walkStatuses;
      $scope.walkAlert = {};
      $scope.walkExport = {};
      var notify = Notifier($scope);
      var notifyWalkExport = Notifier($scope.walkExport);
      var notifyWalkEdit = Notifier($scope.walkAlert);
      var SHOW_START_POINT = "show-start-point";
      var SHOW_DRIVING_DIRECTIONS = "show-driving-directions";
      notify.setBusy();
      $scope.copyFrom = {walkTemplates: [], walkTemplate: {}};
      $scope.userEdits = {
        copyToClipboard: ClipboardService.copyToClipboard,
        meetupEvent: {},
        copySource: 'copy-selected-walk-leader',
        copySourceFromWalkLeaderMemberId: undefined,
        expandedWalks: [],
        mapDisplay: SHOW_START_POINT,
        longerDescriptionPreview: true,
        walkExportActive: function (activeTab) {
          return activeTab === $scope.walkExportActive;
        },
        walkExportTab0Active: true,
        walkExportTab1Active: false,
        walkExportTabActive: 0,
        status: undefined,
        sendNotifications: true,
        saveInProgress: false,
        fileNames: [],
        walkLink: function (walk) {
          return walk && walk.$id() ? URLService.notificationHref({
            type: "walk",
            area: "walks",
            id: walk.$id()
          }) : undefined
        }
      };
      $scope.walks = [];
      $scope.busy = false;
      $scope.walksProgrammeOpen = URLService.isArea('programme', 'walkId') || URLService.noArea();
      $scope.walksInformationOpen = URLService.isArea('information');
      $scope.walksMapViewOpen = URLService.isArea('mapview');

      $scope.todayValue = DateUtils.momentNowNoTime().valueOf();

      $scope.userEdits.walkDateCalendar = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.userEdits.walkDateCalendar.opened = true;
        }
      };

      $scope.addWalk = function () {
        showWalkDialog(new WalksService({
          status: WalksReferenceService.eventTypes.awaitingLeader.eventType,
          walkType: $scope.type[0],
          walkDate: $scope.todayValue
        }), WalksReferenceService.walkEditModes.add);
      };

      $scope.addWalkSlotsDialog = function () {
        $rootScope.$broadcast('addWalkSlotsDialogOpen');
      };

      $scope.unlinkRamblersDataFromCurrentWalk = function () {
        delete $scope.currentWalk.ramblersWalkId;
        notify.progress('Previous Ramblers walk has now been unlinked.')
      };

      $scope.canUnlinkRamblers = function () {
        return LoggedInMemberService.allowWalkAdminEdits() && $scope.ramblersWalkExists();
      };

      $scope.unlinkMeetup = function () {
        delete $scope.currentWalk.meetupEventTitle;
        delete $scope.currentWalk.meetupEventUrl;
        notify.progress('Previous Meetup link has now been removed.')
      };

      $scope.canUnlinkMeetup = function () {
        return LoggedInMemberService.allowWalkAdminEdits() && $scope.currentWalk && $scope.currentWalk.meetupEventUrl;
      };

      $scope.notUploadedToRamblersYet = function () {
        return !$scope.ramblersWalkExists();
      };

      $scope.insufficientDataToUploadToRamblers = function () {
        return LoggedInMemberService.allowWalkAdminEdits() && $scope.currentWalk && !($scope.currentWalk.gridReference || $scope.currentWalk.postcode);
      };

      $scope.canExportToRamblers = function () {
        return LoggedInMemberService.allowWalkAdminEdits() && $scope.validateWalk().selected;
      };

      $scope.validateWalk = function () {
        return RamblersWalksAndEventsService.validateWalk($scope.currentWalk, $scope.members);
      };

      $scope.walkValidations = function () {
        var walkValidations = $scope.validateWalk().walkValidations;
        return 'This walk cannot be included in the Ramblers Walks and Events Manager export due to the following ' + walkValidations.length + ' problem(s): ' + walkValidations.join(", ") + '.';
      };

      $scope.grades = ['Easy access', 'Easy', 'Leisurely', 'Moderate', 'Strenuous', 'Technical'];
      $scope.walkTypes = ['Circular', 'Linear'];

      $scope.meetupEventUrlChange = function (walk) {
        walk.meetupEventTitle = $scope.userEdits.meetupEvent.title;
        walk.meetupEventUrl = $scope.userEdits.meetupEvent.url;
      };

      $scope.meetupSelectSync = function (walk) {
        $scope.userEdits.meetupEvent = _.findWhere($scope.meetupEvents, {url: walk.meetupEventUrl});
      };

      $scope.ramblersWalkExists = function () {
        return $scope.validateWalk().publishedOnRamblers
      };

      function loggedInMemberIsLeadingWalk(walk) {
        return walk && walk.walkLeaderMemberId === LoggedInMemberService.loggedInMember().memberId
      }

      $scope.loggedIn = function () {
        return LoggedInMemberService.memberLoggedIn();
      };

      $scope.toWalkEditMode = function (walk) {
        if (LoggedInMemberService.memberLoggedIn()) {
          if (loggedInMemberIsLeadingWalk(walk) || LoggedInMemberService.allowWalkAdminEdits()) {
            return WalksReferenceService.walkEditModes.edit;
          } else if (!walk.walkLeaderMemberId) {
            return WalksReferenceService.walkEditModes.lead;
          }
        }
      };

      $scope.actionWalk = function (walk) {
        showWalkDialog(walk, $scope.toWalkEditMode(walk));
      };

      $scope.deleteWalkDetails = function () {
        $scope.confirmAction = {delete: true};
        notifyWalkEdit.warning({
          title: 'Confirm delete of walk details.',
          message: 'If you confirm this, the slot for ' + $filter('displayDate')($scope.currentWalk.walkDate) + ' will be deleted from the site.'
        });
      };

      $scope.cancelWalkDetails = function () {
        $scope.confirmAction = {cancel: true};
        notifyWalkEdit.warning({
          title: 'Cancel changes.',
          message: 'Click Confirm to lose any changes you\'ve just made for ' + $filter('displayDate')($scope.currentWalk.walkDate) + ', or Cancel to carry on editing.'
        });
      };

      $scope.confirmCancelWalkDetails = function () {
        hideWalkDialogAndRefreshWalks();
      };

      function isWalkReadyForStatusChangeTo(eventType) {
        notifyWalkEdit.hide();
        logger.info('isWalkReadyForStatusChangeTo ->', eventType);
        var walkValidations = $scope.validateWalk().walkValidations;
        if (eventType.mustHaveLeader && !$scope.currentWalk.walkLeaderMemberId) {
          notifyWalkEdit.warning(
            {
              title: 'Walk leader needed',
              message: ' - this walk cannot be changed to ' + eventType.description + ' yet.'
            });
          revertToPriorWalkStatus();
          return false;
        } else if (eventType.mustPassValidation && walkValidations.length > 0) {
          notifyWalkEdit.warning(
            {
              title: 'This walk is not ready to be ' + eventType.readyToBe + ' yet due to the following ' + walkValidations.length + ' problem(s): ',
              message: walkValidations.join(", ") + '. You can still save this walk, then come back later on to complete the rest of the details.'
            });
          revertToPriorWalkStatus();
          return false;
        } else {
          return true;
        }
      }

      function initiateEvent() {
        $scope.userEdits.saveInProgress = true;
        var walk = DateUtils.convertDateFieldInObject($scope.currentWalk, 'walkDate');
        return WalkNotificationService.createEventAndSendNotifications($scope.members, walk, $scope.userEdits.status, notifyWalkEdit, $scope.userEdits.sendNotifications && walk.walkLeaderMemberId);
      }

      $scope.confirmDeleteWalkDetails = function () {
        $scope.userEdits.status = WalksReferenceService.eventTypes.deleted.eventType;
        return initiateEvent()
          .then(function () {
            return $scope.currentWalk.$saveOrUpdate(hideWalkDialogAndRefreshWalks, hideWalkDialogAndRefreshWalks);
          })
          .catch(function () {
            $scope.userEdits.saveInProgress = false;
          });
      };

      $scope.saveWalkDetails = function () {
        return initiateEvent()
          .then(function (notificationSent) {
            return $scope.currentWalk.$saveOrUpdate(afterSaveWith(notificationSent), afterSaveWith(notificationSent));
          })
          .catch(function () {
            $scope.userEdits.saveInProgress = false;
          });
      };

      $scope.requestApproval = function () {
        logger.info('requestApproval called with current status:', $scope.userEdits.status);
        if (isWalkReadyForStatusChangeTo(WalksReferenceService.eventTypes.awaitingApproval)) {
          $scope.confirmAction = {requestApproval: true};
          notifyWalkEdit.warning({
            title: 'Confirm walk details complete.',
            message: 'If you confirm this, your walk details will be emailed to ' + walksCoordinatorName() + ' and they will publish these to the site.'
          });
        }
      };

      $scope.contactOther = function () {
        notifyWalkEdit.warning({
          title: 'Confirm walk details complete.',
          message: 'If you confirm this, your walk details will be emailed to ' + walksCoordinatorName() + ' and they will publish these to the site.'
        });
      };

      $scope.walkStatusChange = function (status) {
        $scope.userEdits.priorStatus = status;
        notifyWalkEdit.hide();
        logger.info('walkStatusChange - was:', status, 'now:', $scope.userEdits.status);
        if (isWalkReadyForStatusChangeTo(WalksReferenceService.toEventType($scope.userEdits.status)))
          switch ($scope.userEdits.status) {
            case WalksReferenceService.eventTypes.awaitingLeader.eventType: {
              var walkDate = $scope.currentWalk.walkDate;
              $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingLeader.eventType;
              $scope.currentWalk = new WalksService(_.pick($scope.currentWalk, ['_id', 'events', 'walkDate']));
              return notifyWalkEdit.success({
                title: 'Walk details reset for ' + $filter('displayDate')(walkDate) + '.',
                message: 'Status is now ' + WalksReferenceService.eventTypes.awaitingLeader.description
              });
            }
            case WalksReferenceService.eventTypes.approved.eventType: {
              return $scope.approveWalkDetails();
            }
          }

      };

      $scope.approveWalkDetails = function () {
        var walkValidations = $scope.validateWalk().walkValidations;
        if (walkValidations.length > 0) {
          notifyWalkEdit.warning({
            title: 'This walk still has the following ' + walkValidations.length + ' field(s) that need attention: ',
            message: walkValidations.join(", ") +
              '. You\'ll have to get the rest of these details completed before you mark the walk as approved.'
          });
          revertToPriorWalkStatus();
        } else {
          notifyWalkEdit.success({
            title: 'Ready to publish walk details!',
            message: 'All fields appear to be filled in okay, so next time you save this walk it will be published.'
          });
        }
      };

      $scope.confirmRequestApproval = function () {
        $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingApproval.eventType;
        $scope.saveWalkDetails();
      };

      $scope.cancelConfirmableAction = function () {
        delete $scope.confirmAction;
        notify.hide();
        notifyWalkEdit.hide();
      };

      function revertToPriorWalkStatus() {
        logger.info('revertToPriorWalkStatus:', $scope.userEdits.status, '->', $scope.userEdits.priorStatus);
        if ($scope.userEdits.priorStatus) $scope.userEdits.status = $scope.userEdits.priorStatus;
      }

      $scope.populateCurrentWalkFromTemplate = function () {
        var walkTemplate = _.clone($scope.copyFrom.walkTemplate);
        if (walkTemplate) {
          var templateDate = $filter('displayDate')(walkTemplate.walkDate);
          delete walkTemplate._id;
          delete walkTemplate.events;
          delete walkTemplate.ramblersWalkId;
          delete walkTemplate.walkDate;
          delete walkTemplate.displayName;
          delete walkTemplate.contactPhone;
          delete walkTemplate.contactEmail;
          angular.extend($scope.currentWalk, walkTemplate);
          var event = WalkNotificationService.createEventIfRequired($scope.currentWalk, WalksReferenceService.eventTypes.walkDetailsCopied.eventType, 'Copied from previous walk on ' + templateDate);
          WalkNotificationService.writeEventIfRequired($scope.currentWalk, event);
          notifyWalkEdit.success({
            title: 'Walk details were copied from ' + templateDate + '.',
            message: 'Make any further changes here and save when you are done.'
          });
        }
      };

      $scope.filterParameters = {
        quickSearch: '',
        selectType: '1',
        ascending: "true"
      };

      $scope.selectCopySelectedLeader = function () {
        $scope.userEdits.copySource = 'copy-selected-walk-leader';
        $scope.populateWalkTemplates();
      };

      $scope.populateWalkTemplates = function (injectedMemberId) {
        var memberId = $scope.currentWalk.walkLeaderMemberId || injectedMemberId;
        var criteria;
        switch ($scope.userEdits.copySource) {
          case "copy-selected-walk-leader": {
            criteria = {
              walkLeaderMemberId: $scope.userEdits.copySourceFromWalkLeaderMemberId,
              briefDescriptionAndStartPoint: {$exists: true}
            };
            break
          }
          case "copy-with-os-maps-route-selected": {
            criteria = {osMapsRoute: {$exists: true}};
            break
          }
          default: {
            criteria = {walkLeaderMemberId: memberId};
          }
        }
        logger.info('selecting walks', $scope.userEdits.copySource, criteria);
        WalksService.query(criteria, {sort: {walkDate: -1}})
          .then(function (walks) {
            $scope.copyFrom.walkTemplates = walks;
          });
      };

      $scope.walkLeaderMemberIdChanged = function () {
        notifyWalkEdit.hide();
        var walk = $scope.currentWalk;
        var memberId = walk.walkLeaderMemberId;
        if (!memberId) {
          $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingLeader.eventType;
          delete walk.walkLeaderMemberId;
          delete walk.contactId;
          delete walk.displayName;
          delete walk.contactPhone;
          delete walk.contactEmail;
        } else {
          var selectedMember = _.find($scope.members, function (member) {
            return member.$id() === memberId;
          });
          if (selectedMember) {
            $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingWalkDetails.eventType;
            walk.contactId = selectedMember.contactId;
            walk.displayName = selectedMember.displayName;
            walk.contactPhone = selectedMember.mobileNumber;
            walk.contactEmail = selectedMember.email;
            $scope.populateWalkTemplates(memberId);
          }
        }
      };

      $scope.myOrWalkLeader = function () {
        return loggedInMemberIsLeadingWalk($scope.currentWalk) ? 'my' : $scope.currentWalk && $scope.currentWalk.displayName + "'s";
      };

      $scope.meOrWalkLeader = function () {
        return loggedInMemberIsLeadingWalk($scope.currentWalk) ? 'me' : $scope.currentWalk && $scope.currentWalk.displayName;
      };

      $scope.personToNotify = function () {
        return loggedInMemberIsLeadingWalk($scope.currentWalk) ? walksCoordinatorName() : $scope.currentWalk && $scope.currentWalk.displayName;
      };

      function walksCoordinatorName() {
        return CommitteeReferenceData.contactUsField('walks', 'fullName');
      }

      function convertWalkDateIfNotNumeric(walk) {
        var walkDate = DateUtils.asValueNoTime(walk.walkDate);
        if (walkDate !== walk.walkDate) {
          logger.info('Converting date from', walk.walkDate, '(' + $filter('displayDateAndTime')(walk.walkDate) + ') to', walkDate, '(' + $filter('displayDateAndTime')(walkDate) + ')');
          walk.walkDate = walkDate;
        } else {
          logger.info('Walk date', walk.walkDate, 'is already in correct format');
        }
        return walk;
      }

      function latestEventWithStatusChangeIs(eventType) {
        return WalkNotificationService.latestEventWithStatusChangeIs($scope.currentWalk, eventType);
      }

      $scope.dataHasChanged = function () {
        var dataAuditDelta = WalkNotificationService.dataAuditDelta($scope.currentWalk, $scope.userEdits.status);
        var notificationRequired = dataAuditDelta.notificationRequired;
        dataAuditDelta.notificationRequired && noLogger.info('dataAuditDelta - eventExists:', dataAuditDelta.eventExists, 'dataChanged:', dataAuditDelta.dataChanged, $filter('toAuditDeltaChangedItems')(dataAuditDelta.changedItems));
        dataAuditDelta.dataChanged && noLogger.info('dataAuditDelta - previousData:', dataAuditDelta.previousData, 'currentData:', dataAuditDelta.currentData);
        return notificationRequired;
      };

      function ownedAndAwaitingWalkDetails() {
        return loggedInMemberIsLeadingWalk($scope.currentWalk) && $scope.userEdits.status === WalksReferenceService.eventTypes.awaitingWalkDetails.eventType;
      }

      function editable() {
        return !$scope.confirmAction && (LoggedInMemberService.allowWalkAdminEdits() || loggedInMemberIsLeadingWalk($scope.currentWalk));
      }

      function allowSave() {
        return editable() && $scope.dataHasChanged();
      }

      $scope.allow = {
        close: function () {
          return !$scope.userEdits.saveInProgress && !$scope.confirmAction && !allowSave()
        },
        save: allowSave,
        cancel: function () {
          return !$scope.userEdits.saveInProgress && editable() && $scope.dataHasChanged();
        },
        delete: function () {
          return !$scope.confirmAction && LoggedInMemberService.allowWalkAdminEdits() && $scope.walkEditMode && $scope.walkEditMode.editEnabled;
        },
        notifyConfirmation: function () {
          return (allowSave() || $scope.confirmAction && $scope.confirmAction.delete) && $scope.currentWalk.walkLeaderMemberId;
        },
        adminEdits: function () {
          return LoggedInMemberService.allowWalkAdminEdits();
        },
        edits: editable,
        historyView: function () {
          return loggedInMemberIsLeadingWalk($scope.currentWalk) || LoggedInMemberService.allowWalkAdminEdits();
        },
        detailView: function () {
          return LoggedInMemberService.memberLoggedIn();
        },
        approve: function () {
          return !$scope.confirmAction && LoggedInMemberService.allowWalkAdminEdits() && latestEventWithStatusChangeIs(WalksReferenceService.eventTypes.awaitingApproval);
        },
        requestApproval: function () {
          return !$scope.confirmAction && ownedAndAwaitingWalkDetails();
        }
      };

      $scope.previewLongerDescription = function () {
        logger.debug('previewLongerDescription');
        $scope.userEdits.longerDescriptionPreview = true;
      };

      $scope.editLongerDescription = function () {
        logger.debug('editLongerDescription');
        $scope.userEdits.longerDescriptionPreview = false;
      };
      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      };

      $scope.showAllWalks = function () {
        $scope.expensesOpen = true;
        $location.path('/walks/programme')
      };

      $scope.googleMaps = function (walk) {
        return $scope.userEdits.mapDisplay === SHOW_DRIVING_DIRECTIONS ?
          "https://www.google.com/maps/embed/v1/directions?origin=" + $scope.userEdits.fromPostcode + "&destination=" + walk.postcode + "&key=" + $scope.googleMapsConfig.apiKey :
          "https://www.google.com/maps/embed/v1/place?q=" + walk.postcode + "&zoom=" + $scope.googleMapsConfig.zoomLevel + "&key=" + $scope.googleMapsConfig.apiKey;
      };

      $scope.autoSelectMapDisplay = function () {
        var switchToShowStartPoint = $scope.drivingDirectionsDisabled() && $scope.userEdits.mapDisplay === SHOW_DRIVING_DIRECTIONS;
        var switchToShowDrivingDirections = !$scope.drivingDirectionsDisabled() && $scope.userEdits.mapDisplay === SHOW_START_POINT;
        if (switchToShowStartPoint) {
          $scope.userEdits.mapDisplay = SHOW_START_POINT;
        } else if (switchToShowDrivingDirections) {
          $scope.userEdits.mapDisplay = SHOW_DRIVING_DIRECTIONS;
        }
      };

      $scope.drivingDirectionsDisabled = function () {
        return $scope.userEdits.fromPostcode.length < 3;
      };

      $scope.eventTypeFor = function (walk) {
        var latestEventWithStatusChange = WalkNotificationService.latestEventWithStatusChange(walk);
        var eventType = WalksReferenceService.toEventType(latestEventWithStatusChange.eventType) || walk.status || WalksReferenceService.eventTypes.awaitingWalkDetails.eventType;
        noLogger.info('latestEventWithStatusChange', latestEventWithStatusChange, 'eventType', eventType, 'walk.events', walk.events);
        return eventType;
      };

      $scope.viewWalkField = function (walk, field) {
        var eventType = $scope.eventTypeFor(walk);
        if (eventType.showDetails) {
          return walk[field] || '';
        } else if (field === 'briefDescriptionAndStartPoint') {
          return eventType.description;
        } else {
          return '';
        }
      };

      function showWalkDialog(walk, walkEditMode) {
        delete $scope.confirmAction;
        $scope.userEdits.sendNotifications = true;
        $scope.walkEditMode = walkEditMode;
        $scope.currentWalk = walk;
        if (walkEditMode.initialiseWalkLeader) {
          $scope.userEdits.status = WalksReferenceService.eventTypes.awaitingWalkDetails.eventType;
          walk.walkLeaderMemberId = LoggedInMemberService.loggedInMember().memberId;
          $scope.walkLeaderMemberIdChanged();
          notifyWalkEdit.success({
            title: 'Thanks for offering to lead this walk ' + LoggedInMemberService.loggedInMember().firstName + '!',
            message: 'Please complete as many details you can, then save to allocate this slot on the walks programme. ' +
              'It will be published to the public once it\'s approved. If you want to release this slot again, just click cancel.'
          });
        } else {
          var eventTypeIfExists = WalkNotificationService.latestEventWithStatusChange($scope.currentWalk).eventType;
          if (eventTypeIfExists) {
            $scope.userEdits.status = eventTypeIfExists
          }
          $scope.userEdits.copySourceFromWalkLeaderMemberId = walk.walkLeaderMemberId || LoggedInMemberService.loggedInMember().memberId;
          $scope.populateWalkTemplates();
          $scope.meetupSelectSync($scope.currentWalk);
          notifyWalkEdit.hide();
        }
        $('#walk-dialog').modal();
      }

      function walksCriteriaObject() {
        switch ($scope.filterParameters.selectType) {
          case '1':
            return {walkDate: {$gte: $scope.todayValue}};
          case '2':
            return {walkDate: {$lt: $scope.todayValue}};
          case '3':
            return {};
          case '4':
            return {displayName: {$exists: false}};
          case '5':
            return {briefDescriptionAndStartPoint: {$exists: false}};
        }
      }

      function walksSortObject() {
        switch ($scope.filterParameters.ascending) {
          case 'true':
            return {sort: {walkDate: 1}};
          case 'false':
            return {sort: {walkDate: -1}};
        }
      }


      function query() {
        if (URLService.hasRouteParameter('walkId')) {
          return WalksService.getById($routeParams.walkId)
            .then(function (walk) {
              if (!walk) notify.error('Walk could not be found. Try opening again from the link in the notification email, or choose the Show All Walks button');
              return [walk];
            });
        } else {
          return WalksService.query(walksCriteriaObject(), walksSortObject());
        }
      }

      function refreshFilteredWalks() {
        notify.setBusy();
        $scope.filteredWalks = $filter('filter')($scope.walks, $scope.filterParameters.quickSearch);
        var walksCount = ($scope.filteredWalks && $scope.filteredWalks.length) || 0;
        notify.progress('Showing ' + walksCount + ' walk(s)');
        if ($scope.filteredWalks.length > 0) {
          $scope.userEdits.expandedWalks = [$scope.filteredWalks[0].$id()];
        }
        notify.clearBusy();
      }

      $scope.showTableHeader = function (walk) {
        return $scope.filteredWalks.indexOf(walk) === 0 || $scope.isExpandedFor($scope.filteredWalks[$scope.filteredWalks.indexOf(walk) - 1]);
      };

      $scope.nextWalk = function (walk) {
        return walk && walk.$id() === $scope.nextWalkId;
      };

      $scope.durationInFutureFor = function (walk) {
        return walk && walk.walkDate === $scope.todayValue ? 'today' : (DateUtils.asMoment(walk.walkDate).fromNow());
      };

      $scope.toggleViewFor = function (walk) {

        function arrayRemove(arr, value) {

          return arr.filter(function (ele) {
            return ele !== value;
          });

        }

        var walkId = walk.$id();
        if (_.contains($scope.userEdits.expandedWalks, walkId)) {
          $scope.userEdits.expandedWalks = arrayRemove($scope.userEdits.expandedWalks, walkId);
          logger.debug('toggleViewFor:', walkId, '-> collapsing');
        } else {
          $scope.userEdits.expandedWalks.push(walkId);
          logger.debug('toggleViewFor:', walkId, '-> expanding');
        }
        logger.debug('toggleViewFor:', walkId, '-> expandedWalks contains', $scope.userEdits.expandedWalks)
      };

      $scope.isExpandedFor = function (walk) {
        return _.contains($scope.userEdits.expandedWalks, walk.$id());
      };

      $scope.tableRowOdd = function (walk) {
        return $scope.filteredWalks.indexOf(walk) % 2 === 0;
      };

      function getNextWalkId(walks) {
        var nextWalk = _.chain(walks).sortBy('walkDate').find(function (walk) {
          return walk.walkDate >= $scope.todayValue;
        }).value();

        return nextWalk && nextWalk.$id();
      }

      $scope.refreshWalks = function (notificationSent) {
        notify.setBusy();
        notify.progress('Refreshing walks...');
        return query()
          .then(function (walks) {
            $scope.nextWalkId = URLService.hasRouteParameter('walkId') ? undefined : getNextWalkId(walks);
            $scope.walks = URLService.hasRouteParameter('walkId') ? walks : WalksQueryService.activeWalks(walks);
            refreshFilteredWalks();
            notify.clearBusy();
            if (!notificationSent) {
              notifyWalkEdit.hide();
            }
            $scope.userEdits.saveInProgress = false;
          });
      };

      $scope.hideWalkDialog = function () {
        $('#walk-dialog').modal('hide');
        delete $scope.confirmAction;
      };

      function hideWalkDialogAndRefreshWalks() {
        logger.info('hideWalkDialogAndRefreshWalks');
        $scope.hideWalkDialog();
        $scope.refreshWalks();
      }

      function afterSaveWith(notificationSent) {
        return function () {
          if (!notificationSent) $('#walk-dialog').modal('hide');
          notifyWalkEdit.clearBusy();
          delete $scope.confirmAction;
          $scope.refreshWalks(notificationSent);
          $scope.userEdits.saveInProgress = false;
        }
      }

      function refreshRamblersConfig() {
        RamblersWalksAndEventsService.walkBaseUrl().then(function (walkBaseUrl) {
          $scope.ramblersWalkBaseUrl = walkBaseUrl;
        });
      }

      function refreshGoogleMapsConfig() {
        GoogleMapsConfig.getConfig().then(function (googleMapsConfig) {
          $scope.googleMapsConfig = googleMapsConfig;
          $scope.googleMapsConfig.zoomLevel = 12;
        });
      }

      function refreshMeetupData() {
        MeetupService.config().then(function (meetupConfig) {
          $scope.meetupConfig = meetupConfig;
        });

        MeetupService.eventsForStatus('past')
          .then(function (pastEvents) {
            MeetupService.eventsForStatus('upcoming')
              .then(function (futureEvents) {
                $scope.meetupEvents = _.sortBy(pastEvents.concat(futureEvents), 'date,').reverse();
              });
          })
      }

      function refreshHomePostcode() {
        $scope.userEdits.fromPostcode = LoggedInMemberService.memberLoggedIn() ? LoggedInMemberService.loggedInMember().postcode : "";
        logger.debug('set from postcode to', $scope.userEdits.fromPostcode);
        $scope.autoSelectMapDisplay();
      }

      $scope.$on('memberLoginComplete', function () {
        refreshMembers();
        refreshHomePostcode();
      });

      $scope.$on('walkSlotsCreated', function () {
        $scope.refreshWalks();
      });

      function refreshMembers() {
        if (LoggedInMemberService.memberLoggedIn()) MemberService.allLimitedFields(MemberService.filterFor.GROUP_MEMBERS)
          .then(function (members) {
            $scope.members = members;
            return members;
          });
      }

      $scope.batchGeoDownloadFile = function () {
        return BatchGeoExportService.exportWalks($scope.walks, $scope.members);
      };

      $scope.batchGeoDownloadFileName = function () {
        return BatchGeoExportService.exportWalksFileName();
      };

      $scope.batchGeoDownloadHeader = function () {
        return BatchGeoExportService.exportColumnHeadings();
      };

      $scope.exportableWalks = function () {
        return RamblersWalksAndEventsService.exportableWalks($scope.walksForExport);
      };

      $scope.walksDownloadFile = function () {
        return RamblersWalksAndEventsService.exportWalks($scope.exportableWalks(), $scope.members);
      };

      $scope.uploadToRamblers = function () {
        $scope.ramblersUploadAudit = [];
        $scope.userEdits.walkExportTab0Active = false;
        $scope.userEdits.walkExportTab1Active = true;
        $scope.userEdits.saveInProgress = true;
        RamblersWalksAndEventsService.uploadToRamblers($scope.walksForExport, $scope.members, notifyWalkExport).then(function (fileName) {
          $scope.userEdits.fileName = fileName;
          var stop = $interval(callAtInterval, 2000, false);
          if (!_.contains($scope.userEdits.fileNames, $scope.userEdits.fileName)) {
            $scope.userEdits.fileNames.push($scope.userEdits.fileName);
            logger.debug('added', $scope.userEdits.fileName, 'to filenames of', $scope.userEdits.fileNames.length, 'audit trail records');
          }
          delete $scope.finalStatusError;

          function callAtInterval() {
            logger.debug("Refreshing audit trail for file", $scope.userEdits.fileName, 'count =', $scope.ramblersUploadAudit.length);
            $scope.refreshRamblersUploadAudit(stop);
          }

        });
      };

      $scope.walksDownloadFileName = function () {
        return RamblersWalksAndEventsService.exportWalksFileName();
      };

      $scope.walksDownloadHeader = function () {
        return RamblersWalksAndEventsService.exportColumnHeadings();
      };

      $scope.selectWalksForExport = function () {
        showWalkExportDialog();
      };

      $scope.changeWalkExportSelection = function (walk) {
        if (walk.walkValidations.length === 0) {
          walk.selected = !walk.selected;
          notifyWalkExport.hide();
        } else {
          notifyWalkExport.error({
            title: 'You can\'t export the walk for ' + $filter('displayDate')(walk.walk.walkDate),
            message: walk.walkValidations.join(', ')
          });
        }
      };

      $scope.cancelExportWalkDetails = function () {
        $('#walk-export-dialog').modal('hide');
      };

      function populateWalkExport(walksForExport) {
        $scope.walksForExport = walksForExport;
        notifyWalkExport.success('Found total of ' + $scope.walksForExport.length + ' walk(s), ' + $scope.walksDownloadFile().length + ' preselected for export');
        notifyWalkExport.clearBusy();
      }


      function showWalkExportDialog() {
        $scope.walksForExport = [];
        notifyWalkExport.warning('Determining which walks to export', true);
        RamblersUploadAudit.all({limit: 1000, sort: {auditTime: -1}})
          .then(function (auditItems) {
            logger.debug('found total of', auditItems.length, 'audit trail records');
            $scope.userEdits.fileNames = _.chain(auditItems).pluck('fileName').unique().value();
            logger.debug('unique total of', $scope.userEdits.fileNames.length, 'audit trail records');
          });
        RamblersWalksAndEventsService.createWalksForExportPrompt($scope.walks, $scope.members)
          .then(populateWalkExport)
          .catch(function (error) {
            logger.debug('error->', error);
            notifyWalkExport.error({title: 'Problem with Ramblers export preparation', message: JSON.stringify(error)});
          });
        $('#walk-export-dialog').modal();
      }

      refreshMembers();
      $scope.refreshWalks();
      refreshRamblersConfig();
      refreshGoogleMapsConfig();
      refreshMeetupData();
      refreshHomePostcode();
    }]
  )
;
