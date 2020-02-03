import { Component, OnDestroy, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { ForgotPasswordModalComponent } from "../forgot-password-modal/forgot-password-modal.component";
import { ResetPasswordModalComponent } from "../reset-password-modal/reset-password-modal.component";

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

  constructor(public bsModalRef: BsModalRef,
              private modalService: BsModalService,
              private authService: AuthService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              private notifierService: NotifierService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginModalComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logger.debug("constructed");
    this.subscription = this.authService.authResponse().subscribe((loginResponse) => {
      this.logger.info("subscribe:loginResponse", loginResponse);
      if (loginResponse.memberLoggedIn) {
        this.bsModalRef.hide();
        if (!this.memberLoginService.loggedInMember().profileSettingsConfirmed) {
          return this.urlService.navigateTo("mailing-preferences");
        }
        return true;
      } else if (loginResponse.showResetPassword) {
        this.modalService.show(ResetPasswordModalComponent, {
          animated: false,
          initialState: {
            userName: this.userName,
            message: "Your password has expired, therefore you need to reset it to a new one before continuing."
          }
        });
        this.close();
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
    this.close();
    this.modalService.show(ForgotPasswordModalComponent, {
      animated: false
    });
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
    this.authService.login(this.userName, this.password);
  }
}
