import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import cloneDeep from "lodash-es/cloneDeep";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../../auth/auth.service";
import { AlertTarget } from "../../models/alert-target.model";
import { ApiAction } from "../../models/api-response.model";
import { AccessLevelData, FilterParameters, MemberResource, MemberResourceApiResponse, MemberResourcesPermissions } from "../../models/member-resource.model";
import { Member } from "../../models/member.model";
import { Confirm } from "../../models/ui-actions";
import { SearchFilterPipe } from "../../pipes/search-filter.pipe";
import { ApiResponseProcessor } from "../../services/api-response-processor.service";
import { sortBy } from "../../services/arrays";
import { ContentMetadataService } from "../../services/content-metadata.service";
import { DateUtilsService } from "../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { MailchimpLinkService } from "../../services/mailchimp/mailchimp-link.service";
import { MemberResourcesService } from "../../services/member-resources/member-resources.service";
import { MemberLoginService } from "../../services/member/member-login.service";
import { MemberResourcesReferenceDataService } from "../../services/member/member-resources-reference-data.service";
import { AlertInstance, NotifierService } from "../../services/notifier.service";
import { UrlService } from "../../services/url.service";
import { SiteEditService } from "../../site-edit/site-edit.service";
import { HowToModalComponent } from "./how-to-modal.component";

@Component({
  selector: "app-how-to",
  styleUrls: ["./how-to.component.sass"],
  templateUrl: "./how-to.component.html",
})
export class HowToComponent implements OnInit, OnDestroy {
  private logger: Logger;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public confirm = new Confirm();
  public members: Member[] = [];
  public memberResources: MemberResource[] = [];
  public filteredMemberResources: MemberResource[] = [];
  public destinationType: string;
  private memberResourceId: string;
  public memberResource: MemberResource;
  private subscription: Subscription;
  private searchChangeObservable: Subject<string>;
  public filterParameters: FilterParameters = {quickSearch: ""};
  private addingNew = false;
  public allow: MemberResourcesPermissions = {};

  constructor(
    private contentMetadataService: ContentMetadataService,
    private memberResourcesReferenceDataService: MemberResourcesReferenceDataService,
    private authService: AuthService,
    private searchFilterPipe: SearchFilterPipe,
    private notifierService: NotifierService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private siteEditService: SiteEditService,
    private apiResponseProcessor: ApiResponseProcessor,
    private memberLoginService: MemberLoginService,
    protected dateUtils: DateUtilsService,
    public memberResourcesService: MemberResourcesService,
    public memberResourcesReferenceData: MemberResourcesReferenceDataService,
    private mailchimpLinkService: MailchimpLinkService,
    private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(HowToComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.authService.authResponse().subscribe(() => this.authChanges());
    this.siteEditService.events.subscribe(() => this.authChanges());
    this.notify.setBusy();
    this.destinationType = "";
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const memberResourceId = paramMap.get("member-resource-id");
      this.logger.debug("memberResourceId from route params:", paramMap, memberResourceId);
      if (memberResourceId) {
        this.memberResourceId = memberResourceId;
      }
    });
    this.filterParameters.filter = this.memberResourcesReferenceData.accessLevelViewTypes()[0];
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.success({
      title: "Finding social events",
      message: "please wait..."
    });
    if (this.memberResourceId) {
      this.logger.debug("memberResourceId from route params:", this.memberResourceId);
      this.memberResourcesService.getById(this.memberResourceId);
    } else {
      this.refreshMemberResources();
    }
    this.searchChangeObservable = new Subject<string>();
    this.searchChangeObservable.pipe(debounceTime(1000))
      .pipe(distinctUntilChanged())
      .subscribe(searchTerm => this.applyFilterToMemberResources(searchTerm));

    this.subscription = this.memberResourcesService.notifications().subscribe((apiResponse: MemberResourceApiResponse) => {
      if (apiResponse.error) {
        this.logger.warn("received error:", apiResponse.error);
        this.notify.error({
          title: "Problem viewing Member Resource",
          message: "Refresh this page to clear this message."
        });
      } else if (this.confirm.notificationsOutstanding()) {
        this.logger.debug("Not processing subscription response due to confirm:", this.confirm.type);
      } else {
        if (apiResponse.action === ApiAction.QUERY && !!this.memberResourceId) {
          this.notify.warning({
            title: "Single Member Resource being viewed",
            message: "Refresh this page to return to normal view."
          });
        }
        this.confirm.clear();
        this.memberResources = this.apiResponseProcessor.processResponse(this.logger, this.memberResources, apiResponse);
        this.applyFilterToMemberResources();
      }
    });
    this.authChanges();
  }

  onSearchChange(searchEntry: string) {
    this.logger.debug("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);

  }

  accessLevelComparer(o1: AccessLevelData, o2: AccessLevelData) {
    return o1?.id === o2?.id;
  }

  accessLevelTracker(expenseType: AccessLevelData) {
    return expenseType?.includeAccessLevelIds;
  }

  applyFilterToMemberResources(searchTerm?: string) {
    this.logger.debug("applyFilterToMemberResources:searchTerm:", searchTerm, "filterParameters.quickSearch:", this.filterParameters.quickSearch);
    this.notify.setBusy();

    const unfilteredMemberResources = this.memberResources
      .filter((memberResource: MemberResource) => {
        if (this.allow.committee) {
          this.logger.debug("this.filterParameters.filter", this.filterParameters.filter);
          return this.filterParameters.filter.includeAccessLevelIds.includes(memberResource.accessLevel);
        } else {
          return this.memberResourcesReferenceData.accessLevelFor(memberResource).filter();
        }
      })
      .sort(sortBy("-resourceDate"));
    this.filteredMemberResources = this.searchFilterPipe.transform(unfilteredMemberResources, this.filterParameters.quickSearch);

    const filteredCount = (this.filteredMemberResources?.length) || 0;
    const totalCount = (unfilteredMemberResources.length) || 0;
    this.notify.progress(`${filteredCount} of ${totalCount} article${totalCount === 1 ? "" : "s"}`);
    this.notify.clearBusy();
  }

  authChanges() {
    this.allow.committee = this.memberLoginService.allowCommittee();
    this.applyFilterToMemberResources();
    this.logger.info("permissions:", this.allow);
  }

  isActive(memberResource) {
    const active = this.siteEditService.active() && this.memberLoginService.memberLoggedIn() && memberResource === this.memberResource;
    if (active) {
      this.logger.debug("isActive =", active, "with memberResource", memberResource);
    }
    return active;
  }

  allowAdd() {
    return this.siteEditService.active() && this.memberLoginService.allowFileAdmin();
  }

  allowEdit(memberResource: MemberResource) {
    return this.allowAdd() && memberResource?.id;
  }

  allowDelete(memberResource) {
    return this.allowEdit(memberResource);
  }

  removeDeleteOrAddOrInProgressFlags() {
    this.confirm.clear();
  }

  delete() {
    this.confirm.toggleOnDeleteConfirm();
  }

  cancelDelete() {
    this.confirm.clear();
  }

  showDeleted() {
    this.notify.success("member resource was deleted successfully");
  }

  confirmDelete() {
    this.notify.setBusy();
    this.memberResourcesService.delete(this.memberResource)
      .then(() => this.confirm.clear())
      .then(() => this.notify.clearBusy());
  }

  selectMemberResource(memberResource) {
    if (!this.addingNew && this.confirm.noneOutstanding() && this.memberResource !== memberResource) {
      this.logger.debug("selectMemberResource with memberResource", memberResource, "addingNew:", this.addingNew);
      this.memberResource = memberResource;
    }
  }

  createModalOptions(initialState?: any): ModalOptions {
    return {
      class: "modal-lg",
      animated: false,
      backdrop: "static",
      ignoreBackdropClick: false,
      keyboard: true,
      focus: true,
      show: true,
      initialState: cloneDeep(initialState)
    };
  }

  edit(memberResource: MemberResource) {
    this.modalService.show(HowToModalComponent, this.createModalOptions({memberResource, confirm: this.confirm}));
  }

  add() {
    this.addingNew = true;
    this.edit(this.memberResourcesReferenceDataService.defaultMemberResource());
  }

  refreshMemberResources() {
    this.memberResourcesService.all();
  }

  refreshAll() {
    this.refreshMemberResources();
  }

  showAlertMessage(): boolean {
    return this.notifyTarget.busy || this.notifyTarget.showAlert;
  }

}
