import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { MemberLoginService } from "src/app/services/member/member-login.service";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { LoginResponse } from "../../../models/member.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-committee-general",
  templateUrl: "./committee-general.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeGeneralComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private subscription: Subscription;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};

  constructor(private memberLoginService: MemberLoginService,
              private notifierService: NotifierService,
              private authService: AuthService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeGeneralComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {});
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

}
