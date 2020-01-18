import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthenticationModalsService } from "../../../ajs-upgraded-providers";
import { AlertTarget } from "../../../models/alert-target.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-login-modal-component",
  templateUrl: "./login-modal.component.html",
  styleUrls: ["./login-modal.component.sass"]
})
export class LoginModalComponent implements OnInit, OnDestroy {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  userName: string;
  password: string;
  private subscription: Subscription;

  constructor(@Inject("AuthenticationModalsService") private AuthenticationModalsService,
              public bsModalRef: BsModalRef,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              private notifierService: NotifierService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginModalComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logger.debug("constructed");
    this.subscription = this.memberLoginService.loginResponseObservable().subscribe((loginResponse) => {
      this.logger.info("subscribe:loginResponse", loginResponse);
      if (loginResponse.memberLoggedIn) {
        this.bsModalRef.hide();
        if (!this.memberLoginService.loggedInMember().profileSettingsConfirmed) {
          return this.urlService.navigateTo("mailing-preferences");
        }
        return true;
      } else if (loginResponse.showResetPassword) {
        return this.AuthenticationModalsService.showResetPasswordModal(this.userName, "Your password has expired, therefore you need to reset it to a new one before continuing.");
      } else {
        this.logger.debug("loginResponse", loginResponse);
        this.notify.showContactUs(true);
        this.notify.error({
          continue: true,
          title: "Login failed",
          message: loginResponse.alertMessage
        });
      }
    });
  }

  fieldPopulated(object) {
    return (object || "").length > 0;
  }

  submittable() {
    const userNamePopulated = this.fieldPopulated(this.userName);
    const passwordPopulated = this.fieldPopulated(this.password);
    return passwordPopulated && userNamePopulated;
  }

  forgotPassword() {
    this.urlService.navigateTo("forgot-password");
  }

  close() {
    this.bsModalRef.hide();
  }

  login() {
    this.notify.showContactUs(false);
    this.notify.setBusy();
    this.notify.progress({
      title: "Logging in",
      message: "using credentials for " + this.userName + " - please wait"
    });
    this.memberLoginService.login(this.userName, this.password);
  }
}
