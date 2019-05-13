angular.module('ekwgApp')
  .controller('WalkSlotsController', function ($rootScope, $log, $scope, $filter, $q, WalksService, WalksQueryService, WalksReferenceService, WalkNotificationService, LoggedInMemberService, DateUtils, Notifier) {

      var logger = $log.getInstance('WalkSlotsController');
      $log.logLevels['WalkSlotsController'] = $log.LEVEL.OFF;

      $scope.slotsAlert = {};
      $scope.todayValue = DateUtils.momentNowNoTime().valueOf();

      $scope.slot = {
        open: function ($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.slot.opened = true;
        },
        validDate: function (date) {
          return DateUtils.isDate(date);
        },
        until: DateUtils.momentNowNoTime().day(7 * 12).valueOf(),
        bulk: true
      };
      var notify = Notifier($scope.slotsAlert);

      function createSlots(requiredSlots, confirmAction, prompt) {
        $scope.requiredWalkSlots = requiredSlots.map(function (date) {
          var walk = new WalksService({
            walkDate: date
          });
          walk.events = [WalkNotificationService.createEventIfRequired(walk, WalksReferenceService.eventTypes.awaitingLeader.eventType, 'Walk slot created')];
          return walk;
        });
        logger.debug('$scope.requiredWalkSlots', $scope.requiredWalkSlots);
        if ($scope.requiredWalkSlots.length > 0) {
          $scope.confirmAction = confirmAction;
          notify.warning(prompt)
        } else {
          notify.error({title: "Nothing to do!", message: "All slots are already created between today and " + $filter('displayDate')($scope.slot.until)});
          delete $scope.confirmAction;
        }

      }

      $scope.addWalkSlots = function () {
        WalksService.query({walkDate: {$gte: $scope.todayValue}}, {fields: {events: 1, walkDate: 1}, sort: {walkDate: 1}})
          .then(function (walks) {
            var sunday = DateUtils.momentNowNoTime().day(7);
            var untilDate = DateUtils.asMoment($scope.slot.until).startOf('day');
            var weeks = untilDate.clone().diff(sunday, 'weeks');
            var allGeneratedSlots = _.times(weeks, function (index) {
              return DateUtils.asValueNoTime(sunday.clone().add(index, 'week'));
            }).filter(function (date) {
              return DateUtils.asString(date, undefined, 'DD-MMM') !== '25-Dec';
            });
            var existingDates = _.pluck(WalksQueryService.activeWalks(walks), 'walkDate');
            logger.debug('sunday', sunday, 'untilDate', untilDate, 'weeks', weeks);
            logger.debug('existingDatesAsDates', _(existingDates).map($filter('displayDateAndTime')));
            logger.debug('allGeneratedSlotsAsDates', _(allGeneratedSlots).map($filter('displayDateAndTime')));
            var requiredSlots = _.difference(allGeneratedSlots, existingDates);
            var requiredDates = $filter('displayDates')(requiredSlots);
            createSlots(requiredSlots, {addSlots: true}, {
              title: "Add walk slots",
              message: " - You are about to add " + requiredSlots.length + " empty walk slots up to " + $filter('displayDate')($scope.slot.until) + '. Slots are: ' + requiredDates
            });
          });
      };

      $scope.addWalkSlot = function () {
        createSlots([DateUtils.asValueNoTime($scope.slot.single)], {addSlot: true}, {
          title: "Add walk slots",
          message: " - You are about to add 1 empty walk slot for " + $filter('displayDate')($scope.slot.single)
        });
      };

      $scope.selectBulk = function (bulk) {
        $scope.slot.bulk = bulk;
        delete $scope.confirmAction;
        notify.hide();
      };

      $scope.allow = {
        addSlot: function () {
          return !$scope.confirmAction && !$scope.slot.bulk && LoggedInMemberService.allowWalkAdminEdits();
        },
        addSlots: function () {
          return !$scope.confirmAction && $scope.slot.bulk && LoggedInMemberService.allowWalkAdminEdits();
        },
        close: function () {
          return !$scope.confirmAction;
        }
      };

      $scope.cancelConfirmableAction = function () {
        delete $scope.confirmAction;
        notify.hide();
      };

      $scope.confirmAddWalkSlots = function () {
        notify.success({title: "Add walk slots - ", message: "now creating " + $scope.requiredWalkSlots.length + " empty walk slots up to " + $filter('displayDate')($scope.slot.until)});
        $q.all($scope.requiredWalkSlots.map(function (slot) {
          return slot.$saveOrUpdate();
        })).then(function () {
          notify.success({title: "Done!", message: "Choose Close to see your newly created slots"});
          delete $scope.confirmAction;
        });
      };

      $scope.$on('addWalkSlotsDialogOpen', function () {
        $('#add-slots-dialog').modal();
        delete $scope.confirmAction;
        notify.hide();
      });

      $scope.closeWalkSlotsDialog = function () {
        $('#add-slots-dialog').modal('hide');
        $rootScope.$broadcast('walkSlotsCreated');
      };

    }
  );
