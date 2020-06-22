import { Component, Inject, OnInit } from "@angular/core";
import { MemberLoginService } from "../services/member/member-login.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-mailing-preferences",
  template: ""
})
export class MailingPreferencesComponent implements OnInit {
  private logger: Logger;

  constructor(@Inject("AuthenticationModalsService") private authenticationModalsService,
              private memberLoginService: MemberLoginService,
              private route: ActivatedRoute, private router: Router, private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailingPreferencesComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      if (this.memberLoginService.memberLoggedIn()) {
        return this.authenticationModalsService.showMailingPreferencesDialog(this.memberLoginService.loggedInMember().memberId);
      } else {
        this.router.navigate(["/"]);
      }
    });
  }

}
