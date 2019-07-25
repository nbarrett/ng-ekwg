import { Component, Inject, OnInit } from "@angular/core";
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
              @Inject("LoggedInMemberService") private loggedInMemberService,
              private route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SetPasswordComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.loggedInMemberService.getMemberByPasswordResetId(paramMap.get("password-reset-id"))
        .then(member => {
          this.logger.info("for password-reset-id", paramMap.get("password-reset-id"), "member", member);
          if (isEmpty(member)) {
            this.authenticationModalsService.showResetPasswordFailedDialog();
          } else {
            this.authenticationModalsService.showResetPasswordModal(member.userName);
          }
        });
    });
  }
}

// http://localhost:4200/set-password/0493fc1e-3078-4534-bb6d-26b4891d3bd3
// case "/set-password":
// return LoggedInMemberService.getMemberByPasswordResetId($routeParams.passwordResetId)
//   .then(function (member) {
//     logger.info("for $routeParams.passwordResetId", $routeParams.passwordResetId, "member", member);
//     if (_.isEmpty(member)) {
//       return AuthenticationModalsService.showResetPasswordFailedDialog();
//     } else {
//       return AuthenticationModalsService.showResetPasswordModal(member.userName)
//     }
//   });
