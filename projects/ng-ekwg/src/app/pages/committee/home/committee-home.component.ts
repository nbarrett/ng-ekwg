import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile } from "../../../models/committee.model";
import { LoginResponse, Member } from "../../../models/member.model";
import { Confirm } from "../../../models/ui-actions";
import { CommitteeFileService } from "../../../services/committee/committee-file.service";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-committee-home",
  templateUrl: "./committee-home.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeHomeComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private subscription: Subscription;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public allowAdminEdits: boolean;
  private destinationType: string;
  public members: Member[];
  private selected: { committeeFile?: CommitteeFile, committeeFiles: CommitteeFile[] };
  public confirm = new Confirm();

  constructor(private memberLoginService: MemberLoginService,
              private memberService: MemberService,
              private notifierService: NotifierService,
              private authService: AuthService,
              private urlService: UrlService,
              private dateUtils: DateUtilsService,
              private committeeFileService: CommitteeFileService,
              private committeeQueryService: CommitteeQueryService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeHomeComponent, NgxLoggerLevel.OFF);
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => this.setPrivileges(loginResponse));
    this.destinationType = "";
    this.selected = {
      committeeFiles: []
    };
    this.refreshAll();
  }

  private setPrivileges(loginResponse?: LoginResponse) {
    this.allowAdminEdits = this.memberLoginService.allowMemberAdminEdits();
    this.refreshAll();
  }

  showCommitteeFileDeleted() {
    return this.notify.success("File was deleted successfully");
  }

  refreshMembers() {
    if (this.memberLoginService.allowFileAdmin()) {
      return this.memberService.all()
        .then(members => this.members = members);

    }
  }

  refreshAll() {
    this.refreshMembers();
  }

  showAlertMessage(): boolean {
    return this.notifyTarget.busy || this.notifyTarget.showAlert;
  }

}
