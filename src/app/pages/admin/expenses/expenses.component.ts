import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { clone, filter, find, isEqual, last } from "lodash-es";
import { BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { chain } from "../../../functions/chain";
import { AlertTarget } from "../../../models/alert-target.model";
import { ExpenseClaim, ExpenseEvent, ExpenseItem } from "../../../models/expense.model";
import { Member } from "../../../models/member.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { FullNameWithAliasPipe } from "../../../pipes/full-name-with-alias.pipe";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { ExpenseClaimService } from "../../../services/expenses/expense-claim.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpConfigService } from "../../../services/mailchimp-config.service";
import { MailchimpListUpdaterService } from "../../../services/mailchimp/mailchimp-list-updater.service";
import { MemberBulkLoadService } from "../../../services/member/member-bulk-load.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { NumberUtilsService } from "../../../services/number-utils.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { ExpenseDisplayService } from "./expense-display.service";
import { ExpenseDetailModalComponent } from "./modals/expense-detail-modal.component";

const SELECTED_EXPENSE = "Expense from last email link";

@Component({
  selector: "app-expenses",
  templateUrl: "./expenses.component.html",
  styleUrls: ["./expenses.component.sass"]
})
export class ExpensesComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private receiptBaseUrl: string;
  private dataError: boolean;
  private members: Member[];
  private expenseClaims: ExpenseClaim[];
  private unfilteredExpenseClaims: any[];
  private filterTypes: (
    { filter: (expenseClaim) => (boolean); description: string; disabled: boolean } |
    { filter: (expenseClaim) => boolean; description: string } |
    { filter: (expenseClaim) => any; description: string } |
    { filter: () => boolean; description: string })[];
  private notificationsBaseUrl: string;

  private selected: {
    expenseClaim: ExpenseClaim,
    expenseItem: ExpenseItem,
    expenseFilter: { filter: (expenseClaim) => (boolean); description: string; disabled: boolean } | { filter: (expenseClaim) => boolean; description: string } | { filter: (expenseClaim) => any; description: string } | { filter: () => boolean; description: string }; expenseItemIndex: number; saveInProgress: boolean; expenseClaimIndex: number; showOnlyMine: boolean
  };
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private selectedExpenseClaimIndex: 0;
  private selectedExpenseItemIndex: 0;
  private resubmit: boolean;
  private uploadedFile: string;
  public confirm = new Confirm();
  private expenseId: string;
  private subscription: Subscription;
  private saveInProgress: boolean;

  constructor(@Inject("MailchimpListService") private mailchimpListService,
              @Inject("MailchimpSegmentService") private mailchimpSegmentService,
              @Inject("MailchimpCampaignService") private mailchimpCampaignService,
              private contentMetadata: ContentMetadataService,
              private memberBulkUploadService: MemberBulkLoadService,
              private memberService: MemberService,
              private searchFilterPipe: SearchFilterPipe,
              private mailchimpConfig: MailchimpConfigService,
              private expenseClaimService: ExpenseClaimService,
              private fullNameWithAliasPipe: FullNameWithAliasPipe,
              private notifierService: NotifierService,
              private modalService: BsModalService,
              private dateUtils: DateUtilsService,
              private mailchimpListUpdaterService: MailchimpListUpdaterService,
              private urlService: UrlService,
              private emailSubscriptionService: EmailSubscriptionService,
              private numberUtils: NumberUtilsService,
              private stringUtils: StringUtilsService,
              private authService: AuthService,
              private broadcastService: BroadcastService,
              private memberLoginService: MemberLoginService,
              private route: ActivatedRoute,
              public display: ExpenseDisplayService,
              loggerFactory: LoggerFactory) {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logger = loggerFactory.createLogger(ExpensesComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.subscription = this.authService.authResponse().subscribe((loginResponse) => {
    });
    this.dataError = false;
    this.members = [];
    this.expenseClaims = [];
    this.unfilteredExpenseClaims = [];
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.expenseId = paramMap.get("expense-id");
      this.logger.info("expense-id:", this.expenseId);
      this.filterTypes = [{
        disabled: !this.expenseId,
        description: SELECTED_EXPENSE,
        filter: expenseClaim => {
          if (this.expenseId) {
            return expenseClaim && expenseClaim.id === this.expenseId;
          } else {
            return false;
          }
        }
      }, {
        description: "Unpaid expenses",
        filter: expenseClaim => !this.display.expenseClaimStatus(expenseClaim).atEndpoint
      }, {
        description: "Paid expenses",
        filter: expenseClaim => this.display.expenseClaimStatus(expenseClaim).atEndpoint
      }, {
        description: "Expenses awaiting action from me",
        filter: expenseClaim => this.memberLoginService.allowFinanceAdmin() ? this.display.editable(expenseClaim) : this.display.editableAndOwned(expenseClaim)
      }, {
        description: "All expenses",
        filter: () => true
      }];
      this.selected = {
        expenseClaim: undefined,
        expenseItem: undefined,
        showOnlyMine: !this.display.allowAdminFunctions(),
        saveInProgress: false,
        expenseClaimIndex: 0,
        expenseItemIndex: 0,
        expenseFilter: this.filterTypes[this.expenseId ? 0 : 1]
      };
    });

    this.notificationsBaseUrl = "partials/expenses/notifications";

    this.memberLoginService.showLoginPromptWithRouteParameter("expenseId");
    this.refreshMembers()
      .then(() => this.refreshExpenses())
      .then(() => this.notify.setReady())
      .catch((error) => this.notify.error(error));

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  defaultExpenseClaim(): ExpenseClaim {
    return clone({
      cost: 0,
      expenseItems: [],
      expenseEvents: []
    });
  }

  showArea(area) {
    this.urlService.navigateTo("admin", area);
  }

  activeEvents(optionalEvents?: ExpenseEvent[]) {
    const events = optionalEvents || this.selected.expenseClaim.expenseEvents;
    const latestReturnedEvent = find(events.reverse(), event => isEqual(event.eventType, this.display.expenseClaimStatus(this.selected.expenseClaim).returned));
    return latestReturnedEvent ? events.slice(events.indexOf(latestReturnedEvent) + 1) : events;
  }

  allowApproveExpenseClaim() {
    return false;
  }

  lastApprovedByMe() {
    const approvalEvents = this.approvalEvents();
    return approvalEvents.length > 0 && last(approvalEvents).memberId === this.memberLoginService.loggedInMember().memberId;
  }

  approvalEvents() {
    if (!this.selected.expenseClaim) {
      return [];
    }
    return filter(this.selected.expenseClaim.expenseEvents, event => isEqual(event.eventType, this.display.eventTypes["first-approval"]) || isEqual(event.eventType, this.display.eventTypes["second-approval"]));
  }

  nextApprovalStage() {
    const approvals = this.approvalEvents();
    if (approvals.length === 0) {
      return "First Approval";
    } else if (approvals.length === 1) {
      return "Second Approval";
    } else {
      return "Already has " + approvals.length + " approvals!";
    }
  }

  confirmApproveExpenseClaim() {
    const approvals = this.approvalEvents();
    this.notify.hide();
    if (approvals.length === 0) {
      this.createEventAndSendNotifications(this.display.eventTypes["first-approval"]);
    } else if (approvals.length === 1) {
      this.createEventAndSendNotifications(this.display.eventTypes["second-approval"]);
    } else {
      this.notify.error("This expense claim already has " + approvals.length + " approvals!");
    }
  }

  showAllExpenseClaims() {
    this.dataError = false;
    this.urlService.navigateTo("/admin/expenses");
  }

  addExpenseClaim() {
    this.selectExpenseClaim(this.defaultExpenseClaim());
    this.createEvent(this.display.eventTypes.created);
    this.addExpenseItem();
  }

  selectExpenseItem(expenseItem: ExpenseItem) {
    if (this.saveInProgress) {
    } else {
      this.selected.expenseItem = expenseItem;
    }
  }

  selectExpenseClaim(expenseClaim: ExpenseClaim) {
    if (this.saveInProgress) {
      this.selected.expenseClaim = expenseClaim;
    }
  }

  confirmOutstanding() {
    return this.confirm.type !== ConfirmType.NONE;
  }

  private removeConfirm() {
    this.confirm.type = ConfirmType.NONE;
  }

  editExpenseItem() {
    this.removeConfirm();
    delete this.uploadedFile;
    const config = {
      class: "modal-lg",
      show: true,
      initialState: {
        expenseItem: this.selected.expenseItem, expenseClaim: this.selected.expenseClaim
      }
    };
    this.modalService.show(ExpenseDetailModalComponent, {});
  }

  hideExpenseClaim() {
    this.removeConfirm();
    // $("#expense-detail-dialog").modal("hide");
  }

  ekwgFileUpload() {
    return {onFileSelect: (...anything) => Promise.resolve(this.defaultExpenseClaim())};
  }

  onFileSelect(file, receipt) {
    if (file) {
      this.uploadedFile = file;
      this.ekwgFileUpload().onFileSelect(file, this.notify, "expenseClaims")
        .then(fileNameData => {
          const expenseItem = this.selected.expenseClaim;
          // const oldTitle = (expenseItem.receipt && expenseItem.receipt.title) ? receipt.title : undefined;
          // expenseItem.receipt = {fileNameData, title: oldTitle};
        });
    }
  }

  createEvent(eventType, reason?: string) {
    const expenseClaim = this.selected.expenseClaim;
    if (!expenseClaim.expenseEvents) {
      expenseClaim.expenseEvents = [];
    }
    const event: ExpenseEvent = {
      date: this.dateUtils.nowAsValue(),
      memberId: this.memberLoginService.loggedInMember().memberId,
      eventType
    };
    if (reason) {
      event.reason = reason;
    }
    expenseClaim.expenseEvents.push(event);
  }

  addExpenseItem() {
    this.removeConfirm();
    const newExpenseItem = this.display.defaultExpenseItem();
    this.selected.expenseClaim.expenseItems.push(newExpenseItem);
    this.selectExpenseItem(newExpenseItem);
    this.editExpenseItem();
  }

  allowClearError() {
    return this.urlService.hasRouteParameter("expenseId") && this.dataError;
  }

  allowReturnExpenseClaim() {
    return this.display.allowAdminFunctions()
      && this.selected.expenseClaim
      && this.display.expenseClaimHasEventType(this.selected.expenseClaim, this.display.eventTypes.submitted)
      && !this.display.expenseClaimHasEventType(this.selected.expenseClaim, this.display.eventTypes.returned)
      && this.display.expenseClaimStatus(this.selected.expenseClaim).actionable;
  }

  showExpenseSuccessAlert(message?: string, busy?: boolean) {
    this.notify.success(message, busy);
  }

  approveExpenseClaim() {
    this.confirm.type = ConfirmType.APPROVE;
    if (this.lastApprovedByMe()) {
      this.notify.warning({
        title: "Duplicate approval warning",
        message: "You were the previous approver, therefore " + this.nextApprovalStage() + " ought to be carried out by someone else. Are you sure you want to do this?"
      });
    }
  }

  allowResubmitExpenseClaim() {
    return this.display.editable(this.selected.expenseClaim) && this.display.expenseClaimHasEventType(this.selected.expenseClaim, this.display.eventTypes.returned);
  }

  allowPaidExpenseClaim() {
    return this.memberLoginService.allowTreasuryAdmin() && [this.display.eventTypes.submitted.description, this.display.eventTypes["second-approval"].description, this.display.eventTypes["first-approval"].description]
      .includes(this.display.expenseClaimLatestEvent(this.selected.expenseClaim).eventType.description);
  }

  deleteExpenseClaim() {
    this.confirm.type = ConfirmType.DELETE;
  }

  eventTracker(index: number, event: ExpenseEvent) {
    return event.date && event.eventType;
  }

  itemTracker(index: number, item: ExpenseItem) {
    return item.expenseDate && item.expenseType;
  }

  showExpenseDeleted() {
    return this.showExpenseSuccessAlert("Expense was deleted successfully");
  }

  confirmDeleteExpenseClaim() {
    this.showExpenseProgressAlert("Deleting expense claim", true);

    this.expenseClaimService.delete(this.selected.expenseClaim)
      .then(() => this.hideExpenseClaim())
      .then(() => this.showExpenseDeleted())
      .then(() => this.refreshExpenses())
      .then(() => this.removeConfirm())
      .then(() => this.notify.clearBusy());
  }

  submitExpenseClaim(state: boolean) {
    this.resubmit = state;
    // $("#submit-dialog").modal("show");
  }

  hideSubmitDialog() {
    // $("#submit-dialog").modal("hide");
    this.resubmit = false;
  }

  cancelSubmitExpenseClaim() {
    this.hideSubmitDialog();
  }

  returnExpenseClaim() {
    // $("#return-dialog").modal("show");
  }

  allowSubmitExpenseClaim(expenseClaim: ExpenseClaim) {
    return this.display.allowEditExpenseItem(expenseClaim) && !this.allowResubmitExpenseClaim();
  }

  confirmReturnExpenseClaim(reason) {
    this.hideReturnDialog();
    return this.createEventAndSendNotifications(this.display.eventTypes.returned, reason);
  }

  hideReturnDialog() {
    // $("#return-dialog").modal("hide");
  }

  cancelReturnExpenseClaim() {
    this.hideReturnDialog();
  }

  paidExpenseClaim() {
    // $("#paid-dialog").modal("show");
  }

  confirmPaidExpenseClaim() {
    this.createEventAndSendNotifications(this.display.eventTypes.paid)
      .then(() => this.hidePaidDialog());
  }

  hidePaidDialog() {
    // $("#paid-dialog").modal("hide");
  }

  cancelPaidExpenseClaim() {
    this.hidePaidDialog();
  }

  confirmSubmitExpenseClaim() {
    if (this.resubmit) {
      this.selected.expenseClaim.expenseEvents = [this.display.eventForEventType(this.selected.expenseClaim, this.display.eventTypes.created)];
    }
    this.createEventAndSendNotifications(this.display.eventTypes.submitted);
  }

  resubmitExpenseClaim() {
    this.submitExpenseClaim(true);
  }

  createEventAndSendNotifications(eventType, reason?: string) {
    this.notify.setBusy();
    this.saveInProgress = true;
    const expenseClaimCreatedEvent = this.display.expenseClaimCreatedEvent(this.selected.expenseClaim);
    const sendNotificationsToAllRoles = () => {
      return this.memberService.getById(expenseClaimCreatedEvent.memberId)
        .then(member => {
          this.logger.debug("sendNotification:", "memberId", expenseClaimCreatedEvent.memberId, "member", member);
          const memberFullName = this.fullNameWithAliasPipe.transform(member);
          return Promise.resolve(this.showExpenseProgressAlert("Preparing to email " + memberFullName))
            .then(() => this.hideSubmitDialog())
            .then(() => sendCreatorNotifications())
            .then(() => sendApproverNotifications())
            .then(() => sendTreasurerNotifications());

          const sendCreatorNotifications = () => {
            if (eventType.notifyCreator) {
              return sendNotificationsTo({
                templateUrl: templateForEvent("creator", eventType),
                memberIds: [expenseClaimCreatedEvent.memberId],
                segmentType: "directMail",
                segmentNameSuffix: "",
                destination: "creator"
              });
            }
            return false;
          };

          const sendApproverNotifications = () => {
            if (eventType.notifyApprover) {
              return sendNotificationsTo({
                templateUrl: templateForEvent("approver", eventType),
                memberIds: this.memberService.allMemberIdsWithPrivilege("financeAdmin", this.members),
                segmentType: "expenseApprover",
                segmentNameSuffix: "approval ",
                destination: "approvers"
              });
            }
            return Promise.resolve(false);
          };

          const sendTreasurerNotifications = () => {
            if (eventType.notifyTreasurer) {
              return sendNotificationsTo({
                templateUrl: templateForEvent("treasurer", eventType),
                memberIds: this.memberService.allMemberIdsWithPrivilege("treasuryAdmin", this.members),
                segmentType: "expenseTreasurer",
                segmentNameSuffix: "payment ",
                destination: "treasurer"
              });
            }
            return false;
          };

          const templateForEvent = (role, eventType) => {
            return this.notificationsBaseUrl + "/" + role + "/" + eventType.description.toLowerCase().replace(" ", "-") + "-notification.html";
          };

          const sendNotificationsTo = (templateAndNotificationMembers) => {
            this.logger.debug("sendNotificationsTo:", templateAndNotificationMembers);
            const campaignName = "Expense " + eventType.description + " notification (to " + templateAndNotificationMembers.destination + ")";
            const campaignNameAndMember = campaignName + " (" + memberFullName + ")";
            const segmentName = "Expense notification " + templateAndNotificationMembers.segmentNameSuffix + "(" + memberFullName + ")";
            if (templateAndNotificationMembers.memberIds.length === 0) {
              throw new Error("No members have been configured as " + templateAndNotificationMembers.destination + " therefore notifications for this step will fail!!");
            }
            return Promise.resolve(templateAndNotificationMembers.templateUrl)
              .then((templateData) => renderTemplateContent(templateData))
              .then((expenseNotificationText) => populateContentSections(expenseNotificationText))
              .then((contentSections) => sendNotification(contentSections, templateAndNotificationMembers))
              .catch((error) => this.display.showExpenseEmailErrorAlert(this.notify, error));

            const populateContentSections = (expenseNotificationText) => {
              return {
                sections: {
                  expense_id_url: `Please click <a href="${this.urlService.baseUrl()}/admin/expenseId/${this.selected.expenseClaim.id}" target="_blank">this link</a> to see the details of the above expense claim, or to make changes to it.`,
                  expense_notification_text: expenseNotificationText
                }
              };
            };

            const sendNotification = (contentSections, templateAndNotificationMembers) => {
              const createOrSaveMailchimpSegment = () => {
                return this.mailchimpSegmentService.saveSegment("general", {segmentId: this.mailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType)}, templateAndNotificationMembers.memberIds, segmentName, this.members);
              };

              const saveSegmentDataToMember = (segmentResponse) => {
                this.mailchimpSegmentService.setMemberSegmentId(member, templateAndNotificationMembers.segmentType, segmentResponse.segment.id);
                return this.memberService.update(member);
              };

              const sendEmailCampaign = () => {
                this.showExpenseProgressAlert("Sending " + campaignNameAndMember);
                return this.mailchimpConfig.getConfig()
                  .then(config => {
                    const campaignId = config.mailchimp.campaigns.expenseNotification.campaignId;
                    const segmentId = this.mailchimpSegmentService.getMemberSegmentId(member, templateAndNotificationMembers.segmentType);
                    this.logger.debug("about to replicateAndSendWithOptions with campaignName", campaignNameAndMember, "campaign Id", campaignId, "segmentId", segmentId);
                    return this.mailchimpCampaignService.replicateAndSendWithOptions({
                      campaignId,
                      campaignName: campaignNameAndMember,
                      contentSections,
                      segmentId
                    });
                  })
                  .then(() => {
                    this.showExpenseProgressAlert("Sending of " + campaignNameAndMember + " was successful", true);
                  });
              };

              return createOrSaveMailchimpSegment()
                .then((segmentResponse) => saveSegmentDataToMember(segmentResponse))
                .then(() => sendEmailCampaign())
                .then(() => notifyEmailSendComplete());

              const notifyEmailSendComplete = () => {
                this.showExpenseSuccessAlert("Sending of " + campaignName + " was successful. Check your inbox for progress.");
              };
            };
          };
        });
    };

    return Promise.resolve(this.createEvent(eventType, reason))
      .then(() => sendNotificationsToAllRoles())
      .then(() => (() => this.expenseClaimService.createOrUpdate(this.selected.expenseClaim)));

    const renderTemplateContent = (templateData) => {
      // const task = new Promise();
      // const templateFunction = $compile(templateData);
      // const templateElement = templateFunction($scope);
      // $timeout(() => {
      //   this.$digest();
      //   task.resolve();
      // });
      return Promise.resolve("templateElement.html()");
    };

  }

  refreshMembers() {
    if (this.memberLoginService.memberLoggedIn()) {
      this.notify.progress("Refreshing member data...");
      return this.memberService.allLimitedFields(this.memberService.filterFor.GROUP_MEMBERS).then(members => {
        this.logger.debug("refreshMembers: found", members.length, "members");
        return this.members = members;
      });
    }
  }

  refreshExpenses() {
    this.dataError = false;
    this.notify.setBusy();
    this.logger.debug("refreshExpenses started");
    this.notify.progress("Filtering for " + this.selected.expenseFilter.description + "...");
    this.logger.debug("refreshing expenseFilter", this.selected.expenseFilter);

    const noExpenseFound = () => {
      this.dataError = true;
      return this.notify.warning({
        title: "Expense claim could not be found",
        message: "Try opening again from the link in the notification email, or click Show All Expense Claims"
      });
    };

    const query = () => {
      this.logger.info("expenseFilter.description", this.selected.expenseFilter.description, "expenseId", this.expenseId);
      if (this.selected.expenseFilter.description === SELECTED_EXPENSE && this.expenseId) {
        return this.expenseClaimService.getById(this.expenseId)
          .then(expense => {
            if (!expense) {
              return noExpenseFound();
            } else {
              return [expense];
            }
          })
          .catch(noExpenseFound);
      } else {
        return this.expenseClaimService.all();
      }
    };

    return query()
      .then(expenseClaims => {
        this.unfilteredExpenseClaims = [];
        this.expenseClaims = chain(expenseClaims).filter(expenseClaim => this.display.allowAdminFunctions() ? (this.selected.showOnlyMine ? this.display.memberOwnsClaim(expenseClaim) : true) : this.display.memberCanEditClaim(expenseClaim)).filter(expenseClaim => {
          this.unfilteredExpenseClaims.push(expenseClaim);
          return this.selected.expenseFilter.filter(expenseClaim);
        }).sortBy(expenseClaim => {
          const expenseClaimLatestEvent = this.display.expenseClaimLatestEvent(expenseClaim);
          return expenseClaimLatestEvent ? expenseClaimLatestEvent.date : true;
        }).value().reverse().value();
        const outcome = "Found " + this.expenseClaims.length + " expense claim(s)";
        this.notify.progress(outcome);
        this.logger.debug("refreshExpenses finished", outcome);
        this.notify.clearBusy();
        return this.expenseClaims;
      }, (error) => this.notify.error(error))
      .catch((error) => this.notify.error(error));
  }

  private showExpenseProgressAlert(message: string, busy?: boolean) {
    this.notify.progress({title: "Expenses", message}, busy);
  }

  allowAddExpenseClaim() {
    return !this.dataError && !find(this.unfilteredExpenseClaims, this.display.editableAndOwned);
  }

  cancelDeleteExpenseClaim() {

  }

  isInactive(expenseClaim: ExpenseClaim) {
    return expenseClaim !== this.selected.expenseClaim;
  }

}
