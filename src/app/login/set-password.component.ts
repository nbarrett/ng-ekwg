import { Component, Inject, OnInit } from "@angular/core";
import { MemberLoginService } from "../services/member-login.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { ActivatedRoute, ParamMap } from "@angular/router";
import isEmpty from "lodash-es/isEmpty";

@Component({
  selector: "app-set-password",
  templateUrl: "../shared/non-rendering.component.html"
})

export class SetPasswordComponent implements OnInit {
  private logger: Logger;

  constructor(@Inject("AuthenticationModalsService") private authenticationModalsService,
              private memberLoginService: MemberLoginService,
              private route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SetPasswordComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.memberLoginService.getMemberByPasswordResetId(paramMap.get("password-reset-id"))
        .then(member => {
          this.logger.debug("for password-reset-id", paramMap.get("password-reset-id"), "member", member);
          if (isEmpty(member)) {
            this.authenticationModalsService.showResetPasswordFailedDialog();
          } else {
            this.authenticationModalsService.showResetPasswordModal(member.userName);
          }
        });
    });
  }
}
