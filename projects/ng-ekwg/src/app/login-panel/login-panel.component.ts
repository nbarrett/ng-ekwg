import { Component, OnInit } from "@angular/core";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../auth/auth.service";
import { ForgotPasswordModalComponent } from "../pages/login/forgot-password-modal/forgot-password-modal.component";
import { LoginModalComponent } from "../pages/login/login-modal/login-modal.component";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { MemberLoginService } from "../services/member/member-login.service";
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
    this.authService.authResponse().subscribe(() => this.routerHistoryService.navigateBackToLastMainPage());
  }

  constructor(private memberLoginService: MemberLoginService,
              private authService: AuthService,
              private modalService: BsModalService,
              private urlService: UrlService,
              private routerHistoryService: RouterHistoryService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginPanelComponent, NgxLoggerLevel.INFO);
  }

  memberLoginStatus() {
    if (this.memberLoginService.memberLoggedIn()) {
      const loggedInMember = this.memberLoginService.loggedInMember();
      return `Logout ${loggedInMember.firstName} ${loggedInMember.lastName}`;
    } else {
      return "Login to EWKG Site";
    }
  }

  loginOrLogout() {
    if (this.memberLoginService.memberLoggedIn()) {
      this.authService.logout();
    } else {
      this.modalService.show(LoginModalComponent, this.config);
    }
  }

  allowEdits() {
    return this.memberLoginService.allowContentEdits();
  }

  forgotPassword() {
    this.modalService.show(ForgotPasswordModalComponent, this.config);
  }

  memberLoggedIn() {
    return this.memberLoginService.memberLoggedIn();
  }
}
