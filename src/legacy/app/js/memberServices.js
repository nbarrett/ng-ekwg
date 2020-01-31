angular.module('ekwgApp')
  .factory('MemberUpdateAuditService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberUpdateAudit');
  })
  .factory('MemberBulkLoadAuditService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberBulkLoadAudit');
  })
  .factory('MemberAuditService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('memberAudit');
  })
  .factory('ExpenseClaimsService', function ($mongolabResourceHttp) {
    return $mongolabResourceHttp('expenseClaims');
  })
