angular.module('ekwgApp')
  .controller('LetterheadController', function ($scope, $location) {
    var pathParts = $location.path().replace('/letterhead/', '').split('/');
    $scope.firstPart = _.first(pathParts);
    $scope.lastPart = _.last(pathParts);
  });