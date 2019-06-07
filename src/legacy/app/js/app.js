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
  .config(function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|tel):/);
  })
  .constant("MAILCHIMP_APP_CONSTANTS", {
    allowSendCampaign: true,
    apiServer: "https://us3.admin.mailchimp.com"
  })
  .config(function ($locationProvider) {
    $locationProvider.hashPrefix("");
  })
  .config(function ($routeProvider, uiSelectConfig, uibDatepickerConfig, uibDatepickerPopupConfig, logEnhancerProvider) {
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
  })
  .run(function ($log, $rootScope, $route, URLService, CommitteeConfig, CommitteeReferenceData) {
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
  });
