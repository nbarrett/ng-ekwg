import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { LoginResponse } from "../../../models/member.model";
import { Organisation } from "../../../models/system.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { SystemConfigService } from "../../../services/system/system-config.service";

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
  public group: Organisation;

  constructor(private memberLoginService: MemberLoginService,
              private authService: AuthService,
              private systemConfigService: SystemConfigService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger("LoginRequiredComponent", NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.loggedIn = this.memberLoginService.memberLoggedIn();
    this.logger.info("subscribing to systemConfigService events");
    this.systemConfigService.events().subscribe(item => this.group = item.system.group);
    this.subscription = this.authService.authResponse()
      .subscribe((loginResponse: LoginResponse) => this.loggedIn = this.memberLoginService.memberLoggedIn());
  }

}
