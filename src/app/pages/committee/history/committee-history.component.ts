import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { MemberLoginService } from "src/app/services/member/member-login.service";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile, CommitteeFileApiResponse } from "../../../models/committee.model";
import { LoginResponse } from "../../../models/member.model";
import { sortBy } from "../../../services/arrays";
import { CommitteeFileService } from "../../../services/committee/committee-file.service";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-committee-history",
  templateUrl: "./committee-history.component.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeHistoryComponent implements OnInit, OnDestroy {
  private logger: Logger;
  private subscription: Subscription;
  public notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private committeeFileYears: any;
  private committeeFiles: CommitteeFile[];

  constructor(private memberLoginService: MemberLoginService,
              private notifierService: NotifierService,
              private authService: AuthService,
              private committeeQueryService: CommitteeQueryService,
              private committeeFileService: CommitteeFileService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeHistoryComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {
    });
    this.committeeFiles = [];
    this.committeeFileYears = this.committeeQueryService.committeeFileYears(this.committeeFiles);
    this.subscription = this.committeeFileService.notifications().subscribe((apiResponse: CommitteeFileApiResponse) => {
      if (apiResponse.error) {
        this.logger.warn("received error:", apiResponse.error);
      } else {
        this.notify.progress(`Found ${apiResponse.response.length} committee file(s)`);
        this.notify.setReady();
        this.committeeFiles = apiResponse.response.sort(sortBy("-fileDate"));
      }
    });
  }

  latestYear(): string {
    return this.committeeQueryService.latestYear(this.committeeFiles);
  }

  committeeFilesForYear(year) {
    return this.committeeQueryService.committeeFilesForYear(year, this.committeeFiles);
  }

}
