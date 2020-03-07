import { DOCUMENT } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import cloneDeep from "lodash-es/cloneDeep";
import first from "lodash-es/first";
import groupBy from "lodash-es/groupBy";
import map from "lodash-es/map";
import reduce from "lodash-es/reduce";
import sortBy from "lodash-es/sortBy";
import { FileUploader } from "ng2-file-upload";
import { BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { Member, MemberBulkLoadAudit, MemberBulkLoadAuditApiResponse, MemberUpdateAudit, SessionStatus } from "../../../models/member.model";
import { ASCENDING, DESCENDING, TableFilter } from "../../../models/table-filtering.model";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpListUpdaterService } from "../../../services/mailchimp/mailchimp-list-updater.service";
import { MemberBulkLoadAuditService } from "../../../services/member/member-bulk-load-audit.service";
import { MemberBulkLoadService } from "../../../services/member/member-bulk-load.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberUpdateAuditService } from "../../../services/member/member-update-audit.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { MemberAdminModalComponent } from "../member-admin-modal/member-admin-modal.component";

@Component({
  selector: "app-bulk-load",
  templateUrl: "./member-bulk-load.component.html",
  styleUrls: ["./member-bulk-load.component.sass"]
})
export class MemberBulkLoadComponent implements OnInit, OnDestroy {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  private memberAdminBaseUrl: string;
  private searchChangeObservable: Subject<string>;
  private uploadSessionStatuses: SessionStatus[];
  public uploadSession: MemberBulkLoadAudit;
  public filters: {
    membersUploaded: TableFilter;
    memberUpdateAudit: TableFilter;
  };
  public fileUploader: FileUploader = new FileUploader({
    url: "api/ramblers/monthly-reports/upload",
    disableMultipart: false,
    autoUpload: true,
    authTokenHeader: "Authorization",
    authToken: `Bearer ${this.authService.authToken()}`,
    formatDataFunctionIsAsync: false,
  });
  public memberBulkLoadAudits: MemberBulkLoadAudit[] = [];
  public memberUpdateAudits: MemberUpdateAudit[] = [];
  public members: Member[] = [];
  public hasFileOver = false;
  public quickSearch = "";
  public memberTabHeading: string;
  public auditTabHeading: string;
  private subscription: Subscription;

  constructor(@Inject(DOCUMENT) private document: Document,
              @Inject("MailchimpListService") private mailchimpListService,
              private contentMetadata: ContentMetadataService,
              private memberBulkUploadService: MemberBulkLoadService,
              private memberService: MemberService,
              private searchFilterPipe: SearchFilterPipe,
              private memberUpdateAuditService: MemberUpdateAuditService,
              private memberBulkLoadAuditService: MemberBulkLoadAuditService,
              private notifierService: NotifierService,
              private modalService: BsModalService,
              private dateUtils: DateUtilsService,
              private mailchimpListUpdaterService: MailchimpListUpdaterService,
              private urlService: UrlService,
              private emailSubscriptionService: EmailSubscriptionService,
              private stringUtils: StringUtilsService,
              private authService: AuthService,
              private broadcastService: BroadcastService,
              private memberLoginService: MemberLoginService,
              private route: ActivatedRoute,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberBulkLoadComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.subscription = this.authService.authResponse().subscribe((loginResponse) => {
      this.logger.debug("loginResponse", loginResponse);
      this.urlService.navigateTo("admin");
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const tab = paramMap.get("tab");
      this.logger.info("tab is", tab);
    });

    this.searchChangeObservable = new Subject<string>();
    this.searchChangeObservable.pipe(debounceTime(250))
      .pipe(distinctUntilChanged())
      .subscribe(() => this.filterLists());
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.memberAdminBaseUrl = this.contentMetadata.baseUrl("memberAdmin");
    this.fileUploader.response.subscribe((response: string | HttpErrorResponse) => {
      this.logger.debug("response", response, "type", typeof response);
      if (response instanceof HttpErrorResponse) {
        this.notify.error({title: "Upload failed", message: response.error});
      } else if (response === "Unauthorized") {
        this.notify.error({title: "Upload failed", message: response + " - try logging out and logging back in again and trying this again."});
      } else {
        const memberBulkLoadAuditApiResponse: MemberBulkLoadAuditApiResponse = JSON.parse(response);
        this.logger.info("received response", memberBulkLoadAuditApiResponse);
        this.memberBulkUploadService.processResponse(memberBulkLoadAuditApiResponse, this.members, this.notify)
          .then(() => this.refreshMemberBulkLoadAudit())
          .then(() => this.refreshMemberUpdateAudit())
          .then(() => this.validateBulkUploadProcessingBeforeMailchimpUpdates(memberBulkLoadAuditApiResponse))
          .catch((error) => this.resetSendFlagsAndNotifyError(error));

      }
    });

    this.uploadSessionStatuses = [
      {title: "All"},
      {status: "created", title: "Created"},
      {status: "summary", title: "Summary"},
      {status: "skipped", title: "Skipped"},
      {status: "updated", title: "Updated"},
      {status: "error", title: "Error"}];

    this.filters = {
      memberUpdateAudit: {
        query: this.uploadSessionStatuses[0],
        sortFunction: "updateTime",
        sortField: "updateTime",
        availableFilters: [],
        reverseSort: true,
        sortDirection: DESCENDING,
        results: [],
      },
      membersUploaded: {
        query: "",
        sortFunction: "email",
        sortField: "email",
        reverseSort: true,
        sortDirection: DESCENDING,
        results: [],
      }
    };

    this.memberService.all().then(members => {
      this.logger.debug("found:members", members.length);
      this.members = members;
    });

    this.memberBulkLoadAuditService.all({
      sort: {createdDate: -1}
    }).then(memberBulkLoadAudits => {
      this.logger.debug("found", memberBulkLoadAudits.length, "memberBulkLoadAudits");
      this.memberBulkLoadAudits = memberBulkLoadAudits;
      this.uploadSession = first(this.memberBulkLoadAudits);
      this.uploadSessionChanged();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private filterLists(searchTerm?: string) {
    this.applyFilterToList(this.filters.membersUploaded, this.uploadSession.members);
    this.applyFilterToList(this.filters.memberUpdateAudit, this.memberUpdateAudits);
    this.updateTabHeadings();
  }

  public fileOver(e: any): void {
    this.hasFileOver = e;
  }

  currentMemberBulkLoadDisplayDate() {
    return this.dateUtils.currentMemberBulkLoadDisplayDate();
  }

  onSearchChange(searchEntry: string) {
    this.logger.info("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);
  }

  createMemberFromAudit(memberFromAudit) {
    const member = cloneDeep(memberFromAudit);
    this.emailSubscriptionService.defaultMailchimpSettings(member, true);
    member.groupMember = true;
    this.modalService.show(MemberAdminModalComponent, {
      class: "modal-lg",
      show: true,
      initialState: {
        memberEditMode: "Add New",
        member,
        members: this.members,
      }
    });
    this.notify.warning({
      title: "Recreating Member",
      message: "Note that clicking Save immediately on this member is likely to cause the same error to occur as was originally logged in the audit. Therefore make the necessary changes here to allow the member record to be saved successfully"
    });
  }

  showMemberUpdateAuditColumn(field) {
    return this.filters.memberUpdateAudit.sortField.startsWith(field);
  }

  showMembersUploadedColumn(field) {
    return this.filters.membersUploaded.sortField === field;
  }

  sortMemberUpdateAuditBy(field) {
    this.applySortTo(field, this.filters.memberUpdateAudit, this.memberUpdateAudits);
  }

  memberUpdateAuditSummary() {
    return this.auditSummaryFormatted(this.auditSummary());
  }

  toGlyphicon(status) {
    if (status === "created") {
      return "glyphicon glyphicon-plus green-icon";
    }
    if (status === "complete" || status === "summary") {
      return "glyphicon-ok green-icon";
    }
    if (status === "success") {
      return "glyphicon-ok-circle green-icon";
    }
    if (status === "info") {
      return "glyphicon-info-sign blue-icon";
    }
    if (status === "updated") {
      return "glyphicon glyphicon-pencil green-icon";
    }
    if (status === "error") {
      return "glyphicon-remove-circle red-icon";
    }
    if (status === "skipped") {
      return "glyphicon glyphicon-thumbs-up green-icon";
    }
  }

  applySortTo(field, filterSource: TableFilter, unfilteredList: any[]) {
    this.logger.debug("sorting by field", field, "current value of filterSource", filterSource);
    filterSource.sortField = field;
    filterSource.sortFunction = field;
    filterSource.reverseSort = !filterSource.reverseSort;
    filterSource.sortDirection = filterSource.reverseSort ? DESCENDING : ASCENDING;
    this.logger.debug("sorting by field", field, "new value of filterSource", filterSource);
    this.applyFilterToList(filterSource, unfilteredList);
  }

  applyFilterToList(filter: TableFilter, unfilteredList: any[]) {
    this.notify.setBusy();
    const filteredResults = sortBy(this.searchFilterPipe.transform(unfilteredList, this.quickSearch), filter.sortField);
    filter.results = filter.reverseSort ? filteredResults.reverse() : filteredResults;
    this.notify.clearBusy();
  }

  deleteMemberUpdateAudit(filteredMemberUpdateAudit) {
    this.removeAllRecordsAndRefresh(filteredMemberUpdateAudit, this.refreshMemberUpdateAudit, "member update audit");
  }

  removeAllRecordsAndRefresh(records, refreshFunction, type) {
    this.notify.success("Deleting " + records.length + " " + type + " record(s)");
    const removePromises = records.map(record => this.memberService.delete(record));

    Promise.all(removePromises).then(() => {
      this.notify.success("Deleted " + records.length + " " + type + " record(s)");
      refreshFunction.apply();
    });
  }

  refreshMemberUpdateAudit(): Promise<MemberUpdateAudit[]> {
    if (this.uploadSession && this.uploadSession.id) {
      const uploadSessionId = this.uploadSession.id;
      const criteria: any = {uploadSessionId};
      if (this.filters.memberUpdateAudit.query.status) {
        criteria.memberAction = this.filters.memberUpdateAudit.query.status;
      }
      this.logger.debug("querying member audit records with", criteria);
      return this.memberUpdateAuditService.all({criteria, sort: {updateTime: -1}}).then(memberUpdateAudits => {
        this.memberUpdateAudits = memberUpdateAudits;
        this.logger.debug("queried", memberUpdateAudits.length, "member update audit records:", memberUpdateAudits);
        this.filterLists();
        return this.memberUpdateAudits;
      });
    } else {
      this.memberUpdateAudits = [];
      this.logger.debug("no member audit records");
      return Promise.resolve(this.memberUpdateAudits);
    }
  }

  private updateTabHeadings() {
    this.auditTabHeading = this.memberUpdateAuditSummary();
    this.memberTabHeading = (this.filters.membersUploaded.results.length || 0) + " Members uploaded";
  }

  uploadSessionChanged() {
    this.notify.setBusy();
    this.notify.hide();
    this.logger.debug("upload session:", this.uploadSession);
    this.refreshMemberUpdateAudit().then(() => this.notify.clearBusy());
  }

  sortMembersUploadedBy(field) {
    this.applySortTo(field, this.filters.membersUploaded, this.uploadSession.members);
  }

  refreshMemberBulkLoadAudit(): Promise<any> {
    return this.memberBulkLoadAuditService.all({
      sort: {createdDate: -1}
    }).then(uploadSessions => {
      this.logger.debug("refreshed", uploadSessions && uploadSessions.length, "upload sessions");
      this.memberBulkLoadAudits = uploadSessions;
      this.uploadSession = first(uploadSessions);
      this.filterLists();
      return true;
    });
  }

  auditSummary() {
    return groupBy(this.filters.memberUpdateAudit.results, auditItem => auditItem.memberAction || "unknown");
  }

  auditSummaryFormatted(auditSummary) {

    const total = reduce(auditSummary, (memo, value) => memo + value.length, 0);

    const summary = map(auditSummary, (items, key) => `${items.length}:${key}`).join(", ");

    return `${total} Member audits ${total ? `(${summary})` : ""}`;
  }

  validateBulkUploadProcessingBeforeMailchimpUpdates(apiResponse: MemberBulkLoadAuditApiResponse) {
    this.logger.debug("validateBulkUploadProcessing:this.uploadSession", apiResponse);
    if (apiResponse.error) {
      this.notify.error({title: "Bulk upload failed", message: apiResponse.error});
    } else {
      const summary = this.auditSummary();
      const summaryFormatted = this.auditSummaryFormatted(summary);
      this.logger.debug("summary", summary, "summaryFormatted", summaryFormatted);
      if (summary.error) {
        this.notify.error({
          title: "Bulk upload was not successful",
          message: "One or more errors occurred - " + summaryFormatted
        });
        return false;
      } else {
        return this.mailchimpListUpdaterService.updateMailchimpLists(this.notify, this.members);
      }
    }
  }

  resetSendFlagsAndNotifyError(error) {
    this.notify.clearBusy();
    this.logger.error(error);
    this.notify.error(error);
  }

  bulkUploadRamblersResponse(memberBulkLoadServerResponse) {
    return this.memberBulkUploadService.processResponse(memberBulkLoadServerResponse, this.members, this.notify);
  }

  bulkUploadRamblersDataStart() {
    const elementById: HTMLElement = this.document.getElementById("select-bulk-load-file");
    this.logger.info("bulkUploadRamblersDataStart:elementById", elementById);
    elementById.click();
  }
}