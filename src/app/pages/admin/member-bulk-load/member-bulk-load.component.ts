import { DOCUMENT } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import cloneDeep from "lodash-es/cloneDeep";
import first from "lodash-es/first";
import groupBy from "lodash-es/groupBy";
import map from "lodash-es/map";
import reduce from "lodash-es/reduce";
import sortBy from "lodash-es/sortBy";
import { FileUploader } from "ng2-file-upload";
import { BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { Member, MemberBulkLoadAudit, MemberUpdateAudit, SessionStatus } from "../../../models/member.model";
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
export class MemberBulkLoadComponent implements OnInit {
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
  public uploader: FileUploader;
  public memberBulkLoadAudits: MemberBulkLoadAudit[] = [];
  public memberUpdateAudits: MemberUpdateAudit[] = [];
  public members: Member[] = [];
  public hasBaseDropZoneOver = false;
  public hasAnotherDropZoneOver = false;
  public quickSearch = "";
  private file: any;
  public memberTabHeading: string;
  public auditTabHeading: string;

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
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberBulkLoadComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.searchChangeObservable = new Subject<string>();
    this.searchChangeObservable.pipe(debounceTime(250))
      .pipe(distinctUntilChanged())
      .subscribe(() => this.filterLists());
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.memberAdminBaseUrl = this.contentMetadata.baseUrl("memberAdmin");
    this.uploader = new FileUploader({url: "api/ramblers/monthly-reports/upload"});
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
      this.logger.debug("found:memberBulkLoadAuditService", memberBulkLoadAudits);
      this.memberBulkLoadAudits = memberBulkLoadAudits;
      this.uploadSession = first(this.memberBulkLoadAudits);
      this.uploadSessionChanged();
    });
  }

  private filterLists(searchTerm?: string) {
    this.applyFilterToList(this.filters.membersUploaded, this.uploadSession.members);
    this.applyFilterToList(this.filters.memberUpdateAudit, this.memberUpdateAudits);
    this.updateTabHeadings();
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }

  currentMemberBulkLoadDisplayDate() {
    this.dateUtils.currentMemberBulkLoadDisplayDate();
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
    this.applySortTo(field, this.filters.memberUpdateAudit, this.uploadSession.members);
  }

  memberUpdateAuditSummary() {
    return this.auditSummaryFormatted(this.auditSummary());
  }

  // uploadedFile() {
  //   return this.uploader.addToQueue(file)
  //
  //     .then(bulkUploadRamblersResponse, this.resetSendFlagsAndNotifyError, bulkUploadRamblersProgress)
  //     .then(refreshMemberBulkLoadAudit)
  //     .then(refreshMemberUpdateAudit)
  //     .then(validateBulkUploadProcessingBeforeMailchimpUpdates)
  //     .catch(this.resetSendFlagsAndNotifyError);
  // }

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

  applyFilterToList(filterSource: TableFilter, unfilteredList: any[]) {
    this.notify.setBusy();
    const filter = filterSource.selectedFilter;
    const sort = filterSource.sortField;
    const filteredResults = sortBy(this.searchFilterPipe.transform(unfilteredList, this.quickSearch), sort);
    filterSource.results = filterSource.reverseSort ? filteredResults.reverse() : filteredResults;
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
        this.logger.debug("queried", memberUpdateAudits, "member update audit records:");
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

  refreshMemberBulkLoadAudit() {
    if (this.memberLoginService.allowMemberAdminEdits()) {
      return this.memberBulkLoadAuditService.all({
        sort: {createdDate: -1}
      }).then(uploadSessions => {
        this.logger.debug("refreshed", uploadSessions && uploadSessions.length, "upload sessions");
        this.memberBulkLoadAudits = uploadSessions;
        this.uploadSession = first(uploadSessions);
        this.filterLists();
        return this.uploadSession;
      });
    } else {
      return Promise.resolve(true);
    }
  }

  auditSummary() {
    return groupBy(this.filters.memberUpdateAudit.results, auditItem => auditItem.memberAction || "unknown");
  }

  auditSummaryFormatted(auditSummary) {

    const total = reduce(auditSummary, (memo, value) => memo + value.length, 0);

    const summary = map(auditSummary, (items, key) => `${items.length}:${key}`).join(", ");

    return `${total} Member audits ${total ? `(${summary})` : ""}`;
  }

  validateBulkUploadProcessingBeforeMailchimpUpdates() {
    this.logger.debug("validateBulkUploadProcessing:this.uploadSession", this.uploadSession);
    if (this.uploadSession.error) {
      this.notify.error({title: "Bulk upload failed", message: this.uploadSession.error});
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

  bulkUploadRamblersDataOpenFile(file) {
    if (file) {
      const fileUpload = file;
      this.notify.setBusy();

      //   this.uploadedFile = this.upload({
      //     url: "api/ramblers/monthly-reports/upload",
      //     method: "POST",
      //     file
      //   }).then(this.bulkUploadRamblersResponse)
      //     .then(refreshMemberBulkLoadAudit)
      //     .then(refreshMemberUpdateAudit)
      //     .then(validateBulkUploadProcessingBeforeMailchimpUpdates)
      //     .catch(this.resetSendFlagsAndNotifyError);
      // }
    }
  }

  resetSendFlagsAndNotifyError(error) {
    this.notify.clearBusy();
    this.notify.error(error);
  }

  bulkUploadRamblersResponse(memberBulkLoadServerResponse) {
    return this.memberBulkUploadService.processMembershipRecords(this.file, memberBulkLoadServerResponse, this.members, this.notify);
  }

  // bulkUploadRamblersProgress(evt) {
  //   fileUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
  //   this.logger.debug("bulkUploadRamblersProgress:progress event", evt);
  // }

  bulkUploadRamblersDataStart() {
    this.document.getElementById("select-bulk-load-file")
      .getElementsByTagName("button")[0].click();
  }
}
