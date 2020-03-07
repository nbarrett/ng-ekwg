import { Component, OnDestroy, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { ForgotPasswordModalComponent } from "../forgot-password-modal/forgot-password-modal.component";

@Component({
  selector: "app-reset-password-modal-component",
  templateUrl: "./reset-password-modal.component.html",
  styleUrls: ["./reset-password-modal.component.sass"]
})
export class ResetPasswordModalComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private message;
  private notify: AlertInstance;
  private subscription: Subscription;
  public newPassword: string;
  public newPasswordConfirm: string;
  public notifyTarget: AlertTarget = {};
  public userName;

  constructor(public bsModalRef: BsModalRef,
              private modalService: BsModalService,
              private authService: AuthService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              private notifierService: NotifierService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ResetPasswordModalComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logger.debug("constructed");
    if (this.message) {
      this.notify.progress({
        title: "Reset password",
        message: this.message
      });
    }
    this.subscription = this.authService.authResponse().subscribe((loginResponse) => {
      this.logger.info("subscribe:reset password", loginResponse);
      if (loginResponse.memberLoggedIn) {
        this.bsModalRef.hide();
        if (!this.memberLoginService.loggedInMember().profileSettingsConfirmed) {
          return this.urlService.navigateTo("mailing-preferences");
        }
        return true;
      } else {
        this.logger.debug("loginResponse", loginResponse);
        this.notify.showContactUs(true);
        this.notify.error({
          continue: true,
          title: "Reset password failed",
          message: loginResponse.alertMessage
        });
      }
    });
  }

  fieldPopulated(object) {
    return (object || "").length > 0;
  }

  submittable() {
    const userNamePopulated = this.fieldPopulated(this.newPassword);
    const passwordPopulated = this.fieldPopulated(this.newPasswordConfirm);
    return !this.notifyTarget.busy && passwordPopulated && userNamePopulated;
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

  resetPassword() {
    this.notify.showContactUs(false);
    this.notify.setBusy();
    this.notify.progress({
      title: "Reset password",
      message: "Attempting reset of password for " + this.userName
    });
    this.authService.resetPassword(this.userName, this.newPassword, this.newPasswordConfirm);
  }
}