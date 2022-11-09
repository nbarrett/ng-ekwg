import { Component, OnInit } from "@angular/core";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { SystemConfigResponse } from "../../../models/system.model";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { SystemConfigService } from "../../../services/system/system-config.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-system-settings",
  templateUrl: "./system-settings.html",
})
export class SystemSettingsComponent implements OnInit {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  public config: SystemConfigResponse;
  faAdd = faAdd;
  faSave = faSave;
  public editing: boolean;

  constructor(private systemConfigService: SystemConfigService,
              private notifierService: NotifierService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SystemSettingsComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.debug("constructed");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.systemConfigService.events()
      .subscribe((config: SystemConfigResponse) => {
        this.config = config;
        this.logger.info("retrieved config", config);
        // this.configQueried = true;
      });
  }

  save() {
    this.logger.debug("saving config", this.config);
    this.systemConfigService.saveConfig(this.config)
      .then(() => this.urlService.navigateTo("admin"))
      .catch((error) => this.notify.error({title: "Error saving system config", message: error}));
  }

  cancel() {
    this.urlService.navigateTo("admin");
  }

}
