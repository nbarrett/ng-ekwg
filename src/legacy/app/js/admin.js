angular.module('ekwgApp')
  .controller('AdminController',
    function($rootScope, $scope, MemberLoginService, BroadcastService) {

      function setViewPriveleges() {
        $scope.loggedIn = MemberLoginService.memberLoggedIn();
        $scope.memberAdmin = MemberLoginService.allowMemberAdminEdits();
        MemberLoginService.showLoginPromptWithRouteParameter('expenseId');
      }

      setViewPriveleges();

      BroadcastService.on('memberLoginComplete', function() {
        setViewPriveleges();
      });

      BroadcastService.on('memberLogoutComplete', function() {
        setViewPriveleges();
      });

    }
  );
