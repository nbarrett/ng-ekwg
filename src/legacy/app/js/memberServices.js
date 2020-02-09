angular.module('ekwgApp')
  .factory('ExpenseClaimsService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('expenseClaims');
  })
