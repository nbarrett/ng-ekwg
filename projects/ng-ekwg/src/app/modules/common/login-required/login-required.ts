import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { LoginResponse } from "../../../models/member.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";

@Component({
  selector: "app-login-required",
  templateUrl: "./login-required.html",
  styleUrls: ["./login-required.sass"],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LoginRequiredComponent implements OnInit {
  private logger: Logger;
  private subscription: Subscription;
  public loggedIn: boolean;

  constructor(private memberLoginService: MemberLoginService,
              private authService: AuthService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginRequiredComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.loggedIn = this.memberLoginService.memberLoggedIn();
    this.subscription = this.authService.authResponse()
      .subscribe((loginResponse: LoginResponse) => this.loggedIn = this.memberLoginService.memberLoggedIn());
  }

}
