angular.module('ekwgApp')
  .controller('CommitteeNotificationSettingsController', function ($window, $log, $sce, $timeout, $templateRequest, $compile, $q, $rootScope, $scope, $filter, $routeParams,
                                                                   $location, URLService, DateUtils, NumberUtils, MemberLoginService, MemberService,
                                                                   ContentMetaDataService, CommitteeFileService, MailchimpSegmentService, MailchimpCampaignService,
                                                                   MAILCHIMP_APP_CONSTANTS, MailchimpConfig, Notifier, close) {

      var logger = $log.getInstance('CommitteeNotificationSettingsController');
      $log.logLevels['CommitteeNotificationSettingsController'] = $log.LEVEL.OFF;
      $scope.notify = {};
      $scope.campaigns = [];
      var notify = Notifier.createAlertInstance($scope.notify);
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
        MailchimpConfig.saveConfig($scope.config).then(close).catch(notify.error.bind(notify));
      };

      $scope.cancel = function () {
        close();
      };

    }
  );
