angular.module("ekwgApp")
  .controller("ForgotPasswordController", function ($q, $log, $scope, $rootScope, $location, $routeParams, EmailSubscriptionService,
                                                    MemberService, MemberLoginService, URLService, MailchimpConfig, MailchimpSegmentService,
                                                    MailchimpCampaignService, Notifier, ValidationUtils, close) {
      var logger = $log.getInstance("ForgotPasswordController");
      $log.logLevels["ForgotPasswordController"] = $log.LEVEL.OFF;
      $scope.notify = {};
      var notify = Notifier.createAlertInstance($scope.notify);

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
            MemberLoginService.getMemberForResetPassword($scope.forgottenPasswordCredentials.credentialOne, $scope.forgottenPasswordCredentials.credentialTwo)
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
                  MemberLoginService.setPasswordResetId(member);
                  EmailSubscriptionService.resetUpdateStatusForMember(member);
                  logger.debug("saving member", member);
                  $scope.forgottenPasswordMember = member;
                  member.$saveOrUpdate(sendForgottenPasswordEmailToMember, sendForgottenPasswordEmailToMember, saveFailed, saveFailed);
                  forgotPasswordData.member = member;
                  forgotPasswordData.loginResponse.alertMessage = "New password requested from login screen";
                  return {forgotPasswordData: forgotPasswordData};
                }
              }).then(function (response) {
              return MemberLoginService.auditMemberLogin($scope.forgottenPasswordCredentials.credentialOne, response.forgotPasswordData.member, response.forgotPasswordData.loginResponse)
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
          .then(notify.clearBusy.bind(notify))
          .catch(handleSendError);
      }

      function handleSendError(errorResponse) {
        notify.error({
          title: "Your email could not be sent",
          message: (errorResponse.message || errorResponse) + (errorResponse.error ? (". Error was: " + StringUtils.stringify(errorResponse.error)) : "")
        });
      }

      function finalMessage() {
        return notify.success({
          title: "Message sent",
          message: "We've sent a message to the email address we have for you. Please check your inbox and follow the instructions in the message."
        })
      }

    }
  );
