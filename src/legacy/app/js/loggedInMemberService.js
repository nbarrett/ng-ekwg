angular.module('ekwgApp')
  .factory('LoggedInMemberService', function ($rootScope, $q, $routeParams, $cookieStore, BroadcastService, URLService, MemberService, MemberAuditService, DateUtils, NumberUtils, $log) {

      var logger = $log.getInstance('LoggedInMemberService');
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
        BroadcastService.broadcast('memberLogoutComplete');
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
        logger.info('setting cookie ' + key + ' with value ', value);
        $cookieStore.put(key, value);
      }

      function removeCookie(key) {
        logger.info('removing cookie ' + key);
        $cookieStore.remove(key);
      }

      function getCookie(key) {
        return $cookieStore.get(key);
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
                  return BroadcastService.broadcast('memberLoginComplete');
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
            BroadcastService.broadcast('memberSaveComplete');
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
          BroadcastService.broadcast('memberLoginComplete');
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

    }
  );
