import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { faBook, faCashRegister, faEnvelopeOpenText, faIdCard, faMailBulk, faUnlockAlt, faUser, faUsersCog } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { LoginResponse } from "../../../models/member.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.sass"],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AdminComponent implements OnInit, OnDestroy {
  faIdCard = faIdCard;
  faUnlockAlt = faUnlockAlt;
  faEnvelopeOpenText = faEnvelopeOpenText;
  faCashRegister = faCashRegister;
  faUsersCog = faUsersCog;
  faMailBulk = faMailBulk;
  faBook = faBook;
  faUser = faUser;
  private logger: Logger;
  private subscription: Subscription;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public loggedIn: boolean;
  public allowAdminEdits: boolean;
  itemCols: number;

  constructor(private memberLoginService: MemberLoginService,
              private notifierService: NotifierService,
              private authService: AuthService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AdminComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.setPrivileges();
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => this.setPrivileges(loginResponse));
  }

  private setPrivileges(loginResponse?: LoginResponse) {
    this.allowAdminEdits = this.memberLoginService.allowMemberAdminEdits();
    this.loggedIn = this.memberLoginService.memberLoggedIn();
    this.logger.debug(loginResponse, "setPrivileges:allowAdminEdits", this.allowAdminEdits, "this.loggedIn", this.loggedIn);
  }

  memberAdmin() {
    this.urlService.navigateTo("admin", "member-admin");
  }

  expensese() {
    this.urlService.navigateTo("admin", "expenses");
  }

  bulkLoadAudit() {
    this.urlService.navigateTo("admin", "member-bulk-load");
  }

  memberLoginAudit() {
    this.urlService.navigateTo("admin", "member-login-audit");
  }

  contactDetails() {
    this.urlService.navigateTo("admin", "contact-details");
  }

  changePassword() {
    this.urlService.navigateTo("admin", "change-password");

  }

  emailSubscriptions() {
    this.urlService.navigateTo("admin", "email-subscriptions");
  }
}
