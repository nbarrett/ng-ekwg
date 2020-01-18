import { Component, OnInit } from "@angular/core";
import { BsModalService, ModalOptions } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { LoginModalComponent } from "../pages/login/login-modal/login-modal.component";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { MemberLoginService } from "../services/member-login.service";
import { RouterHistoryService } from "../services/router-history.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-login-panel",
  templateUrl: "./login-panel.component.html",
  styleUrls: ["./login-panel.component.sass"]
})
export class LoginPanelComponent implements OnInit {
  private logger: Logger;
  config: ModalOptions = {
    animated: false,
    initialState: {}
  };

  ngOnInit(): void {
    this.memberLoginService.loginResponseObservable().subscribe(() => this.routerHistoryService.navigateBackToLastMainPage());
  }

  constructor(private memberLoginService: MemberLoginService,
              private modalService: BsModalService,
              private urlService: UrlService,
              private routerHistoryService: RouterHistoryService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginPanelComponent, NgxLoggerLevel.OFF);
  }

  memberLoginStatus() {
    if (this.memberLoginService.memberLoggedIn()) {
      const loggedInMember = this.memberLoginService.loggedInMember();
      return "Logout " + loggedInMember.firstName + " " + loggedInMember.lastName;
    } else {
      return "Login to EWKG Site";
    }
  }

  loginOrLogout() {
    if (this.memberLoginService.memberLoggedIn()) {
      this.memberLoginService.logout();
    } else {
      this.modalService.show(LoginModalComponent, this.config);
    }
  }

  allowEdits() {
    return this.memberLoginService.allowContentEdits();
  }

  forgotPasswordUrl() {
    return "/forgot-password";
  }

  memberLoggedIn() {
    return this.memberLoginService.memberLoggedIn();
  }
}
