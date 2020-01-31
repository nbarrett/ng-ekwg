import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { ResetPasswordModalComponent } from "../pages/login/reset-password-modal/reset-password-modal.component";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { MemberService } from "../services/member.service";

@Component({
  selector: "app-set-password",
  template: ""
})

export class SetPasswordComponent implements OnInit {
  private logger: Logger;

  constructor(private modalService: BsModalService,
              private memberService: MemberService,
              private route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SetPasswordComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      const passwordResetId = paramMap.get("password-reset-id");
      this.memberService.getMemberByPasswordResetId(passwordResetId)
        .then(member => {
          this.logger.debug("for password-reset-id", passwordResetId, "member", member);
          this.modalService.show(ResetPasswordModalComponent, {
            animated: false,
            initialState: {userName: member.userName}
          });
        });
    });
  }
}
