angular.module('ekwgApp')
  .factory('ProfileConfirmationService', function ($filter, LoggedInMemberService, DateUtils) {

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
  })
  .controller('ProfileController', function ($q, $rootScope, $routeParams, $scope, LoggedInMemberService, MemberService,
                                             URLService, ProfileConfirmationService, EmailSubscriptionService, CommitteeReferenceData) {

    $scope.showArea = function (area) {
      URLService.navigateTo('admin', area)
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

  });
