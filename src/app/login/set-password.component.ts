import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../auth/auth.service";
import { AlertTarget } from "../models/alert-target.model";
import { ResetPasswordModalComponent } from "../pages/login/reset-password-modal/reset-password-modal.component";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { MemberService } from "../services/member/member.service";
import { AlertInstance, NotifierService } from "../services/notifier.service";

@Component({
  selector: "app-set-password",
  template: ""
})

export class SetPasswordComponent implements OnInit {
  private logger: Logger;
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};

  constructor(private modalService: BsModalService,
              private notifierService: NotifierService,
              private memberService: MemberService,
              private authService: AuthService,
              private route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SetPasswordComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logger.debug("constructed");
    this.authService.logout();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const passwordResetId = paramMap.get("password-reset-id");
      this.memberService.getMemberByPasswordResetId(passwordResetId)
        .then(member => {
          this.logger.debug("for password-reset-id", passwordResetId, "member", member);
          this.modalService.show(ResetPasswordModalComponent, {
            animated: false,
            initialState: {userName: member.userName}
          });
        })
        .catch(() => {
          this.notify.error({
            continue: true,
            title: "Reset password failed",
            message: "The password reset link you followed has either expired or is invalid. Click Restart Forgot Password to try again"
          });
        });
    });
  }
}
