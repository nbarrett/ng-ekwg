import { Component, Inject, OnInit } from "@angular/core";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";

@Component({
  selector: "app-mailing-preferences",
  templateUrl: "../shared/non-rendering.component.html"
})
export class MailingPreferencesComponent implements OnInit {
  private logger: Logger;

  constructor(@Inject("AuthenticationModalsService") private authenticationModalsService,
              @Inject("LoggedInMemberService") private loggedInMemberService,
              private route: ActivatedRoute, private router: Router, private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailingPreferencesComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      if (this.loggedInMemberService.memberLoggedIn()) {
        return this.authenticationModalsService.showMailingPreferencesDialog(this.loggedInMemberService.loggedInMember().memberId);
      } else {
        this.router.navigate(["/"]);
      }
    });
  }

}
