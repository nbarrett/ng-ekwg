import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { MailingPreferencesModalComponent } from "../pages/mailing-preferences/mailing-preferences-modal.component";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { MemberLoginService } from "../services/member/member-login.service";

@Component({
  selector: "app-mailing-preferences",
  template: ""
})
export class MailingPreferencesComponent implements OnInit {
  private logger: Logger;

  constructor(private modalService: BsModalService,
              private memberLoginService: MemberLoginService,
              private router: Router, private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailingPreferencesComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    if (this.memberLoginService.memberLoggedIn()) {
      this.modalService.show(MailingPreferencesModalComponent);
    } else {
      this.router.navigate(["/"]);
    }
  }

}
