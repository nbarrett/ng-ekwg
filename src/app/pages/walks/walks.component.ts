import { Component, Inject, OnInit } from "@angular/core";
import { UrlService } from "../../services/url.service";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import find from "lodash-es/find";
import { EventType, WalksReferenceService } from "../../services/walks-reference-data.service";
import { BroadcasterService } from "../../services/broadcast-service";
import { DateUtilsService } from "../../services/date-utils.service";
import { CommitteeReferenceDataService } from "../../services/committee-reference-data.service";
import { $ } from "jquery";
import { WalkEditMode } from "../../models/walk-edit-mode.model";
import { WalkEventType } from "../../models/walk-event-type.model";
import { clone, pick, sortBy } from "lodash-es";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Member } from "../../models/member.model";
import { Walk } from "../../models/walk.model";
import { DisplayDate, DisplayDateAndTime } from "../../pipes";
import { chain } from "../../functions/chain";
import { LoginService } from "../../login/login.service";

@Component({
  selector: "app-walks",
  templateUrl: "./walks.component.html"
})
export class WalksComponent implements OnInit {

  private expensesOpen: boolean;
  private logger: Logger;
  private SHOW_START_POINT = "show-start-point";
  private SHOW_DRIVING_DIRECTIONS = "show-driving-directions";
  private ramblersUploadAuditData: any[];
  private walksForExport: any[];
  private copyFrom: { walkTemplate: {}; walkTemplates: any[] };
  private confirmAction: object;
  public walksProgrammeOpen: boolean;
  public userEdits;
  public currentWalk: any;
  public grades = ["Easy access", "Easy", "Leisurely", "Moderate", "Strenuous", "Technical"];
  public walkTypes = ["Circular", "Linear"];
  public filterParameters = {
    quickSearch: "",
    selectType: "1",
    ascending: "true"
  };
  private walkAlert: {};
  private walkExport: {};
  private generalNotify: {};
  private notify: any;
  private notifyWalkExport: any;
  private notifyWalkEdit: any;
  private members: [];
  private todayValue: any;
  private filteredWalks: Walk[];
  private allow: any;
  private walkEditMode: WalkEditMode;
  private meetupEvents: any[];
  private currentWalkId: string;
  private nextWalkId: string;
  private walks: Walk[];
  private ramblersWalkBaseUrl: string;
  private meetupConfig: any;
  walksInformationOpen: boolean;
  walksMapViewOpen: boolean;

  constructor(
    @Inject("ClipboardService") private clipboardService,
    @Inject("RamblersUploadAudit") private ramblersUploadAudit,
    @Inject("WalksService") private walksService,
    @Inject("WalksQueryService") private walksQueryService,
    @Inject("WalkNotificationService") private walkNotificationService,
    @Inject("MemberService") private memberService,
    @Inject("RamblersWalksAndEventsService") private ramblersWalksAndEventsService,
    @Inject("Notifier") private notifier,
    @Inject("GoogleMapsConfig") private googleMapsConfig,
    @Inject("MeetupService") private meetupService,
    @Inject("LoggedInMemberService") private loggedInMemberService,
    private loginService: LoginService,
    private displayDate: DisplayDate,
    private displayDateAndTime: DisplayDateAndTime,
    private route: ActivatedRoute,
    private committeeReferenceData: CommitteeReferenceDataService,
    private dateUtils: DateUtilsService,
    private broadcasterService: BroadcasterService,
    private urlService: UrlService, loggerFactory: LoggerFactory,
    private walksReferenceService: WalksReferenceService) {
    this.logger = loggerFactory.createLogger(WalksComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.info("ngOnInit");
    this.todayValue = this.dateUtils.momentNowNoTime().valueOf();
    this.ramblersUploadAuditData = [];
    this.walksForExport = [];
    this.walkAlert = {};
    this.walkExport = {};
    this.notify = this.notifier(this.generalNotify);
    this.notifyWalkExport = this.notifier(this.walkExport);
    this.notifyWalkEdit = this.notifier(this.walkAlert);

    this.userEdits = {
      copyToClipboard: this.clipboardService.copyToClipboard,
      meetupEvent: {},
      copySource: "copy-selected-walk-leader",
      copySourceFromWalkLeaderMemberId: undefined,
      expandedWalks: [],
      mapDisplay: this.SHOW_START_POINT,
      longerDescriptionPreview: true,
      walkExportActive(activeTab) {
        return activeTab === this.walkExportActive;
      },
      walkExportTab0Active: true,
      walkExportTab1Active: false,
      walkExportTabActive: 0,
      status: undefined,
      sendNotifications: true,
      saveInProgress: false,
      fileNames: [],
      walkLink(walk: Walk) {
        return walk && walk.$id() ? this.urlService.notificationHref({
          type: "walk",
          area: "walks",
          id: walk.$id()
        }) : undefined;
      }
    };

    this.allow = {
      close() {
        return !this.userEdits.saveInProgress && !this.confirmAction && !this.allowSave();
      },
      save: this.allowSave,
      cancel() {
        return !this.userEdits.saveInProgress && this.editable() && this.dataHasChanged();
      },
      delete() {
        return !this.confirmAction && this.loggedInMemberService.allowWalkAdminEdits()
          && this.walkEditMode && this.walkEditMode.editEnabled;
      },
      notifyConfirmation() {
        return (this.allowSave() || this.confirmAction && this.confirmAction.delete) && this.currentWalk.walkLeaderMemberId;
      },
      adminEdits() {
        return this.loggedInMemberService.allowWalkAdminEdits();
      },
      edits: this.editable,
      historyView() {
        return this.loggedInMemberIsLeadingWalk(this.currentWalk) || this.loggedInMemberService.allowWalkAdminEdits();
      },
      detailView() {
        return this.loggedInMemberService.memberLoggedIn();
      },
      approve() {
        return !this.confirmAction && this.loggedInMemberService.allowWalkAdminEdits() &&
          this.latestEventWithStatusChangeIs(this.walksReferenceService.eventTypes.awaitingApproval);
      },
      requestApproval() {
        return !this.confirmAction && this.ownedAndAwaitingWalkDetails();
      }
    };
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.currentWalkId = paramMap.get("walk-id");
      this.logger.info("walk-id from route params:", this.currentWalkId);
    });
    this.refreshMembers();
    this.refreshWalks();
    this.refreshRamblersConfig();
    this.refreshGoogleMapsConfig();
    this.refreshMeetupData();
    this.refreshHomePostcode();
    this.broadcasterService.on("walkSlotsCreated", () => this.refreshWalks());
    this.broadcasterService.on("memberLoginComplete", () => {
      this.refreshMembers();
      this.refreshHomePostcode();
    });

  }

  // this.$watch("filterParameters.quickSearch", function = (quickSearch, oldQuery) => {
  //     refreshFilteredWalks();
  //   };);

  finalStatusError() {
    return find(this.ramblersUploadAudit, {status: "error"});
  }

  fileNameChanged() {
    this.logger.debug("filename changed to", this.userEdits.fileName);
    this.refreshRamblersUploadAudit();
  }

  refreshRamblersUploadAudit(stop?: any) {
    this.logger.debug("refreshing audit trail records related to", this.userEdits.fileName);
    return this.ramblersUploadAudit.query({fileName: this.userEdits.fileName}, {sort: {auditTime: -1}})
      .then(auditItems => {
        this.logger.debug("Filtering", auditItems.length, "audit trail records related to", this.userEdits.fileName);
        this.ramblersUploadAudit = auditItems
          .filter(auditItem => {
            return this.userEdits.showDetail || auditItem.type !== "detail";
          })
          .map(auditItem => {
            if (auditItem.status === "complete") {
              this.logger.debug("Upload complete");
              this.notifyWalkExport.success("Ramblers upload completed");
              // $interval.cancel(stop);
              this.userEdits.saveInProgress = false;
            }
            return auditItem;
          });
      });
  }

  addWalk() {
    this.showWalkDialog(new this.walksService({
      status: EventType.AWAITING_LEADER,
      walkType: this.walkTypes[0],
      walkDate: this.todayValue
    }), this.walksReferenceService.walkEditModes.add);
  }

  addWalkSlotsDialog() {
    this.broadcasterService.broadcast("addWalkSlotsDialogOpen");
  }

  unlinkRamblersDataFromCurrentWalk() {
    delete this.currentWalk.ramblersWalkId;
    this.notify.progress("Previous Ramblers walk has now been unlinked.");
  }

  canUnlinkRamblers() {
    return this.loggedInMemberService.allowWalkAdminEdits() && this.ramblersWalkExists();
  }

  unlinkMeetup() {
    delete this.currentWalk.meetupEventTitle;
    delete this.currentWalk.meetupEventUrl;
    this.notify.progress("Previous Meetup link has now been removed.");
  }

  canUnlinkMeetup() {
    return this.loggedInMemberService.allowWalkAdminEdits() && this.currentWalk && this.currentWalk.meetupEventUrl;
  }

  notUploadedToRamblersYet() {
    return !this.ramblersWalkExists();
  }

  insufficientDataToUploadToRamblers() {
    return this.loggedInMemberService.allowWalkAdminEdits() && this.currentWalk
      && !(this.currentWalk.gridReference || this.currentWalk.postcode);
  }

  canExportToRamblers() {
    return this.loggedInMemberService.allowWalkAdminEdits() && this.validateWalk().selected;
  }

  validateWalk() {
    return this.ramblersWalksAndEventsService.validateWalk(this.currentWalk, this.members);
  }

  walkValidations() {
    const walkValidations = this.validateWalk().walkValidations;
    return "This walk cannot be included in the Ramblers Walks and Events Manager export due to the following "
      + walkValidations.length + " problem(s): " + walkValidations.join(", ") + ".";
  }

  meetupEventUrlChange(walk: Walk) {
    walk.meetupEventTitle = this.userEdits.meetupEvent.title;
    walk.meetupEventUrl = this.userEdits.meetupEvent.url;
  }

  meetupSelectSync(walk: Walk) {
    this.userEdits.meetupEvent = find(this.meetupEvents, {url: walk.meetupEventUrl});
  }

  ramblersWalkExists() {
    return this.validateWalk().publishedOnRamblers;
  }

  loggedInMemberIsLeadingWalk(walk: Walk) {
    return walk && walk.walkLeaderMemberId === this.loggedInMemberService.loggedInMember().memberId;
  }

  loggedIn() {
    return this.loggedInMemberService.memberLoggedIn();
  }

  toWalkEditMode(walk: Walk): WalkEditMode {
    if (this.loggedInMemberService.memberLoggedIn()) {
      if (this.loggedInMemberIsLeadingWalk(walk) ||
        this.loggedInMemberService.allowWalkAdminEdits()) {
        return this.walksReferenceService.walkEditModes.edit;
      } else if (!walk.walkLeaderMemberId) {
        return this.walksReferenceService.walkEditModes.lead;
      }
    }
  }

  actionWalk(walk: Walk) {
    this.showWalkDialog(walk, this.toWalkEditMode(walk));
  }

  deleteWalkDetails() {
    this.confirmAction = {delete: true};
    this.notifyWalkEdit.warning({
      title: "Confirm delete of walk details.",
      message: "If you confirm this, the slot for " +
        this.displayDate.transform(this.currentWalk.walkDate) + " will be deleted from the site."
    });
  }

  cancelWalkDetails() {
    this.confirmAction = {cancel: true};
    this.notifyWalkEdit.warning({
      title: "Cancel changes.",
      message: "Click Confirm to lose any changes you\"ve just made for " +
        this.displayDate.transform(this.currentWalk.walkDate) + ", or Cancel to carry on editing."
    });
  }

  confirmCancelWalkDetails() {
    this.hideWalkDialogAndRefreshWalks();
  }

  isWalkReadyForStatusChangeTo(eventType: WalkEventType): boolean {
    this.notifyWalkEdit.hide();
    this.logger.info("isWalkReadyForStatusChangeTo ->", eventType);
    const walkValidations = this.validateWalk().walkValidations;
    if (eventType.mustHaveLeader && !this.currentWalk.walkLeaderMemberId) {
      this.notifyWalkEdit.warning(
        {
          title: "Walk leader needed",
          message: " - this walk cannot be changed to " + eventType.description + " yet."
        });
      this.revertToPriorWalkStatus();
      return false;
    } else if (eventType.mustPassValidation && walkValidations.length > 0) {
      this.notifyWalkEdit.warning(
        {
          title: "This walk is not ready to be " + eventType.readyToBe + " yet due to the following "
            + walkValidations.length + " problem(s): ",
          message: walkValidations.join(", ") +
            ". You can still save this walk, then come back later on to complete the rest of the details."
        });
      this.revertToPriorWalkStatus();
      return false;
    } else {
      return true;
    }
  }


  initiateEvent() {
    this.userEdits.saveInProgress = true;
    const walk = this.dateUtils.convertDateFieldInObject(this.currentWalk, "walkDate");
    return this.walkNotificationService.createEventAndSendNotifications(this.members, walk, this.userEdits.status,
      this.notifyWalkEdit, this.userEdits.sendNotifications && walk.walkLeaderMemberId);
  }

  confirmDeleteWalkDetails() {
    this.userEdits.status = EventType.DELETED;
    return this.initiateEvent()
      .then(() => this.currentWalk.$saveOrUpdate(this.hideWalkDialogAndRefreshWalks, this.hideWalkDialogAndRefreshWalks))
      .catch(() => this.userEdits.saveInProgress = false);
  }

  saveWalkDetails() {
    return this.initiateEvent()
      .then(notificationSent => this.currentWalk.$saveOrUpdate(this.afterSaveWith(notificationSent), this.afterSaveWith(notificationSent)))
      .catch(() => {
        this.userEdits.saveInProgress = false;
      });
  }

  requestApproval() {
    this.logger.info("requestApproval called with current status:", this.userEdits.status);
    if (this.isWalkReadyForStatusChangeTo(this.walksReferenceService.toEventType(EventType.AWAITING_APPROVAL))) {
      this.confirmAction = {requestApproval: true};
      this.notifyWalkEdit.warning({
        title: "Confirm walk details complete.",
        message: "If you confirm this, your walk details will be emailed to " + this.walksCoordinatorName() +
          " and they will publish these to the site."
      });
    }
  }

  contactOther() {
    this.notifyWalkEdit.warning({
      title: "Confirm walk details complete.",
      message: "If you confirm this, your walk details will be emailed to " + this.walksCoordinatorName() +
        " and they will publish these to the site."
    });
  }

  walkStatusChange(status) {
    this.userEdits.priorStatus = status;
    this.notifyWalkEdit.hide();
    this.logger.info("walkStatusChange - was:", status, "now:", this.userEdits.status);
    if (this.isWalkReadyForStatusChangeTo(this.walksReferenceService.toEventType(this.userEdits.status))) {
      switch (this.userEdits.status) {
        case EventType.AWAITING_LEADER: {
          const walkDate = this.currentWalk.walkDate;
          this.userEdits.status = this.walksReferenceService.toEventType(EventType.AWAITING_LEADER).eventType;
          this.currentWalk = new this.walksService(pick(this.currentWalk, ["_id", "events", "walkDate"]));
          return this.notifyWalkEdit.success({
            title: "Walk details reset for " + this.displayDate.transform(walkDate) + ".",
            message: "Status is now " + this.walksReferenceService.toEventType(EventType.AWAITING_LEADER).description
          });
        }
        case EventType.APPROVED: {
          return this.approveWalkDetails();
        }
      }
    }

  }

  approveWalkDetails() {
    const walkValidations = this.validateWalk().walkValidations;
    if (walkValidations.length > 0) {
      this.notifyWalkEdit.warning({
        title: "This walk still has the following " + walkValidations.length + " field(s) that need attention: ",
        message: walkValidations.join(", ") +
          ". You\"ll have to get the rest of these details completed before you mark the walk as approved."
      });
      this.revertToPriorWalkStatus();
    } else {
      this.notifyWalkEdit.success({
        title: "Ready to publish walk details!",
        message: "All fields appear to be filled in okay, so next time you save this walk it will be published."
      });
    }
  }

  confirmRequestApproval() {
    this.userEdits.status = this.walksReferenceService.toEventType(EventType.AWAITING_APPROVAL).eventType;
    this.saveWalkDetails();
  }

  cancelConfirmableAction() {
    delete this.confirmAction;
    this.notify.hide();
    this.notifyWalkEdit.hide();
  }


  revertToPriorWalkStatus() {
    this.logger.info("revertToPriorWalkStatus:", this.userEdits.status, "->", this.userEdits.priorStatus);
    if (this.userEdits.priorStatus) {
      this.userEdits.status = this.userEdits.priorStatus;
    }
  }

  populateCurrentWalkFromTemplate() {
    const walkTemplate = clone(this.copyFrom.walkTemplate) as Walk;
    if (walkTemplate) {
      const templateDate = this.displayDate.transform(walkTemplate.walkDate);
      delete walkTemplate._id;
      delete walkTemplate.events;
      delete walkTemplate.ramblersWalkId;
      delete walkTemplate.walkDate;
      delete walkTemplate.displayName;
      delete walkTemplate.contactPhone;
      delete walkTemplate.contactEmail;
      Object.assign(this.currentWalk, walkTemplate);
      const event = this.walkNotificationService.createEventIfRequired(this.currentWalk,
        EventType.WALK_DETAILS_COPIED, "Copied from previous walk on " + templateDate);
      this.walkNotificationService.writeEventIfRequired(this.currentWalk, event);
      this.notifyWalkEdit.success({
        title: "Walk details were copied from " + templateDate + ".",
        message: "Make any further changes here and save when you are done."
      });
    }
  }

  selectCopySelectedLeader() {
    this.userEdits.copySource = "copy-selected-walk-leader";
    this.populateWalkTemplates();
  }

  populateWalkTemplates(injectedMemberId?: string) {
    const memberId = this.currentWalk.walkLeaderMemberId || injectedMemberId;
    let criteria;
    switch (this.userEdits.copySource) {
      case "copy-selected-walk-leader": {
        criteria = {
          walkLeaderMemberId: this.userEdits.copySourceFromWalkLeaderMemberId,
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
    this.logger.info("selecting walks", this.userEdits.copySource, criteria);
    this.walksService.query(criteria, {sort: {walkDate: -1}})
      .then(walks => {
        this.copyFrom.walkTemplates = walks;
      });
  }

  walkLeaderMemberIdChanged() {
    this.notifyWalkEdit.hide();
    const walk = this.currentWalk;
    const memberId = walk.walkLeaderMemberId;
    if (!memberId) {
      this.userEdits.status = EventType.AWAITING_LEADER;
      delete walk.walkLeaderMemberId;
      delete walk.contactId;
      delete walk.displayName;
      delete walk.contactPhone;
      delete walk.contactEmail;
    } else {
      const selectedMember: Member = this.members.find((member: any) => {
        return member.$id() === memberId;
      });
      if (selectedMember) {
        this.userEdits.status = EventType.AWAITING_WALK_DETAILS;
        walk.contactId = selectedMember.contactId;
        walk.displayName = selectedMember.displayName;
        walk.contactPhone = selectedMember.mobileNumber;
        walk.contactEmail = selectedMember.email;
        this.populateWalkTemplates(memberId);
      }
    }
  }

  myOrWalkLeader() {
    return this.loggedInMemberIsLeadingWalk(this.currentWalk) ? "my" : this.currentWalk && this.currentWalk.displayName + "";
  }

  meOrWalkLeader() {
    return this.loggedInMemberIsLeadingWalk(this.currentWalk) ? "me" : this.currentWalk && this.currentWalk.displayName;
  }

  personToNotify() {
    return this.loggedInMemberIsLeadingWalk(this.currentWalk) ? this.walksCoordinatorName() :
      this.currentWalk && this.currentWalk.displayName;
  }

  walksCoordinatorName() {
    return this.committeeReferenceData.contactUsField("walks", "fullName");
  }

  convertWalkDateIfNotNumeric(walk: Walk) {
    const walkDate = this.dateUtils.asValueNoTime(walk.walkDate);
    if (walkDate !== walk.walkDate) {
      this.logger.info("Converting date from", walk.walkDate, "(" +
        this.displayDateAndTime.transform(walk.walkDate) + ") to", walkDate, "(" +
        this.displayDateAndTime.transform(walkDate) + ")");
      walk.walkDate = walkDate;
    } else {
      this.logger.info("Walk date", walk.walkDate, "is already in correct format");
    }
    return walk;
  }


  latestEventWithStatusChangeIs(eventType) {
    return this.walkNotificationService.latestEventWithStatusChangeIs(this.currentWalk, eventType);
  }

  dataHasChanged() {
    const dataAuditDelta = this.walkNotificationService.dataAuditDelta(this.currentWalk, this.userEdits.status);
    const notificationRequired = dataAuditDelta.notificationRequired;
    return notificationRequired;
  }

  ownedAndAwaitingWalkDetails() {
    return this.loggedInMemberIsLeadingWalk(this.currentWalk) && this.userEdits.status === EventType.AWAITING_LEADER;
  }

  editable() {
    return !this.confirmAction && (this.loggedInMemberService.allowWalkAdminEdits() || this.loggedInMemberIsLeadingWalk(this.currentWalk));
  }

  allowSave() {
    return this.editable() && this.dataHasChanged();
  }

  previewLongerDescription() {
    this.logger.debug("previewLongerDescription");
    this.userEdits.longerDescriptionPreview = true;
  }

  editLongerDescription() {
    this.logger.debug("editLongerDescription");
    this.userEdits.longerDescriptionPreview = false;
  }

  trustSrc(src) {
    throw new Error("solve $sce.trustAsResourceUrl(src);");
    // return $sce.trustAsResourceUrl(src);
  }

  showAllWalks() {
    this.expensesOpen = true;
    this.urlService.navigateTo("walks", "programme");
  }

  googleMaps(walk: Walk) {
    return this.userEdits.mapDisplay === this.SHOW_DRIVING_DIRECTIONS ?
      "https://www.google.com/maps/embed/v1/directions?origin=" + this.userEdits.fromPostcode + "&destination=" +
      walk.postcode + "&key=" + this.googleMapsConfig.apiKey :
      "https://www.google.com/maps/embed/v1/place?q=" + walk.postcode + "&zoom=" +
      this.googleMapsConfig.zoomLevel + "&key=" + this.googleMapsConfig.apiKey;
  }

  autoSelectMapDisplay() {
    const switchToShowStartPoint = this.drivingDirectionsDisabled() && this.userEdits.mapDisplay === this.SHOW_DRIVING_DIRECTIONS;
    const switchToShowDrivingDirections = !this.drivingDirectionsDisabled() && this.userEdits.mapDisplay === this.SHOW_START_POINT;
    if (switchToShowStartPoint) {
      this.userEdits.mapDisplay = this.SHOW_START_POINT;
    } else if (switchToShowDrivingDirections) {
      this.userEdits.mapDisplay = this.SHOW_DRIVING_DIRECTIONS;
    }
  }

  drivingDirectionsDisabled() {
    return this.userEdits.fromPostcode.length < 3;
  }

  eventTypeFor(walk: Walk): WalkEventType {
    const latestEventWithStatusChange = this.walkNotificationService.latestEventWithStatusChange(walk);
    let lookupType: EventType;
    if (latestEventWithStatusChange) {
      lookupType = latestEventWithStatusChange.eventType;
    } else if (walk.status) {
      lookupType = walk.status;
    } else {
      lookupType = EventType.AWAITING_WALK_DETAILS;
    }
    const eventType = this.walksReferenceService.toEventType(lookupType) as WalkEventType;
    this.logger.info("latestEventWithStatusChange", latestEventWithStatusChange, "eventType", eventType, "walk.events", walk.events);
    return eventType;
  }

  viewWalkField(walk: Walk, field) {
    const eventType = this.eventTypeFor(walk);
    if (eventType.showDetails) {
      return walk[field] || "";
    } else if (field === "briefDescriptionAndStartPoint") {
      return eventType.description;
    } else {
      return "";
    }
  }

  showWalkDialog(walk, walkEditMode: WalkEditMode) {
    delete this.confirmAction;
    this.userEdits.sendNotifications = true;
    this.walkEditMode = walkEditMode;
    this.currentWalk = walk;
    if (walkEditMode.initialiseWalkLeader) {
      this.userEdits.status = EventType.AWAITING_WALK_DETAILS;
      walk.walkLeaderMemberId = this.loggedInMemberService.loggedInMember().memberId;
      this.walkLeaderMemberIdChanged();
      this.notifyWalkEdit.success({
        title: "Thanks for offering to lead this walk " + this.loggedInMemberService.loggedInMember().firstName + "!",
        message: "Please complete as many details you can, then save to allocate this slot on the walks programme. " +
          "It will be published to the public once it\"s approved. If you want to release this slot again, just click cancel."
      });
    } else {
      const eventTypeIfExists = this.walkNotificationService.latestEventWithStatusChange(this.currentWalk).eventType;
      if (eventTypeIfExists) {
        this.userEdits.status = eventTypeIfExists;
      }
      this.userEdits.copySourceFromWalkLeaderMemberId = walk.walkLeaderMemberId || this.loggedInMemberService.loggedInMember().memberId;
      this.populateWalkTemplates();
      this.meetupSelectSync(this.currentWalk);
      this.notifyWalkEdit.hide();
    }
    $("#walk-dialog").modal();
  }


  walksCriteriaObject() {
    switch (this.filterParameters.selectType) {
      case "1":
        return {walkDate: {$gte: this.todayValue}};
      case "2":
        return {walkDate: {$lt: this.todayValue}};
      case "3":
        return {};
      case "4":
        return {displayName: {$exists: false}};
      case "5":
        return {briefDescriptionAndStartPoint: {$exists: false}};
    }
  }

  walksSortObject() {
    switch (this.filterParameters.ascending) {
      case "true":
        return {sort: {walkDate: 1}};
      case "false":
        return {sort: {walkDate: -1}};
    }
  }

  query() {
    if (this.currentWalkId) {
      return this.walksService.getById(this.currentWalkId)
        .then((walk: Walk) => {
          if (!walk) {
            this.notify.error("Walk could not be found. Try opening again from the link in the notification email, " +
              "or choose the Show All Walks button");
          }
          return [walk];
        });
    } else {
      return this.walksService.query(this.walksCriteriaObject(), this.walksSortObject());
    }
  }

  refreshFilteredWalks() {
    this.notify.setBusy();
    throw new Error("$filter(\"filter\")(this.walks, this.filterParameters.quickSearch)");
    // this.filteredWalks = (this.walks, this.filterParameters.quickSearch);
    const walksCount = (this.filteredWalks && this.filteredWalks.length) || 0;
    this.notify.progress("Showing " + walksCount + " walk(s)");
    if (this.filteredWalks.length > 0) {
      this.userEdits.expandedWalks = [this.filteredWalks[0].$id()];
    }
    this.notify.clearBusy();
  }

  showTableHeader(walk: Walk) {
    return this.filteredWalks.indexOf(walk) === 0 || this.isExpandedFor(this.filteredWalks[this.filteredWalks.indexOf(walk) - 1]);
  }

  nextWalk(walk: Walk) {
    return walk && walk.$id() === this.nextWalkId;
  }

  durationInFutureFor(walk: Walk) {
    return walk && walk.walkDate === this.todayValue ? "today" : (this.dateUtils.asMoment(walk.walkDate).fromNow());
  }

  toggleViewFor(walk: Walk) {

    const arrayRemove = (arr, value) => arr.filter(ele => ele !== value);

    const walkId = walk.$id();
    if (this.userEdits.expandedWalks.includes(walkId)) {
      this.userEdits.expandedWalks = arrayRemove(this.userEdits.expandedWalks, walkId);
      this.logger.debug("toggleViewFor:", walkId, "-> collapsing");
    } else {
      this.userEdits.expandedWalks.push(walkId);
      this.logger.debug("toggleViewFor:", walkId, "-> expanding");
    }
    this.logger.debug("toggleViewFor:", walkId, "-> expandedWalks contains", this.userEdits.expandedWalks);
  }

  isExpandedFor(walk: Walk) {
    return this.userEdits.expandedWalks.includes(walk.$id());
  }

  tableRowOdd(walk: Walk) {
    return this.filteredWalks.indexOf(walk) % 2 === 0;
  }

  getNextWalkId(walks) {
    const nextWalk = chain(walks).sortBy("walkDate").find((walk: Walk) => walk.walkDate >= this.todayValue).value();
    return nextWalk && nextWalk.$id();
  }

  refreshWalks(notificationSent?: any) {
    this.notify.setBusy();
    this.notify.progress("Refreshing walks...");
    return this.query()
      .then(walks => {
        this.nextWalkId = this.urlService.hasRouteParameter("walkId") ? undefined : this.getNextWalkId(walks);
        this.walks = this.urlService.hasRouteParameter("walkId") ? walks : this.walksQueryService.activeWalks(walks);
        this.refreshFilteredWalks();
        this.notify.clearBusy();
        if (!notificationSent) {
          this.notifyWalkEdit.hide();
        }
        this.userEdits.saveInProgress = false;
      });
  }

  hideWalkDialog() {
    $("#walk-dialog").modal("hide");
    delete this.confirmAction;
  }

  hideWalkDialogAndRefreshWalks() {
    this.logger.info("hideWalkDialogAndRefreshWalks");
    this.hideWalkDialog();
    this.refreshWalks();
  }

  afterSaveWith(notificationSent) {
    return () => {
      if (!notificationSent) {
        $("#walk-dialog").modal("hide");
      }
      this.notifyWalkEdit.clearBusy();
      delete this.confirmAction;
      this.refreshWalks(notificationSent);
      this.userEdits.saveInProgress = false;
    };
  }

  refreshRamblersConfig() {
    this.ramblersWalksAndEventsService.walkBaseUrl().then((walkBaseUrl) => {
      this.ramblersWalkBaseUrl = walkBaseUrl;
    });
  }

  refreshGoogleMapsConfig() {
    this.googleMapsConfig.getConfig().then(googleMapsConfig => {
      this.googleMapsConfig = googleMapsConfig;
      this.googleMapsConfig.zoomLevel = 12;
    });
  }

  refreshMeetupData() {
    this.meetupService.config().then(meetupConfig => {
      this.meetupConfig = meetupConfig;
    });

    this.meetupService.eventsForStatus("past")
      .then(pastEvents => {
        this.meetupService.eventsForStatus("upcoming")
          .then(futureEvents => {
            this.meetupEvents = sortBy(pastEvents.concat(futureEvents), "date,").reverse();
          });
      });
  }

  refreshHomePostcode() {
    this.userEdits.fromPostcode = this.loggedInMemberService.memberLoggedIn() ? this.loggedInMemberService.loggedInMember().postcode : "";
    this.logger.debug("set from postcode to", this.userEdits.fromPostcode);
    this.autoSelectMapDisplay();
  }

  refreshMembers() {
    if (this.loggedInMemberService.memberLoggedIn()) {
      return this.memberService.allLimitedFields(this.memberService.filterFor.GROUP_MEMBERS)
        .then((members) => {
          this.members = members;
          return members;
        });
    }
  }

  exportableWalks() {
    return this.ramblersWalksAndEventsService.exportableWalks(this.walksForExport);
  }

  walksDownloadFile() {
    return this.ramblersWalksAndEventsService.exportWalks(this.exportableWalks(), this.members);
  }

  uploadToRamblers() {

    const callAtInterval = () => {
      this.logger.debug("Refreshing audit trail for file", this.userEdits.fileName, "count =", this.ramblersUploadAudit.length);
      this.refreshRamblersUploadAudit(stop);
    };

    this.ramblersUploadAudit = [];
    this.userEdits.walkExportTab0Active = false;
    this.userEdits.walkExportTab1Active = true;
    this.userEdits.saveInProgress = true;
    this.ramblersWalksAndEventsService.uploadToRamblers(this.walksForExport, this.members, this.notifyWalkExport).then(fileName => {
      this.userEdits.fileName = fileName;
      throw new Error("solve $interval(callAtInterval, 2000, false);");
      // const stop = $interval(callAtInterval, 2000, false);
      if (this.userEdits.fileNames.includes(this.userEdits.fileName)) {
        this.userEdits.fileNames.push(this.userEdits.fileName);
        this.logger.debug("added", this.userEdits.fileName, "to filenames of", this.userEdits.fileNames.length, "audit trail records");
      }
      delete this.finalStatusError;


    });
  }

  walksDownloadFileName() {
    return this.ramblersWalksAndEventsService.exportWalksFileName();
  }

  walksDownloadHeader() {
    return this.ramblersWalksAndEventsService.exportColumnHeadings();
  }

  selectWalksForExport() {
    this.showWalkExportDialog();
  }

  changeWalkExportSelection(walk: any) {
    if (walk.walkValidations.length === 0) {
      walk.selected = !walk.selected;
      this.notifyWalkExport.hide();
    } else {
      this.notifyWalkExport.error({
        title: "You can\"t export the walk for " + this.displayDate.transform(walk.walk.walkDate),
        message: walk.walkValidations.join(", ")
      });
    }
  }

  cancelExportWalkDetails() {
    $("#walk-export-dialog").modal("hide");
  }

  populateWalkExport(walksForExport) {
    this.walksForExport = walksForExport;
    this.notifyWalkExport.success("Found total of " + this.walksForExport.length + " walk(s), "
      + this.walksDownloadFile().length + " preselected for export");
    this.notifyWalkExport.clearBusy();
  }

  showWalkExportDialog() {
    this.walksForExport = [];
    this.notifyWalkExport.warning("Determining which walks to export", true);
    this.ramblersUploadAudit.all({limit: 1000, sort: {auditTime: -1}})
      .then(auditItems => {
        this.logger.debug("found total of", auditItems.length, "audit trail records");
        this.userEdits.fileNames = chain(auditItems).map("fileName").unique();
        this.logger.debug("unique total of", this.userEdits.fileNames.length, "audit trail records");
      });
    this.ramblersWalksAndEventsService.createWalksForExportPrompt(this.walks, this.members)
      .then(this.populateWalkExport)
      .catch(error => {
        this.logger.debug("error->", error);
        this.notifyWalkExport.error({title: "Problem with Ramblers export preparation", message: JSON.stringify(error)});
      });
    $("#walk-export-dialog").modal();
  }

  loginOrLogout() {
    return this.loginService.memberLoggedIn() ? "/logout" : "/login";
  }
}
