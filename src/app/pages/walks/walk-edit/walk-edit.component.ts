import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { clone, find, isEmpty, pick } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { Member } from "../../../models/member.model";
import { DisplayedWalk } from "../../../models/walk-displayed.model";
import { WalkEventType } from "../../../models/walk-event-type.model";
import { WalkEvent } from "../../../models/walk-event.model";
import { Walk } from "../../../models/walk.model";
import { ChangedItemsPipe } from "../../../pipes/changed-items.pipe";
import { DisplayDateAndTimePipe } from "../../../pipes/display-date-and-time.pipe";
import { DisplayDatePipe } from "../../../pipes/display-date.pipe";
import { EventNotePipe } from "../../../pipes/event-note.pipe";
import { FullNameWithAliasOrMePipe } from "../../../pipes/full-name-with-alias-or-me.pipe";
import { FullNamePipe } from "../../../pipes/full-name.pipe";
import { MemberIdToFullNamePipe } from "../../../pipes/member-id-to-full-name.pipe";
import { CommitteeReferenceDataService } from "../../../services/committee-reference-data.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { EventType, WalksReferenceService } from "../../../services/walks-reference-data.service";
import { ConfirmType, MeetupEvent, WalkDisplayService, WalkViewMode } from "../walk-display.service";

interface DisplayMember {
  memberId: string;
  name: string;
}

@Component({
  selector: "app-walk-edit",
  templateUrl: "./walk-edit.component.html",
  styleUrls: ["./walk-edit.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalkEditComponent implements OnInit {

  @Input()
  public displayedWalk: DisplayedWalk;
  @Input()
  public listcdr: ChangeDetectorRef;

  public confirmAction: ConfirmType = ConfirmType.NONE;
  public googleMapsUrl: SafeResourceUrl;
  public walkDate: Date;
  private currentStatus: EventType;
  private priorStatus: EventType;
  protected logger: Logger;
  public notifyTarget: AlertTarget = {};
  protected notify: AlertInstance;
  private meetupEvent: {
    url: string;
    title: string;
  };
  public saveInProgress = false;
  public sendNotifications = false;
  public longerDescriptionPreview: boolean;

  constructor(
    @Inject("WalksService") protected walksService,
    @Inject("WalkNotificationService") private walkNotificationService,
    @Inject("LoggedInMemberService") private loggedInMemberService,
    @Inject("RamblersWalksAndEventsService") private ramblersWalksAndEventsService,
    public route: ActivatedRoute,
    private committeeReferenceData: CommitteeReferenceDataService,
    private walksReferenceService: WalksReferenceService,
    private memberIdToFullNamePipe: MemberIdToFullNamePipe,
    private displayDateAndTime: DisplayDateAndTimePipe,
    private fullNamePipe: FullNamePipe,
    private fullNameWithAliasOrMePipe: FullNameWithAliasOrMePipe,
    private eventNotePipe: EventNotePipe,
    private changedItemsPipe: ChangedItemsPipe,
    protected dateUtils: DateUtilsService,
    public display: WalkDisplayService,
    private displayDate: DisplayDatePipe,
    protected notifierService: NotifierService,
    private cdr: ChangeDetectorRef,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkEditComponent, NgxLoggerLevel.INFO);
  }

  copySource = "copy-selected-walk-leader";
  copySourceFromWalkLeaderMemberId: undefined;
  private copyFrom: any = {};

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.copyFrom = {walkTemplate: {}, walkTemplates: [] as Walk[]};
    this.showWalk(this.displayedWalk);
    this.logDetectChanges();
    setInterval(() => {
      if (this.saveInProgress) {
        this.logDetectChanges();
      }
    }, 3000);
  }

  dataHasChanged() {
    const dataAuditDelta = this.walkNotificationService.dataAuditDelta(this.displayedWalk.walk, this.status());
    this.logger.debug("dataHasChanged:", dataAuditDelta.notificationRequired);
    return dataAuditDelta.notificationRequired;
  }

  allowEdits() {
    return this.confirmAction === ConfirmType.NONE && (this.allowAdminEdits() ||
      this.display.loggedInMemberIsLeadingWalk(this.displayedWalk.walk));
  }

  allowSave() {
    return this.allowEdits() && this.dataHasChanged();
  }

  allowClose() {
    return !this.saveInProgress && this.confirmAction === ConfirmType.NONE && !this.allowSave();
  }

  allowCancel() {
    return !this.saveInProgress && this.allowEdits() && this.dataHasChanged();
  }

  status(): EventType {
    return this.currentStatus;
  }

  allowDelete() {
    return !this.saveInProgress && this.confirmAction === ConfirmType.NONE && this.loggedInMemberService.allowWalkAdminEdits()
      && this.displayedWalk.walkEditMode && this.displayedWalk.walkEditMode.editEnabled;
  }

  allowNotifyConfirmation() {
    return (this.allowSave() || this.confirmAction === ConfirmType.DELETE) && this.displayedWalk.walk.walkLeaderMemberId;
  }

  allowHistoryView() {
    return this.display.loggedInMemberIsLeadingWalk(this.displayedWalk.walk) || this.allowAdminEdits();
  }

  allowDetailView() {
    return this.loggedInMemberService.memberLoggedIn();
  }

  allowApprove() {
    return this.confirmAction === ConfirmType.NONE && this.loggedInMemberService.allowWalkAdminEdits() &&
      this.latestEventWithStatusChangeIs(EventType.AWAITING_APPROVAL);
  }

  allowContactOther() {
    return false;
  }

  allowRequestApproval() {
    return this.confirmAction === ConfirmType.NONE && this.ownedAndAwaitingWalkDetails();
  }

  allowAdminEdits() {
    return this.loggedInMemberService.allowWalkAdminEdits();
  }

  pendingCancel() {
    return this.confirmAction === ConfirmType.CANCEL;
  }

  pendingDelete() {
    return this.confirmAction === ConfirmType.DELETE;
  }

  pendingRequestApproval() {
    return this.confirmAction === ConfirmType.REQUEST_APPROVAL;
  }

  pendingContactOther() {
    return this.confirmAction === ConfirmType.CONTACT_OTHER;
  }

  pendingConfirmation() {
    return this.confirmAction !== ConfirmType.NONE;
  }

  latestEventWithStatusChangeIs(eventType) {
    return this.walkNotificationService.latestEventWithStatusChangeIs(this.displayedWalk.walk, eventType);
  }

  ownedAndAwaitingWalkDetails() {
    return this.display.loggedInMemberIsLeadingWalk(this.displayedWalk.walk) && this.status() === EventType.AWAITING_WALK_DETAILS;
  }

  setWalkLeaderToMe() {
    this.displayedWalk.walk.walkLeaderMemberId = this.loggedInMemberService.loggedInMember().memberId;
    this.walkLeaderMemberIdChanged();
  }

  walkLeaderMemberIdChanged() {
    this.notify.hide();
    this.populateCopySourceFromWalkLeaderMemberId();
    const memberId = this.displayedWalk.walk.walkLeaderMemberId;
    if (!memberId) {
      this.setStatus(EventType.AWAITING_LEADER);
      delete this.displayedWalk.walk.walkLeaderMemberId;
      delete this.displayedWalk.walk.contactId;
      delete this.displayedWalk.walk.displayName;
      delete this.displayedWalk.walk.contactPhone;
      delete this.displayedWalk.walk.contactEmail;
    } else {
      const selectedMember: Member = this.display.members.find((member: Member) => {
        return member.$id() === memberId;
      });
      if (selectedMember) {
        this.setStatus(EventType.AWAITING_WALK_DETAILS);
        this.displayedWalk.walk.contactId = selectedMember.contactId;
        this.displayedWalk.walk.displayName = selectedMember.displayName;
        this.displayedWalk.walk.contactPhone = selectedMember.mobileNumber;
        this.displayedWalk.walk.contactEmail = selectedMember.email;
        this.populateWalkTemplates(memberId);
      }
    }
  }

  showWalk(displayedWalk: DisplayedWalk) {
    if (!displayedWalk) {
      this.displayedWalk = {
        walkEditMode: this.walksReferenceService.walkEditModes.add,
        latestEventType: null,
        walk: new this.walksService({
          status: EventType.AWAITING_LEADER,
          walkType: this.display.walkTypes[0],
          walkDate: this.dateUtils.momentNowNoTime().valueOf()
        })
      };
    }
    this.confirmAction = ConfirmType.NONE;
    this.sendNotifications = true;
    this.googleMapsUrl = this.display.googleMapsUrl(this.displayedWalk.walk, false, this.displayedWalk.walk.postcode);
    this.walkDate = this.dateUtils.asDate(this.displayedWalk.walk.walkDate);
    if (this.displayedWalk.walkEditMode.initialiseWalkLeader) {
      this.setStatus(EventType.AWAITING_WALK_DETAILS);
      this.displayedWalk.walk.walkLeaderMemberId = this.loggedInMemberService.loggedInMember().memberId;
      this.walkLeaderMemberIdChanged();
      this.notify.success({
        title: "Thanks for offering to lead this walk " + this.loggedInMemberService.loggedInMember().firstName + "!",
        message: "Please complete as many details you can, then click Save to allocate this slot on the walks programme. " +
          "It will be published to the public once it\"s approved. If you want to release this slot again, just click Cancel."
      });
    } else {
      const eventType: EventType = this.display.statusFor(this.displayedWalk.walk);
      if (!isEmpty(eventType)) {
        this.setStatus(eventType);
        this.priorStatus = eventType;
      }
      this.populateCopySourceFromWalkLeaderMemberId();
      this.populateWalkTemplates();
      this.meetupSelectSync(this.displayedWalk.walk);
    }
  }

  populateCopySourceFromWalkLeaderMemberId() {
    this.copySourceFromWalkLeaderMemberId = this.displayedWalk.walk.walkLeaderMemberId
      || this.loggedInMemberService.loggedInMember().memberId;
  }

  walkEvents(walk: Walk) {
    return walk.events
      .sort((event: WalkEvent) => event.date)
      .map((event: WalkEvent) => ({
        member: this.memberIdToFullNamePipe.transform(event.memberId, this.display.members),
        date: this.displayDateAndTime.transform(event.date),
        eventType: this.walksReferenceService.toEventType(event.eventType).description,
        notes: this.eventNotePipe.transform(event),
        changedItems: this.changedItemsPipe.transform(event, this.display.members)
      }))
      .reverse();
  }

  membersWithAliasOrMe(): DisplayMember[] {
    return this.display.members.map(member => {
      return {memberId: member.$id(), name: this.fullNameWithAliasOrMePipe.transform(member)};
    });
  }

  membersWithAlias(): DisplayMember[] {
    return this.display.members.map(member => {
      return {memberId: member.$id(), name: this.fullNamePipe.transform(member)};
    });
  }

  populateCurrentWalkFromTemplate() {
    const walkTemplate = clone(this.copyFrom.walkTemplate) as Walk;
    if (walkTemplate) {
      const templateDate = this.displayDate.transform(walkTemplate.walkDate);
      delete walkTemplate._id;
      delete walkTemplate.events;
      delete walkTemplate.walkLeaderMemberId;
      delete walkTemplate.ramblersWalkId;
      delete walkTemplate.walkDate;
      delete walkTemplate.displayName;
      delete walkTemplate.contactPhone;
      delete walkTemplate.contactEmail;
      Object.assign(this.displayedWalk.walk, walkTemplate);
      const event = this.walkNotificationService.createEventIfRequired(this.displayedWalk.walk,
        EventType.WALK_DETAILS_COPIED, "Copied from previous walk on " + templateDate);
      this.setStatus(EventType.AWAITING_WALK_DETAILS);
      this.walkNotificationService.writeEventIfRequired(this.displayedWalk.walk, event);
      this.notify.success({
        title: "Walk details were copied from " + templateDate + ".",
        message: "Make any further changes here and save when you are done."
      });
    }
  }

  revertToPriorStatus() {
    this.logger.debug("revertToPriorWalkStatus:", this.status(), "->", this.priorStatus);
    if (this.priorStatus) {
      this.setStatus(this.priorStatus);
      this.logDetectChanges();
    }
  }

  unlinkRamblersDataFromCurrentWalk() {
    delete this.displayedWalk.walk.ramblersWalkId;
    this.notify.progress("Previous Ramblers walk has now been unlinked.");
  }

  unlinkOSMapsFromCurrentWalk() {
    delete this.displayedWalk.walk.osMapsRoute;
    delete this.displayedWalk.walk.osMapsTitle;
    this.notify.progress("Previous OS Maps route has now been unlinked.");
  }

  canUnlinkRamblers() {
    return this.loggedInMemberService.allowWalkAdminEdits() && this.ramblersWalkExists();
  }

  unlinkMeetup() {
    delete this.displayedWalk.walk.meetupEventTitle;
    delete this.displayedWalk.walk.meetupEventUrl;
    this.meetupEvent = null;
    this.notify.progress("Previous Meetup link has now been removed.");
  }

  canUnlinkMeetup() {
    return this.loggedInMemberService.allowWalkAdminEdits() && this.displayedWalk.walk && this.displayedWalk.walk.meetupEventUrl;
  }

  canUnlinkOSMaps() {
    return this.displayedWalk.walk.osMapsRoute || this.displayedWalk.walk.osMapsTitle;
  }

  notUploadedToRamblersYet() {
    return !this.ramblersWalkExists();
  }

  insufficientDataToUploadToRamblers() {
    return this.loggedInMemberService.allowWalkAdminEdits() && this.displayedWalk.walk
      && !(this.displayedWalk.walk.gridReference || this.displayedWalk.walk.postcode);
  }

  validateWalk() {
    return this.ramblersWalksAndEventsService.validateWalk(this.displayedWalk.walk, this.display.members);
  }

  walkValidations() {
    const walkValidations = this.validateWalk().walkValidations;
    return "This walk cannot be included in the Ramblers Walks and Events Manager export due to the following "
      + walkValidations.length + " reasons(s): " + walkValidations.join(", ") + ".";
  }

  meetupEventUrlChange(walk: Walk) {
    walk.meetupEventTitle = this.meetupEvent.title;
    walk.meetupEventUrl = this.meetupEvent.url;
  }

  meetupSelectSync(walk: Walk) {
    this.logger.debug("meetupSelectSync");
    const criteria = {url: walk.meetupEventUrl};
    this.meetupEvent = find(this.display.meetupEvents, criteria) as MeetupEvent;
    this.logger.debug("meetupSelectSync:this.display.meetupEvents", this.display.meetupEvents, criteria, "=>", this.meetupEvent);
  }

  ramblersWalkExists() {
    return this.validateWalk().publishedOnRamblers;
  }

  loggedIn() {
    return this.loggedInMemberService.memberLoggedIn();
  }

  deleteWalkDetails() {
    this.confirmAction = ConfirmType.DELETE;
    this.notify.warning({
      title: "Confirm delete of walk details.",
      message: "If you confirm this, the slot for " +
        this.displayDate.transform(this.displayedWalk.walk.walkDate) + " will be deleted from the site."
    });
  }

  cancelWalkDetails() {
    this.confirmAction = ConfirmType.CANCEL;
    this.notify.warning({
      title: "Cancel changes.",
      message: "Click Confirm to lose any changes you\"ve just made for " +
        this.displayDate.transform(this.displayedWalk.walk.walkDate) + ", or Cancel to carry on editing."
    });
  }

  confirmCancelWalkDetails() {
    this.closeEditView();
  }

  isWalkReadyForStatusChangeTo(eventType: WalkEventType): boolean {
    this.notify.hide();
    this.logger.debug("isWalkReadyForStatusChangeTo ->", eventType);
    const walkValidations = this.validateWalk().walkValidations;
    if (eventType.mustHaveLeader && !this.displayedWalk.walk.walkLeaderMemberId) {
      this.notify.warning(
        {
          title: "Walk leader needed",
          message: " - this walk cannot be changed to " + eventType.description + " yet."
        });
      this.logger.debug("isWalkReadyForStatusChangeTo:false - this.currentStatus ->", this.currentStatus);
      return false;
    } else if (eventType.mustPassValidation && walkValidations.length > 0) {
      this.notify.warning(
        {
          title: "This walk is not ready to be " + eventType.readyToBe + " yet due to the following "
            + walkValidations.length + " reasons(s): ",
          message: walkValidations.join(", ") +
            ". You can still save this walk, then come back later on to complete the rest of the details."
        });
      return false;
    } else {
      return true;
    }
  }

  initiateEvent() {
    this.saveInProgress = true;
    this.displayedWalk.walk.walkDate = this.dateUtils.asValueNoTime(this.walkDate);
    return this.walkNotificationService.createEventAndSendNotifications(this.display.members, this.displayedWalk.walk, this.status(),
      this.notify, this.sendNotifications && this.displayedWalk.walk.walkLeaderMemberId);
  }

  setStatus(status: EventType) {
    this.logger.debug("setting status =>", status);
    this.currentStatus = status;
    this.priorStatus = clone(this.currentStatus);
    this.logger.debug("setting status =>", status, "this.priorStatus", this.priorStatus);
  }

  confirmDeleteWalkDetails() {
    this.setStatus(EventType.DELETED);
    return this.initiateEvent()
      .then(() => this.displayedWalk.walk.$saveOrUpdate((walk: Walk) => this.emitSavedWalk(walk), (walk: Walk) => this.emitSavedWalk(walk)))
      .catch(error => this.notifyError(error));
  }

  afterSaveWith(notificationSent: boolean) {
    return () => {
      this.logger.debug("invoking afterSaveWith:notificationSent", notificationSent);
      this.notify.clearBusy();
      this.saveInProgress = false;
      this.confirmAction = ConfirmType.NONE;
      if (!notificationSent) {
        this.closeEditView();
      }
      this.logDetectChanges();
    };
  }

  private logDetectChanges() {
    this.logger.info("detectChanges");
    this.cdr.detectChanges();
  }

  emitSavedWalk(walk: Walk): DisplayedWalk {
    this.closeEditView();
    return this.display.toDisplayedWalk(walk);
  }

  closeEditView() {
    this.saveInProgress = false;
    this.confirmAction = ConfirmType.NONE;
    this.display.closeEditView(this.displayedWalk.walk);
    if (this.listcdr) {
      this.listcdr.detectChanges();
    }
  }

  saveWalkDetails(): DisplayedWalk {
    return this.initiateEvent()
      .then((notificationSent: boolean) => this.displayedWalk.walk.$saveOrUpdate(this.afterSaveWith(notificationSent),
        this.afterSaveWith(notificationSent)))
      .catch(error => this.notifyError(error));
  }

  notifyError(error) {
    this.logger.error(error);
    this.saveInProgress = false;
    this.confirmAction = ConfirmType.NONE;
    this.notify.error(error);
  }

  confirmContactOther() {
  }

  requestApproval() {
    this.logger.debug("requestApproval called with current status:", this.status());
    if (this.isWalkReadyForStatusChangeTo(this.walksReferenceService.toEventType(EventType.AWAITING_APPROVAL))) {
      this.confirmAction = ConfirmType.REQUEST_APPROVAL;
      this.notify.warning({
        title: "Confirm walk details complete.",
        message: "If you confirm this, your walk details will be emailed to " + this.walksCoordinatorName() +
          " and they will publish these to the site."
      });
    }
  }

  contactOther() {
    this.notify.warning({
      title: "Confirm walk details complete.",
      message: "If you confirm this, your walk details will be emailed to " + this.walksCoordinatorName() +
        " and they will publish these to the site."
    });
  }

  walkStatusChange(newStatus: Event) {
    this.notify.hide();
    this.logger.debug("walkStatusChange - previous status:", this.currentStatus, "new status:", newStatus);
    const eventType = this.walksReferenceService.toEventType(this.currentStatus);
    if (this.isWalkReadyForStatusChangeTo(eventType)) {
      this.setStatus(eventType.eventType);
      switch (eventType.eventType) {
        case EventType.AWAITING_LEADER: {
          const walkDate = this.displayedWalk.walk.walkDate;
          this.displayedWalk.walk = new this.walksService(pick(this.displayedWalk.walk, ["$id()", "events", "walkDate"]));
          return this.notify.success({
            title: "Walk details reset for " + this.displayDate.transform(walkDate) + ".",
            message: "Status is now " + this.walksReferenceService.toEventType(EventType.AWAITING_LEADER).description
          });
        }
        case EventType.APPROVED: {
          return this.approveWalkDetails();
        }
      }
    } else {
      setTimeout(() => {
        this.revertToPriorStatus();
      });
    }

  }

  walkStatuses(): WalkEventType[] {
    return this.walksReferenceService.walkStatuses();
  }

  approveWalkDetails() {
    const walkValidations = this.validateWalk().walkValidations;
    if (walkValidations.length > 0) {
      this.notify.warning({
        title: "This walk still has the following " + walkValidations.length + " field(s) that need attention: ",
        message: walkValidations.join(", ") +
          ". You\"ll have to get the rest of these details completed before you mark the walk as approved."
      });
    } else {
      this.notify.success({
        title: "Ready to publish walk details!",
        message: "All fields appear to be filled in okay, so next time you save this walk it will be published."
      });
    }
  }

  confirmRequestApproval() {
    this.setStatus(EventType.AWAITING_APPROVAL);
    this.saveWalkDetails();
  }

  cancelConfirmableAction() {
    this.confirmAction = ConfirmType.NONE;
    this.notify.hide();
  }

  editLongerDescription() {
    this.logger.debug("editLongerDescription");
    this.longerDescriptionPreview = false;
  }

  selectCopySelectedLeader() {
    this.copySource = "copy-selected-walk-leader";
    this.populateWalkTemplates();
  }

  myOrWalkLeader() {
    return this.display.loggedInMemberIsLeadingWalk(this.displayedWalk.walk) ? "my" :
      this.displayedWalk.walk && this.displayedWalk.walk.displayName + "'s";
  }

  meOrWalkLeader() {
    return this.display.loggedInMemberIsLeadingWalk(this.displayedWalk.walk) ? "me" :
      this.displayedWalk.walk && this.displayedWalk.walk.displayName;
  }

  personToNotify() {
    return this.display.loggedInMemberIsLeadingWalk(this.displayedWalk.walk) ?
      this.walksCoordinatorName() :
      this.displayedWalk.walk && this.displayedWalk.walk.displayName;
  }

  walksCoordinatorName() {
    return this.committeeReferenceData.contactUsField("walks", "fullName");
  }

  previewLongerDescription() {
    this.logger.debug("previewLongerDescription");
    this.longerDescriptionPreview = true;
  }

  populateWalkTemplates(injectedMemberId?: string) {
    const memberId = this.displayedWalk.walk.walkLeaderMemberId || injectedMemberId;
    let criteria;
    switch (this.copySource) {
      case "copy-selected-walk-leader": {
        criteria = {
          walkLeaderMemberId: this.copySourceFromWalkLeaderMemberId,
          briefDescriptionAndStartPoint: {$exists: true}
        };
        break;
      }
      case "copy-with-os-maps-route-selected": {
        criteria = {osMapsRoute: {$exists: true}};
        break;
      }
      default: {
        criteria = {walkLeaderMemberId: memberId};
      }
    }
    this.logger.debug("selecting walks", this.copySource, criteria);
    this.walksService.query(criteria, {sort: {walkDate: -1}})
      .then(walks => {
        this.copyFrom.walkTemplates = walks;
        this.logDetectChanges();
      });
  }

  onDateChange(date: Date) {
    if (date) {
      this.logger.debug("onDateChange:date", date);
      this.walkDate = date;
      this.displayedWalk.walk.walkDate = this.dateUtils.asValueNoTime(this.walkDate);
    }
  }

  isExpandable(): boolean {
    return this.display.walkMode(this.displayedWalk.walk) === WalkViewMode.EDIT;
  }

}
