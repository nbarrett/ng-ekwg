angular.module('ekwgApp')
  .controller('ExpensesController', function ($compile, $log, $timeout, $sce, $templateRequest, $q, $rootScope, $location, $routeParams,
                                              $scope, $filter, DateUtils, NumberUtils, URLService, LoggedInMemberService, MemberService, ContentMetaDataService,
                                              ExpenseClaimsService, MailchimpSegmentService, MailchimpCampaignService, MailchimpConfig, Notifier, EKWGFileUpload) {
      var logger = $log.getInstance('ExpensesController');
      var noLogger = $log.getInstance('ExpensesControllerNoLogger');
      $log.logLevels['ExpensesControllerNoLogger'] = $log.LEVEL.OFF;
      $log.logLevels['ExpensesController'] = $log.LEVEL.OFF;

      const SELECTED_EXPENSE = 'Expense from last email link';
      $scope.receiptBaseUrl = ContentMetaDataService.baseUrl('expenseClaims');
      $scope.dataError = false;
      $scope.members = [];
      $scope.expenseClaims = [];
      $scope.unfilteredExpenseClaims = [];
      $scope.expensesOpen = URLService.hasRouteParameter('expenseId') || URLService.isArea('expenses');
      $scope.alertMessages = [];
      $scope.filterTypes = [{
        disabled: !$routeParams.expenseId,
        description: SELECTED_EXPENSE,
        filter: function (expenseClaim) {
          if ($routeParams.expenseId) {
            return expenseClaim && expenseClaim.$id() === $routeParams.expenseId;
          }
          else {
            return false;
          }
        }
      }, {
        description: 'Unpaid expenses',
        filter: function (expenseClaim) {
          return !$scope.expenseClaimStatus(expenseClaim).atEndpoint;
        }
      }, {
        description: 'Paid expenses',
        filter: function (expenseClaim) {
          return $scope.expenseClaimStatus(expenseClaim).atEndpoint;
        }
      }, {
        description: 'Expenses awaiting action from me',
        filter: function (expenseClaim) {
          return LoggedInMemberService.allowFinanceAdmin() ? editable(expenseClaim) : editableAndOwned(expenseClaim);
        }
      }, {
        description: 'All expenses',
        filter: function () {
          return true;
        }
      }];
      $scope.selected = {
        showOnlyMine: !allowAdminFunctions(),
        saveInProgress: false,
        expenseClaimIndex: 0,
        expenseItemIndex: 0,
        expenseFilter: $scope.filterTypes[$routeParams.expenseId ? 0 : 1]
      };

      $scope.itemAlert = {};
      var notify = Notifier($scope);
      var notifyItem = Notifier($scope.itemAlert);
      notify.setBusy();
      var notificationsBaseUrl = 'partials/expenses/notifications';

      LoggedInMemberService.showLoginPromptWithRouteParameter('expenseId');

      $scope.showArea = function (area) {
        URLService.navigateTo('admin', area)
      };

      $scope.selected.expenseClaim = function () {
        try {
          return $scope.expenseClaims[$scope.selected.expenseClaimIndex];
        } catch (e) {
          console.error(e);
        }
      };

      $scope.isInactive = function (expenseClaim) {
        return expenseClaim !== $scope.selected.expenseClaim();
      };

      $scope.selected.expenseItem = function () {
        try {
          var expenseClaim = $scope.expenseClaims[$scope.selected.expenseClaimIndex];
          return expenseClaim ? expenseClaim.expenseItems[$scope.selected.expenseItemIndex] : undefined;
        } catch (e) {
          console.error(e);
        }
      };

      $scope.expenseTypes = [
        {value: "travel-reccie", name: "Travel (walk reccie)", travel: true},
        {value: "travel-committee", name: "Travel (attend committee meeting)", travel: true},
        {value: "other", name: "Other"}];

      var eventTypes = {
        created: {description: "Created", editable: true},
        submitted: {description: "Submitted", actionable: true, notifyCreator: true, notifyApprover: true},
        'first-approval': {description: "First Approval", actionable: true, notifyApprover: true},
        'second-approval': {
          description: "Second Approval",
          actionable: true,
          notifyCreator: true,
          notifyApprover: true,
          notifyTreasurer: true
        },
        returned: {description: "Returned", atEndpoint: false, editable: true, notifyCreator: true, notifyApprover: true},
        paid: {description: "Paid", atEndpoint: true, notifyCreator: true, notifyApprover: true, notifyTreasurer: true}
      };

      var defaultExpenseClaim = function () {
        return _.clone({
          "cost": 0,
          "expenseItems": [],
          "expenseEvents": []
        })
      };

      var defaultExpenseItem = function () {
        return _.clone({
          expenseType: $scope.expenseTypes[0],
          "travel": {
            "costPerMile": 0.28,
            "miles": 0,
            "from": '',
            "to": '',
            "returnJourney": true
          }
        });
      };

      function editable(expenseClaim) {
        return memberCanEditClaim(expenseClaim) && $scope.expenseClaimStatus(expenseClaim).editable;
      }

      function editableAndOwned(expenseClaim) {
        return memberOwnsClaim(expenseClaim) && $scope.expenseClaimStatus(expenseClaim).editable;
      }

      $scope.editable = function () {
        return editable($scope.selected.expenseClaim());
      };

      $scope.allowClearError = function () {
        return URLService.hasRouteParameter('expenseId') && $scope.dataError;
      };

      $scope.allowAddExpenseClaim = function () {
        return !$scope.dataError && !_.find($scope.unfilteredExpenseClaims, editableAndOwned);
      };

      $scope.allowFinanceAdmin = function () {
        return LoggedInMemberService.allowFinanceAdmin();
      };

      $scope.allowEditExpenseItem = function () {
        return $scope.allowAddExpenseItem() && $scope.selected.expenseItem() && $scope.selected.expenseClaim().$id();
      };

      $scope.allowAddExpenseItem = function () {
        return $scope.editable();
      };

      $scope.allowDeleteExpenseItem = function () {
        return $scope.allowEditExpenseItem();
      };

      $scope.allowDeleteExpenseClaim = function () {
        return !$scope.allowDeleteExpenseItem() && $scope.allowAddExpenseItem();
      };

      $scope.allowSubmitExpenseClaim = function () {
        return $scope.allowEditExpenseItem() && !$scope.allowResubmitExpenseClaim();
      };

      function allowAdminFunctions() {
        return LoggedInMemberService.allowTreasuryAdmin() || LoggedInMemberService.allowFinanceAdmin();
      }

      $scope.allowAdminFunctions = function () {
        return allowAdminFunctions();
      };

      $scope.allowReturnExpenseClaim = function () {
        return $scope.allowAdminFunctions()
          && $scope.selected.expenseClaim()
          && expenseClaimHasEventType($scope.selected.expenseClaim(), eventTypes.submitted)
          && !expenseClaimHasEventType($scope.selected.expenseClaim(), eventTypes.returned)
          && $scope.expenseClaimStatus($scope.selected.expenseClaim()).actionable;
      };

      $scope.allowResubmitExpenseClaim = function () {
        return $scope.editable() && expenseClaimHasEventType($scope.selected.expenseClaim(), eventTypes.returned);
      };

      $scope.allowPaidExpenseClaim = function () {
        return LoggedInMemberService.allowTreasuryAdmin() && _.contains(
          [eventTypes.submitted.description, eventTypes['second-approval'].description, eventTypes['first-approval'].description],
          $scope.expenseClaimLatestEvent().eventType.description);
      };

      function activeEvents(optionalEvents) {
        var events = optionalEvents || $scope.selected.expenseClaim().expenseEvents;
        var latestReturnedEvent = _.find(events.reverse(), function (event) {
          return _.isEqual(event.eventType, $scope.expenseClaimStatus.returned);
        });
        return latestReturnedEvent ? events.slice(events.indexOf(latestReturnedEvent + 1)) : events;
      }

      function expenseClaimHasEventType(expenseClaim, eventType) {
        if (!expenseClaim) return false;
        return eventForEventType(expenseClaim, eventType);
      }

      function eventForEventType(expenseClaim, eventType) {
        if (expenseClaim) return _.find(expenseClaim.expenseEvents, function (event) {
          return _.isEqual(event.eventType, eventType);
        });
      }

      $scope.allowApproveExpenseClaim = function () {
        return false;
      };

      $scope.lastApprovedByMe = function () {
        var approvalEvents = $scope.approvalEvents();
        return approvalEvents.length > 0 && _.last(approvalEvents).memberId === LoggedInMemberService.loggedInMember().memberId;

      };

      $scope.approvalEvents = function () {
        if (!$scope.selected.expenseClaim()) return [];
        return _.filter($scope.selected.expenseClaim().expenseEvents, function (event) {
          return _.isEqual(event.eventType, eventTypes['first-approval']) || _.isEqual(event.eventType, eventTypes['second-approval']);
        });
      };

      $scope.expenseClaimStatus = function (optionalExpenseClaim) {
        var expenseClaim = optionalExpenseClaim || $scope.selected.expenseClaim();
        return $scope.expenseClaimLatestEvent(expenseClaim).eventType;
      };

      $scope.expenseClaimLatestEvent = function (optionalExpenseClaim) {
        var expenseClaim = optionalExpenseClaim || $scope.selected.expenseClaim();
        return expenseClaim ? _.last(expenseClaim.expenseEvents) : {};
      };

      $scope.nextApprovalStage = function () {
        var approvals = $scope.approvalEvents();
        if (approvals.length === 0) {
          return 'First Approval';
        }
        else if (approvals.length === 1) {
          return 'Second Approval'
        }
        else {
          return 'Already has ' + approvals.length + ' approvals!';
        }
      };

      $scope.confirmApproveExpenseClaim = function () {
        var approvals = $scope.approvalEvents();
        notifyItem.hide();
        if (approvals.length === 0) {
          createEventAndSendNotifications(eventTypes['first-approval']);
        }
        else if (approvals.length === 1) {
          createEventAndSendNotifications(eventTypes['second-approval']);
        }
        else {
          notify.error('This expense claim already has ' + approvals.length + ' approvals!');
        }
      };

      $scope.showAllExpenseClaims = function () {
        $scope.dataError = false;
        $location.path('/admin/expenses')
      };

      $scope.addExpenseClaim = function () {
        $scope.expenseClaims.unshift(new ExpenseClaimsService(defaultExpenseClaim()));
        $scope.selectExpenseClaim(0);
        createEvent(eventTypes.created);
        $scope.addExpenseItem();
      };

      $scope.selectExpenseItem = function (index) {
        if ($scope.selected.saveInProgress) {
          noLogger.info('selectExpenseItem - selected.saveInProgress - not changing to index', index);
        } else {
          noLogger.info('selectExpenseItem:', index);
          $scope.selected.expenseItemIndex = index;
        }
      };

      $scope.selectExpenseClaim = function (index) {
        if ($scope.selected.saveInProgress) {
          noLogger.info('selectExpenseClaim - selected.saveInProgress - not changing to index', index);
        } else {
          $scope.selected.expenseClaimIndex = index;
          var expenseClaim = $scope.selected.expenseClaim();
          noLogger.info('selectExpenseClaim:', index, expenseClaim);
        }
      };

      $scope.editExpenseItem = function () {
        $scope.removeConfirm();
        delete $scope.uploadedFile;
        $('#expense-detail-dialog').modal('show');
      };

      $scope.hideExpenseClaim = function () {
        $scope.removeConfirm();
        $('#expense-detail-dialog').modal('hide');
      };

      $scope.addReceipt = function () {
        $('#hidden-input').click();
      };

      $scope.removeReceipt = function () {
        delete $scope.selected.expenseItem().receipt;
        delete $scope.uploadedFile;
      };

      $scope.receiptTitle = function (expenseItem) {
        return expenseItem && expenseItem.receipt ? (expenseItem.receipt.title || expenseItem.receipt.originalFileName) : '';
      };

      function baseUrl() {
        return _.first($location.absUrl().split('/#'));
      }

      $scope.receiptUrl = function (expenseItem) {
        return expenseItem && expenseItem.receipt ? baseUrl() + $scope.receiptBaseUrl + '/' + expenseItem.receipt.awsFileName : '';
      };

      $scope.onFileSelect = function (file) {
        if (file) {
          $scope.uploadedFile = file;
          EKWGFileUpload.onFileSelect(file, notify, 'expenseClaims')
            .then(function (fileNameData) {
              var expenseItem = $scope.selected.expenseItem();
              var oldTitle = (expenseItem.receipt && expenseItem.receipt.title) ? receipt.title : undefined;
              expenseItem.receipt = fileNameData;
              expenseItem.receipt.title = oldTitle;
            });
        }
      };

      function createEvent(eventType, reason) {
        var expenseClaim = $scope.selected.expenseClaim();
        if (!expenseClaim.expenseEvents) expenseClaim.expenseEvents = [];
        var event = {
          "date": DateUtils.nowAsValue(),
          "memberId": LoggedInMemberService.loggedInMember().memberId,
          "eventType": eventType
        };
        if (reason) event.reason = reason;
        expenseClaim.expenseEvents.push(event);
      }

      $scope.addExpenseItem = function () {
        $scope.removeConfirm();
        var newExpenseItem = defaultExpenseItem();
        $scope.selected.expenseClaim().expenseItems.push(newExpenseItem);
        var index = $scope.selected.expenseClaim().expenseItems.indexOf(newExpenseItem);
        if (index > -1) {
          $scope.selectExpenseItem(index);
          $scope.editExpenseItem();
        } else {
          showExpenseErrorAlert('Could not display new expense item')
        }
      };

      $scope.expenseTypeChange = function () {
        logger.debug('$scope.selected.expenseItem().expenseType', $scope.selected.expenseItem().expenseType);
        if ($scope.selected.expenseItem().expenseType.travel) {
          if (!$scope.selected.expenseItem().travel) $scope.selected.expenseItem().travel = defaultExpenseItem().travel;
        } else {
          delete $scope.selected.expenseItem().travel;
        }
        $scope.setExpenseItemFields();
      };

      $scope.expenseDateCalendar = {
        open: function ($event) {
          $scope.expenseDateCalendar.opened = true;
        }
      };

      function recalculateClaimCost() {
        $scope.selected.expenseClaim().cost = $filter('sumValues')($scope.selected.expenseClaim().expenseItems, 'cost');
      }

      $scope.cancelExpenseChange = function () {
        $scope.refreshExpenses().then($scope.hideExpenseClaim).then(notify.clearBusy);
      };

      function showExpenseErrorAlert(message) {
        var messageDefaulted = message || 'Please try this again.';
        notify.error('Your expense claim could not be saved. ' + messageDefaulted);
        $scope.selected.saveInProgress = false;
      }

      function showExpenseEmailErrorAlert(message) {
        $scope.selected.saveInProgress = false;
        notify.error('Your expense claim email processing failed. ' + message);
      }

      function showExpenseProgressAlert(message, busy) {
        notify.progress(message, busy);
      }

      function showExpenseSuccessAlert(message, busy) {
        notify.success(message, busy);
      }

      $scope.saveExpenseClaim = function (optionalExpenseClaim) {

        $scope.selected.saveInProgress = true;

        function showExpenseSaved(data) {
          $scope.expenseClaims[$scope.selected.expenseClaimIndex] = data;
          $scope.selected.saveInProgress = false;
          return notify.success('Expense was saved successfully');
        }

        showExpenseProgressAlert('Saving expense claim', true);
        $scope.setExpenseItemFields();
        return (optionalExpenseClaim || $scope.selected.expenseClaim()).$saveOrUpdate(showExpenseSaved, showExpenseSaved, showExpenseErrorAlert, showExpenseErrorAlert)
          .then($scope.hideExpenseClaim)
          .then(notify.clearBusy);
      };

      $scope.approveExpenseClaim = function () {
        $scope.confirmAction = {approve: true};
        if ($scope.lastApprovedByMe()) notifyItem.warning({
          title: 'Duplicate approval warning',
          message: 'You were the previous approver, therefore ' + $scope.nextApprovalStage() + ' ought to be carried out by someone else. Are you sure you want to do this?'
        });
      };

      $scope.deleteExpenseClaim = function () {
        $scope.confirmAction = {delete: true};
      };

      $scope.deleteExpenseItem = function () {
        $scope.confirmAction = {delete: true};
      };

      $scope.confirmDeleteExpenseItem = function () {
        $scope.selected.saveInProgress = true;
        showExpenseProgressAlert('Deleting expense item', true);
        var expenseItem = $scope.selected.expenseItem();
        logger.debug('removing', expenseItem);
        var index = $scope.selected.expenseClaim().expenseItems.indexOf(expenseItem);
        if (index > -1) {
          $scope.selected.expenseClaim().expenseItems.splice(index, 1);
        } else {
          showExpenseErrorAlert('Could not delete expense item')
        }
        $scope.selectExpenseItem(0);
        recalculateClaimCost();
        $scope.saveExpenseClaim()
          .then($scope.removeConfirm)
          .then(notify.clearBusy);
      };

      $scope.removeConfirm = function () {
        delete $scope.confirmAction;
        showExpenseSuccessAlert();
      };

      $scope.confirmDeleteExpenseClaim = function () {
        showExpenseProgressAlert('Deleting expense claim', true);

        function showExpenseDeleted() {
          return showExpenseSuccessAlert('Expense was deleted successfully');
        }

        $scope.selected.expenseClaim().$remove(showExpenseDeleted, showExpenseDeleted, showExpenseErrorAlert, showExpenseErrorAlert)
          .then($scope.hideExpenseClaim)
          .then(showExpenseDeleted)
          .then($scope.refreshExpenses)
          .then($scope.removeConfirm)
          .then(notify.clearBusy);
      };

      $scope.submitExpenseClaim = function (state) {
        $scope.resubmit = state;
        $('#submit-dialog').modal('show');
      };

      function hideSubmitDialog() {
        $('#submit-dialog').modal('hide');
        $scope.resubmit = false;
      }

      $scope.cancelSubmitExpenseClaim = function () {
        hideSubmitDialog();
      };

      $scope.returnExpenseClaim = function () {
        $('#return-dialog').modal('show');
      };

      $scope.confirmReturnExpenseClaim = function (reason) {
        hideReturnDialog();
        return createEventAndSendNotifications(eventTypes.returned, reason);
      };

      function hideReturnDialog() {
        $('#return-dialog').modal('hide');
      }

      $scope.cancelReturnExpenseClaim = function () {
        hideReturnDialog();
      };

      $scope.paidExpenseClaim = function () {
        $('#paid-dialog').modal('show');
      };

      $scope.confirmPaidExpenseClaim = function () {
        createEventAndSendNotifications(eventTypes.paid)
          .then(hidePaidDialog);
      };

      function hidePaidDialog() {
        $('#paid-dialog').modal('hide');
      }

      $scope.cancelPaidExpenseClaim = function () {
        hidePaidDialog();
      };

      $scope.confirmSubmitExpenseClaim = function () {
        if ($scope.resubmit) $scope.selected.expenseClaim().expenseEvents = [eventForEventType($scope.selected.expenseClaim(), eventTypes.created)];
        createEventAndSendNotifications(eventTypes.submitted);
      };

      $scope.resubmitExpenseClaim = function () {
        $scope.submitExpenseClaim(true);
      };

      $scope.expenseClaimCreatedEvent = function (optionalExpenseClaim) {
        return eventForEventType(optionalExpenseClaim || $scope.selected.expenseClaim(), eventTypes.created);
      };

      function createEventAndSendNotifications(eventType, reason) {
        notify.setBusy();
        $scope.selected.saveInProgress = true;
        var expenseClaim = $scope.selected.expenseClaim();
        var expenseClaimCreatedEvent = $scope.expenseClaimCreatedEvent(expenseClaim);

        return $q.when(createEvent(eventType, reason))
          .then(sendNotificationsToAllRoles, showExpenseEmailErrorAlert)
          .then($scope.saveExpenseClaim, showExpenseEmailErrorAlert, showExpenseProgressAlert);

        function renderTemplateContent(templateData) {
          var task = $q.defer();
          var templateFunction = $compile(templateData);
          var templateElement = templateFunction($scope);
          $timeout(function () {
            $scope.$digest();
            task.resolve(templateElement.html());
          });
          return task.promise;
        }

        function sendNotificationsToAllRoles() {
          return LoggedInMemberService.getMemberForMemberId(expenseClaimCreatedEvent.memberId)
            .then(function (member) {
              logger.debug('sendNotification:', 'memberId', expenseClaimCreatedEvent.memberId, 'member', member);
              var memberFullName = $filter('fullNameWithAlias')(member);

              return $q.when(showExpenseProgressAlert('Preparing to email ' + memberFullName))
                .then(hideSubmitDialog, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                .then(sendCreatorNotifications, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                .then(sendApproverNotifications, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                .then(sendTreasurerNotifications, showExpenseEmailErrorAlert, showExpenseProgressAlert);

              function sendCreatorNotifications() {
                if (eventType.notifyCreator) return sendNotificationsTo({
                  templateUrl: templateForEvent('creator', eventType),
                  memberIds: [expenseClaimCreatedEvent.memberId],
                  segmentType: 'directMail',
                  segmentNameSuffix: '',
                  destination: 'creator'
                });
                return false;
              }

              function sendApproverNotifications() {
                if (eventType.notifyApprover) return sendNotificationsTo({
                  templateUrl: templateForEvent('approver', eventType),
                  memberIds: MemberService.allMemberIdsWithPrivilege('financeAdmin', $scope.members),
                  segmentType: 'expenseApprover',
                  segmentNameSuffix: 'approval ',
                  destination: 'approvers'
                });
                return false;
              }

              function sendTreasurerNotifications() {
                if (eventType.notifyTreasurer) return sendNotificationsTo({
                  templateUrl: templateForEvent('treasurer', eventType),
                  memberIds: MemberService.allMemberIdsWithPrivilege('treasuryAdmin', $scope.members),
                  segmentType: 'expenseTreasurer',
                  segmentNameSuffix: 'payment ',
                  destination: 'treasurer'
                });
                return false;
              }

              function templateForEvent(role, eventType) {
                return notificationsBaseUrl + '/' + role + '/' + eventType.description.toLowerCase().replace(' ', '-') + '-notification.html';
              }

              function sendNotificationsTo(templateAndNotificationMembers) {
                logger.debug('sendNotificationsTo:', templateAndNotificationMembers);
                var campaignName = 'Expense ' + eventType.description + ' notification (to ' + templateAndNotificationMembers.destination + ')';
                var campaignNameAndMember = campaignName + ' (' + memberFullName + ')';
                var segmentName = 'Expense notification ' + templateAndNotificationMembers.segmentNameSuffix + '(' + memberFullName + ')';
                if (templateAndNotificationMembers.memberIds.length === 0) throw new Error('No members have been configured as ' + templateAndNotificationMembers.destination + ' therefore notifications for this step will fail!!');
                return $templateRequest($sce.getTrustedResourceUrl(templateAndNotificationMembers.templateUrl))
                  .then(renderTemplateContent)
                  .then(populateContentSections)
                  .then(sendNotification(templateAndNotificationMembers))
                  .catch(showExpenseEmailErrorAlert);

                function populateContentSections(expenseNotificationText) {
                  return {
                    sections: {
                      expense_id_url: 'Please click <a href="' + baseUrl() + '/#/admin/expenseId/' + expenseClaim.$id() + '" target="_blank">this link</a> to see the details of the above expense claim, or to make changes to it.',
                      expense_notification_text: expenseNotificationText
                    }
                  };
                }

                function sendNotification(templateAndNotificationMembers) {
                  return function (contentSections) {
                    return createOrSaveMailchimpSegment()
                      .then(saveSegmentDataToMember, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                      .then(sendEmailCampaign, showExpenseEmailErrorAlert, showExpenseProgressAlert)
                      .then(notifyEmailSendComplete, showExpenseEmailErrorAlert, showExpenseSuccessAlert);

                    function createOrSaveMailchimpSegment() {
                      return MailchimpSegmentService.saveSegment('general', {segmentId: MailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType)}, templateAndNotificationMembers.memberIds, segmentName, $scope.members);
                    }

                    function saveSegmentDataToMember(segmentResponse) {
                      MailchimpSegmentService.setMemberSegmentId(member, templateAndNotificationMembers.segmentType, segmentResponse.segment.id);
                      return LoggedInMemberService.saveMember(member);
                    }

                    function sendEmailCampaign() {
                      showExpenseProgressAlert('Sending ' + campaignNameAndMember);
                      return MailchimpConfig.getConfig()
                        .then(function (config) {
                          var campaignId = config.mailchimp.campaigns.expenseNotification.campaignId;
                          var segmentId = MailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType);
                          logger.debug('about to replicateAndSendWithOptions with campaignName', campaignNameAndMember, 'campaign Id', campaignId, 'segmentId', segmentId);
                          return MailchimpCampaignService.replicateAndSendWithOptions({
                            campaignId: campaignId,
                            campaignName: campaignNameAndMember,
                            contentSections: contentSections,
                            segmentId: segmentId
                          });
                        })
                        .then(function () {
                          showExpenseProgressAlert('Sending of ' + campaignNameAndMember + ' was successful', true);
                        });
                    }

                    function notifyEmailSendComplete() {
                      showExpenseSuccessAlert('Sending of ' + campaignName + ' was successful. Check your inbox for progress.');
                    }
                  }
                }
              }
            });
        }
      }

      $scope.setExpenseItemFields = function () {
        var expenseItem = $scope.selected.expenseItem();
        if (expenseItem) {
          expenseItem.expenseDate = DateUtils.asValueNoTime(expenseItem.expenseDate);
          if (expenseItem.travel) expenseItem.travel.miles = NumberUtils.asNumber(expenseItem.travel.miles);
          expenseItem.description = expenseItemDescription(expenseItem);
          expenseItem.cost = expenseItemCost(expenseItem);
        }
        recalculateClaimCost();
      };

      $scope.prefixedExpenseItemDescription = function (expenseItem) {
        if (!expenseItem) return '';
        var prefix = expenseItem.expenseType && expenseItem.expenseType.travel ? expenseItem.expenseType.name + ' - ' : '';
        return prefix + expenseItem.description;
      };

      function expenseItemDescription(expenseItem) {
        var description;
        if (!expenseItem) return '';
        if (expenseItem.travel && expenseItem.expenseType.travel) {
          description = [
            expenseItem.travel.from,
            'to',
            expenseItem.travel.to,
            expenseItem.travel.returnJourney ? 'return trip' : 'single trip',
            '(' + expenseItem.travel.miles,
            'miles',
            expenseItem.travel.returnJourney ? 'x 2' : '',
            'x',
            parseInt(expenseItem.travel.costPerMile * 100) + 'p per mile)'
          ].join(' ');
        } else {
          description = expenseItem.description;
        }
        return description;
      }

      function expenseItemCost(expenseItem) {
        var cost;
        if (!expenseItem) return 0;
        if (expenseItem.travel && expenseItem.expenseType.travel) {
          cost = (NumberUtils.asNumber(expenseItem.travel.miles) *
            (expenseItem.travel.returnJourney ? 2 : 1) *
            NumberUtils.asNumber(expenseItem.travel.costPerMile));
        }
        else {
          cost = expenseItem.cost;
        }
        noLogger.info(cost, 'from expenseItem=', expenseItem);
        return NumberUtils.asNumber(cost, 2);
      }

      function refreshMembers() {
        if (LoggedInMemberService.memberLoggedIn()) {
          notify.progress('Refreshing member data...');
          return MemberService.allLimitedFields(MemberService.filterFor.GROUP_MEMBERS).then(function (members) {
            logger.debug('refreshMembers: found', members.length, 'members');
            return $scope.members = members;
          });
        }
      }

      function memberCanEditClaim(expenseClaim) {
        if (!expenseClaim) return false;
        return memberOwnsClaim(expenseClaim) || LoggedInMemberService.allowFinanceAdmin();
      }

      function memberOwnsClaim(expenseClaim) {
        if (!expenseClaim) return false;
        return (LoggedInMemberService.loggedInMember().memberId === $scope.expenseClaimCreatedEvent(expenseClaim).memberId);
      }

      $scope.refreshExpenses = function () {
        $scope.dataError = false;
        logger.debug('refreshExpenses started');
        notify.setBusy();
        notify.progress('Filtering for ' + $scope.selected.expenseFilter.description + '...');
        logger.debug('refreshing expenseFilter', $scope.selected.expenseFilter);

        let noExpenseFound = function () {
          $scope.dataError = true;
          return notify.warning({
            title: 'Expense claim could not be found',
            message: 'Try opening again from the link in the notification email, or click Show All Expense Claims'
          })
        };

        function query() {
          if ($scope.selected.expenseFilter.description === SELECTED_EXPENSE && $routeParams.expenseId) {
            return ExpenseClaimsService.getById($routeParams.expenseId)
              .then(function (expense) {
                if (!expense) {
                  return noExpenseFound();
                } else {
                  return [expense];
                }
              })
              .catch(noExpenseFound);
          } else {
            return ExpenseClaimsService.all();
          }
        }

        return query()
          .then(function (expenseClaims) {
            $scope.unfilteredExpenseClaims = [];
            $scope.expenseClaims = _.chain(expenseClaims).filter(function (expenseClaim) {
              return $scope.allowAdminFunctions() ? ($scope.selected.showOnlyMine ? memberOwnsClaim(expenseClaim) : true) : memberCanEditClaim(expenseClaim);
            }).filter(function (expenseClaim) {
              $scope.unfilteredExpenseClaims.push(expenseClaim);
              return $scope.selected.expenseFilter.filter(expenseClaim);
            }).sortBy(function (expenseClaim) {
              var expenseClaimLatestEvent = $scope.expenseClaimLatestEvent(expenseClaim);
              return expenseClaimLatestEvent ? expenseClaimLatestEvent.date : true;
            }).reverse().value();
            let outcome = 'Found ' + $scope.expenseClaims.length + ' expense claim(s)';
            notify.progress(outcome);
            logger.debug('refreshExpenses finished', outcome);
            notify.clearBusy();
            return $scope.expenseClaims;
          }, notify.error)
          .catch(notify.error);
      };

      $q.when(refreshMembers())
        .then($scope.refreshExpenses)
        .then(notify.setReady)
        .catch(notify.error);

    }
  );
