const mainPages = {
  HOME: "/",
  SOCIAL: "/social",
  COMMITTEE: "/committee",
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
  "angular-logger"])
  .constant("MONGOLAB_CONFIG", {
    trimErrorMessage: false,
    baseUrl: "/api/database/",
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
    $locationProvider.html5Mode(true).hashPrefix("");
  })
  .config(function ($routeProvider, uiSelectConfig, uibDatepickerConfig, uibDatepickerPopupConfig, logEnhancerProvider) {
    uiSelectConfig.theme = "bootstrap";
    uiSelectConfig.closeOnSelect = false;

    $routeProvider
      .when(mainPages.HOW_TO, {
        controller: "HowToController",
        templateUrl: "partials/howTo/how-to.html",
        title: "How-to"
      })
      .when("/image-editor/:imageSource", {
        controller: "ImageEditController", templateUrl: "partials/imageEditor/image-editor.html", title: "image editor"
      })
      .when("/letterhead/:firstPart?/:secondPart", {
        templateUrl: "partials/letterhead/letterhead.html", title: "letterhead"
      })
      .when(mainPages.SOCIAL + "/socialEventId/:socialEventId", {
        controller: "SocialEventsController", templateUrl: "partials/socialEvents/social.html", title: "social"
      })
      .when(mainPages.SOCIAL + "/:area?", {
        controller: "SocialEventsController", templateUrl: "partials/socialEvents/social.html", title: "social"
      })
      .otherwise({template: ''});

    uibDatepickerConfig.startingDay = 1;
    uibDatepickerConfig.showWeeks = false;
    uibDatepickerPopupConfig.datepickerPopup = "dd-MMM-yyyy";
    uibDatepickerPopupConfig.formatDay = "dd";
    logEnhancerProvider.datetimePattern = "hh:mm:ss";
    logEnhancerProvider.prefixPattern = "%s - %s -";
  });
