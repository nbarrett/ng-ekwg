angular.module('ekwgApp')
  .controller("HowToDialogController", function ($rootScope, $log, $q, $scope, $filter, FileUtils, DateUtils, EKWGFileUpload, DbUtils, LoggedInMemberService, ErrorMessageService,
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
  })
  .controller("HowToController", function ($rootScope, $window, $log, $sce, $timeout, $templateRequest, $compile, $q, $scope, $filter, $routeParams,
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

  });
