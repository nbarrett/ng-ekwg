angular.module('ekwgApp')
  .controller('AdminController',
    function($rootScope, $scope, LoggedInMemberService) {

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

    }
  );
