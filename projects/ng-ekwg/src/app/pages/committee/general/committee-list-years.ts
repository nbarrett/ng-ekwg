import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { CommitteeFile, CommitteeFileApiResponse, CommitteeYear } from "../../../models/committee.model";
import { LoginResponse } from "../../../models/member.model";
import { Confirm } from "../../../models/ui-actions";
import { ApiResponseProcessor } from "../../../services/api-response-processor.service";
import { sortBy } from "../../../services/arrays";
import { CommitteeFileService } from "../../../services/committee/committee-file.service";
import { CommitteeQueryService } from "../../../services/committee/committee-query.service";
import { CommitteeReferenceData } from "../../../services/committee/committee-reference-data";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { UrlService } from "../../../services/url.service";
import { CommitteeDisplayService } from "../committee-display.service";

@Component({
  selector: "app-committee-list-years",
  templateUrl: "./committee-list-years.html",
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeListYearsComponent implements OnInit, OnDestroy {
  @Input()
  public confirm: Confirm;
  @Input()
  public notify: AlertInstance;

  private logger: Logger;
  private subscription: Subscription;
  public notifyTarget: AlertTarget = {};
  public committeeFileYears: CommitteeYear[] = [];

  constructor(public display: CommitteeDisplayService,
              private notifierService: NotifierService,
              private memberLoginService: MemberLoginService,
              private committeeFileService: CommitteeFileService,
              private committeeQueryService: CommitteeQueryService,
              private apiResponseProcessor: ApiResponseProcessor,
              private authService: AuthService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeListYearsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => {
    });
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

}
