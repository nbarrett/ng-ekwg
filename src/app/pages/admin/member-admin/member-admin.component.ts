import { Component, OnDestroy, OnInit } from "@angular/core";
import isArray from "lodash-es/isArray";
import sortBy from "lodash-es/sortBy";
import { BsModalService, ModalOptions } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { ApiResponse } from "../../../models/api-response.model";
import { Member } from "../../../models/member.model";
import { ASCENDING, DESCENDING, MEMBER_SORT, SELECT_ALL, TableFilter } from "../../../models/table-filtering.model";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpListUpdaterService } from "../../../services/mailchimp/mailchimp-list-updater.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { LoginModalComponent } from "../../login/login-modal/login-modal.component";
import { MemberAdminModalComponent } from "../member-admin-modal/member-admin-modal.component";

@Component({
  selector: "app-member-admin",
  templateUrl: "./member-admin.component.html",
  styleUrls: ["./member-admin.component.sass"]
})
export class MemberAdminComponent implements OnInit, OnDestroy {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  private memberAdminBaseUrl: string;
  private today: number;
  private members: Member[] = [];
  public quickSearch = "";
  private searchChangeObservable: Subject<string>;
  public memberFilter: TableFilter;

  private memberFilterUploaded: any;
  public listsUpdating: boolean;
  filters: any;
  private subscription: Subscription;

  constructor(private memberService: MemberService,
              private contentMetadata: ContentMetadataService,
              private searchFilterPipe: SearchFilterPipe,
              private modalService: BsModalService,
              private notifierService: NotifierService,
              private dateUtils: DateUtilsService,
              private urlService: UrlService,
              private emailSubscriptionService: EmailSubscriptionService,
              private mailchimpListUpdaterService: MailchimpListUpdaterService,
              private stringUtils: StringUtilsService,
              private authService: AuthService,
              private broadcastService: BroadcastService,
              private memberLoginService: MemberLoginService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberAdminComponent, NgxLoggerLevel.DEBUG);
    this.searchChangeObservable = new Subject<string>();
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.setBusy();
    this.memberAdminBaseUrl = this.contentMetadata.baseUrl("memberAdmin");
    this.today = this.dateUtils.momentNowNoTime().valueOf();
    this.searchChangeObservable.pipe(debounceTime(250))
      .pipe(distinctUntilChanged())
      .subscribe(searchTerm => this.applyFilterToMembers(searchTerm));
    this.memberLoginService.showLoginPromptWithRouteParameter("expenseId");
    this.memberFilter = {
      sortField: "memberName",
      sortFunction: MEMBER_SORT,
      reverseSort: false,
      sortDirection: ASCENDING,
      results: [],
      availableFilters: [
        {
          title: "Active Group Member", group: "Group Settings", filter: member => member.groupMember
        },
        {
          title: "All Members", filter: SELECT_ALL
        },
        {
          title: "Active Social Member", group: "Group Settings", filter: this.memberService.filterFor.SOCIAL_MEMBERS
        },
        {
          title: "Membership Date Active/Not set",
          group: "From Ramblers Supplied Datas",
          filter: member => !member.membershipExpiryDate || (member.membershipExpiryDate >= this.today)
        },
        {
          title: "Membership Date Expired", group: "From Ramblers Supplied Data", filter: member => member.membershipExpiryDate < this.today
        },
        {
          title: "Not received in last Ramblers Bulk Load",
          group: "From Ramblers Supplied Data",
          filter: member => !member.receivedInLastBulkLoad
        },
        {
          title: "Was received in last Ramblers Bulk Load",
          group: "From Ramblers Supplied Data",
          filter: member => member.receivedInLastBulkLoad
        },
        {
          title: "Password Expired", group: "Other Settings", filter: member => member.expiredPassword
        },
        {
          title: "Walk Admin", group: "Administrators", filter: member => member.walkAdmin
        },
        {
          title: "Walk Change Notifications", group: "Administrators", filter: member => member.walkChangeNotifications
        },
        {
          title: "Social Admin", group: "Administrators", filter: member => member.socialAdmin
        },
        {
          title: "Member Admin", group: "Administrators", filter: member => member.memberAdmin
        },
        {
          title: "Finance Admin", group: "Administrators", filter: member => member.financeAdmin
        },
        {
          title: "File Admin", group: "Administrators", filter: member => member.fileAdmin
        },
        {
          title: "Treasury Admin", group: "Administrators", filter: member => member.treasuryAdmin
        },
        {
          title: "Content Admin", group: "Administrators", filter: member => member.contentAdmin
        },
        {
          title: "Committee Member", group: "Administrators", filter: member => member.committee
        },
        {
          title: "Subscribed to the General emails list",
          group: "Email Subscriptions",
          filter: this.memberService.filterFor.GENERAL_MEMBERS_SUBSCRIBED
        },
        {
          title: "Subscribed to the Walks email list",
          group: "Email Subscriptions",
          filter: this.memberService.filterFor.WALKS_MEMBERS_SUBSCRIBED
        },
        {
          title: "Subscribed to the Social email list",
          group: "Email Subscriptions",
          filter: this.memberService.filterFor.SOCIAL_MEMBERS_SUBSCRIBED
        }
      ]
    };
    this.memberFilter.selectedFilter = this.memberFilter.availableFilters[0];
    this.logger.debug("this.memberFilter:", this.memberFilter);
    this.subscription = this.memberService.notifications().subscribe(apiResponse => {
      if (apiResponse.error) {
        this.logger.warn("received error:", apiResponse.error);
      } else {
        this.addMembersToView(apiResponse);
      }
    });
    this.refreshMembers();
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  private addMembersToView(apiResponse: ApiResponse) {
    const members: Member[] = isArray(apiResponse.response) ? apiResponse.response : [apiResponse.response];
    this.logger.info("Received", members.length, "member", apiResponse.action, "notification(s)");
    if (apiResponse.action === "query") {
      this.members = members;
    } else {
      members.forEach(notifiedMember => {
        const existingMember: Member = this.members.find(member => member.id === notifiedMember.id);
        if (existingMember) {
          if (apiResponse.action === "delete") {
            this.logger.info("deleting", notifiedMember);
            this.members = this.members.filter(member => member.id !== notifiedMember.id);
          } else {
            this.logger.info("replacing", notifiedMember);
            this.members[(this.members.indexOf(existingMember))] = notifiedMember;
          }
        } else {
          this.logger.info("adding", notifiedMember);
          this.members.push(notifiedMember);
        }
      });
    }
    this.applyFilterToMembers();
  }

  onSearchChange(searchEntry: string) {
    this.logger.info("received searchEntry:" + searchEntry);
    this.searchChangeObservable.next(searchEntry);
  }

  applyFilterToMembers(searchTerm?: string) {
    this.notify.setBusy();
    const filter = this.memberFilter.selectedFilter.filter;
    const sort = this.memberFilter.sortFunction;
    this.logger.info("applyFilterToMembers:filter:", filter, "sort:", sort, "reverseSort:", this.memberFilter.reverseSort);
    const members = sortBy(this.searchFilterPipe.transform(this.members.filter(filter), this.quickSearch), sort);
    this.memberFilter.results = this.memberFilter.reverseSort ? members.reverse() : members;
    this.logger.info("applyFilterToMembers:searchTerm:", searchTerm, "filterParameters.quickSearch:", this.quickSearch, "filtered", this.members.length, "members ->", this.memberFilter.results.length, "sort", sort, "this.memberFilter.reverseSort", this.memberFilter.reverseSort);
    this.notify.clearBusy();
  }

  showMemberDialog(member, memberEditMode) {
    this.logger.debug("showMemberDialog:", memberEditMode, member);
    const config: ModalOptions = {
      class: "modal-lg",
      animated: false,
      show: true,
      initialState: {
        memberEditMode, member, members: this.members
      }
    };
    this.modalService.show(MemberAdminModalComponent, config);
  }

  showArea(area) {
    this.urlService.navigateTo("admin", area);
  }

  showSendEmailsDialog() {
    // change this to MemberAdminSendEmailsComponent
    this.modalService.show(LoginModalComponent);
  }

  applySortTo(field, filterSource) {
    this.logger.debug("sorting by field", field, "current value of filterSource", filterSource);
    filterSource.sortField = field;
    filterSource.sortFunction = field === "memberName" ? MEMBER_SORT : field;
    filterSource.reverseSort = !filterSource.reverseSort;
    filterSource.sortDirection = filterSource.reverseSort ? DESCENDING : ASCENDING;
    this.logger.debug("sorting by field", field, "new value of filterSource", filterSource);
    this.applyFilterToMembers();
  }

  sortMembersUploadedBy(field) {
    this.applySortTo(field, this.memberFilterUploaded);
  }

  sortMembersBy(field) {
    this.applySortTo(field, this.memberFilter);
  }

  showMembersColumn(field) {
    return this.memberFilter.sortField === field;
  }

  addMember() {
    const member: Member = {};
    this.emailSubscriptionService.defaultMailchimpSettings(member, true);
    member.groupMember = true;
    member.socialMember = true;
    this.showMemberDialog(member, "Add New");
  }

  editMember(member) {
    this.showMemberDialog(member, "Edit Existing");
  }

  refreshMembers(memberFilter?: any) {
    this.logger.info("refreshMembers:this.memberFilter.filterSelection", this.memberFilter.selectedFilter, "passed memberFilter:", memberFilter);
    if (memberFilter) {
      this.memberFilter.selectedFilter = memberFilter;
    }
    if (this.memberLoginService.allowMemberAdminEdits()) {
      this.notify.setBusy();
      return this.memberService.all()
        .then(refreshedMembers => {
          this.members = refreshedMembers;
          this.logger.info("refreshMembers:found", refreshedMembers.length, "members");
          this.applyFilterToMembers();
          return this.members;
        });
    }
  }

  updateMailchimpLists() {
    this.mailchimpListUpdaterService.updateMailchimpLists(this.notify, this.members);
  }
}