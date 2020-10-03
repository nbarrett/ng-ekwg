import { Component, OnDestroy, OnInit } from "@angular/core";
import isArray from "lodash-es/isArray";
import sortBy from "lodash-es/sortBy";
import { BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { ApiAction, ApiResponse } from "../../../models/api-response.model";
import { DateValue } from "../../../models/date.model";
import { Member, MemberAuthAudit } from "../../../models/member.model";
import { ASCENDING, DESCENDING, MEMBER_SORT, MemberAuthAuditTableFilter } from "../../../models/table-filtering.model";
import { Confirm, ConfirmType } from "../../../models/ui-actions";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberAuthAuditService } from "../../../services/member/member-auth-audit.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { ProfileService } from "../profile/profile.service";

@Component({
  selector: "app-member-admin",
  templateUrl: "./member-login-audit.component.html"
})
export class MemberLoginAuditComponent implements OnInit, OnDestroy {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  private members: Member[] = [];
  public quickSearch = "";
  private searchChangeObservable: Subject<string>;
  public auditFilter: MemberAuthAuditTableFilter;
  private memberFilterUploaded: any;
  private subscription: Subscription;
  private memberAudits: MemberAuthAudit[] = [];
  public confirm = new Confirm();
  filterDateValue: DateValue;
  private logoutSubscription: Subscription;

  constructor(private memberService: MemberService,
              private contentMetadata: ContentMetadataService,
              private searchFilterPipe: SearchFilterPipe,
              private modalService: BsModalService,
              private notifierService: NotifierService,
              private dateUtils: DateUtilsService,
              private urlService: UrlService,
              private stringUtils: StringUtilsService,
              private authService: AuthService,
              private memberAuthAuditService: MemberAuthAuditService,
              private profileService: ProfileService,
              private memberLoginService: MemberLoginService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberLoginAuditComponent, NgxLoggerLevel.OFF);
    this.searchChangeObservable = new Subject<string>();
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.setBusy();
    this.filterDateValue = this.dateUtils.asDateValue(this.dateUtils.momentNowNoTime().subtract(2, "weeks"));
    this.searchChangeObservable.pipe(debounceTime(250))
      .pipe(distinctUntilChanged())
      .subscribe(searchTerm => this.applyFilterToAudits(searchTerm));
    this.auditFilter = {
      sortField: "loginTime",
      sortFunction: MEMBER_SORT,
      reverseSort: true,
      sortDirection: DESCENDING,
      results: []
    };
    this.logger.debug("this.memberFilter:", this.auditFilter);
    this.logoutSubscription = this.profileService.subscribeToLogout(this.logger);
    this.subscription = this.memberAuthAuditService.notifications().subscribe(apiResponse => {
      if (apiResponse.error) {
        this.logger.warn("received error:", apiResponse.error);
      } else {
        this.addAuditItemsToView(apiResponse);
      }
    });
    this.refreshMembers();
    this.refreshMemberAudit();
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.logoutSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }

  deleteSelectedMemberAudit() {
    this.confirm.type = ConfirmType.DELETE;
  }

  cancelDeleteSelectedMemberAudit() {
    this.confirm.type = ConfirmType.NONE;
  }

  deleteSelectedMemberAuditConfirm() {
    const recordCount = this.auditFilter.results.length;
    this.notifyProgress(`Deleting ${recordCount} member audit record(s)...`);
    const removePromises = this.auditFilter.results.map(record => {
      return this.memberAuthAuditService.delete(record);
    });

    Promise.all(removePromises).then(() => {
      this.notifyProgress(`Deleted ${recordCount} member audit record(s)`);
      this.notify.clearBusy();
      this.cancelDeleteSelectedMemberAudit();
    });
  }

  refreshMemberAudit() {
    this.memberAuthAuditService.all({criteria: {loginTime: {$gte: this.filterDateValue.value}}, sort: {loginTime: -1}});
  }

  private addAuditItemsToView(apiResponse: ApiResponse) {
    const authAudits: MemberAuthAudit[] = isArray(apiResponse.response) ? apiResponse.response : [apiResponse.response];
    this.logger.info("Received", authAudits.length, "member auth audit", apiResponse.action, "notification(s)");
    if (apiResponse.action === ApiAction.QUERY) {
      this.memberAudits = authAudits;
    } else {
      authAudits.forEach(notifiedMemberAuthAudit => {
        const existingMemberAuthAudit: MemberAuthAudit = this.memberAudits.find(member => member.id === notifiedMemberAuthAudit.id);
        if (existingMemberAuthAudit) {
          if (apiResponse.action === ApiAction.DELETE) {
            this.logger.info("deleting", notifiedMemberAuthAudit);
            this.memberAudits = this.memberAudits.filter(member => member.id !== notifiedMemberAuthAudit.id);
          } else {
            this.logger.info("replacing", notifiedMemberAuthAudit);
            this.memberAudits[(this.memberAudits.indexOf(existingMemberAuthAudit))] = notifiedMemberAuthAudit;
          }
        } else {
          this.logger.info("adding", notifiedMemberAuthAudit);
          this.memberAudits.push(notifiedMemberAuthAudit);
        }
      });
    }
    this.applyFilterToAudits();
  }

  onSearchChange(searchEntry: string) {
    this.logger.info("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);
  }

  applyFilterToAudits(searchTerm?: string) {
    this.notify.setBusy();
    const sort = this.auditFilter.sortField;
    this.logger.info("applyFilterToAudits:sort:", sort, "reverseSort:", this.auditFilter.reverseSort);
    const filteredAudits = sortBy(this.searchFilterPipe.transform(this.memberAudits, this.quickSearch), sort);
    this.auditFilter.results = this.auditFilter.reverseSort ? filteredAudits.reverse() : filteredAudits;
    this.logger.info("applyFilterToMembers:searchTerm:", searchTerm, "filterParameters.quickSearch:", this.quickSearch, "filtered", this.memberAudits.length, "members ->", this.auditFilter.results.length, "sort", sort, "this.memberFilter.reverseSort", this.auditFilter.reverseSort);
    this.notifyProgress(`showing ${this.auditFilter.results.length} records`);
    this.notify.clearBusy();
  }

  private notifyProgress(message: string) {
    this.notify.progress({title: "Member login audit", message});
  }

  applySortTo(field, filterSource) {
    this.logger.debug("sorting by field", field, "current value of filterSource", filterSource);
    filterSource.sortField = field;
    filterSource.sortFunction = field === "memberName" ? MEMBER_SORT : field;
    filterSource.reverseSort = !filterSource.reverseSort;
    filterSource.sortDirection = filterSource.reverseSort ? DESCENDING : ASCENDING;
    this.logger.debug("sorting by field", field, "new value of filterSource", filterSource);
    this.applyFilterToAudits();
  }

  sortMembersUploadedBy(field) {
    this.applySortTo(field, this.memberFilterUploaded);
  }

  sortAuditBy(field) {
    this.applySortTo(field, this.auditFilter);
  }

  showAuditColumn(field) {
    return this.auditFilter.sortField === field;
  }

  refreshMembers(): any {
    this.notify.setBusy();
    this.memberService.publicFields()
      .then(refreshedMembers => {
        this.members = refreshedMembers;
        this.logger.info("refreshMembers:found", refreshedMembers.length, "members");
      });
  }

  onFilterDateChange(dateValue: DateValue) {
    this.notify.setBusy();
    this.logger.debug("date change", dateValue, "filterDate:", this.filterDateValue.value);
    this.filterDateValue = dateValue;
    this.notifyProgress("finding audit data...");
    this.refreshMemberAudit();
  }

  backToAdmin() {
    this.urlService.navigateTo("admin");
  }
}
