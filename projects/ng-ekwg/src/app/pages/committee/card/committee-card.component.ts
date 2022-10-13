import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile } from "../../../models/committee.model";
import { LoginResponse } from "../../../models/member.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { CommitteeDisplayService } from "../committee-display.service";

@Component({
  selector: "app-committee-card",
  templateUrl: "./committee-card.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeCardComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private subscription: Subscription;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  faImage = faImage;
  @Input()
  public committeeFile: CommitteeFile
  constructor(private memberLoginService: MemberLoginService,
              public display: CommitteeDisplayService,
              private notifierService: NotifierService,
              private authService: AuthService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeCardComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {});
  }

}
