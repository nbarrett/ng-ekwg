import { Component, OnDestroy, OnInit } from "@angular/core";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AlertTarget } from "../../../models/alert-target.model";
import { ExternalUrls, BannerImageType, Image, SystemConfigResponse } from "../../../models/system.model";
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
export class SystemSettingsComponent implements OnInit, OnDestroy {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  public config: SystemConfigResponse;
  public icons: BannerImageType = BannerImageType.icons;
  public logos: BannerImageType = BannerImageType.logos;
  public backgrounds: BannerImageType = BannerImageType.backgrounds;
  faAdd = faAdd;
  faSave = faSave;
  private subscriptions: Subscription[] = [];

  constructor(public systemConfigService: SystemConfigService,
              private notifierService: NotifierService,
              private stringUtils: StringUtilsService,
              private memberService: MemberService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SystemSettingsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("constructed");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.subscriptions.push(this.systemConfigService.events()
      .subscribe((config: SystemConfigResponse) => {
        this.config = config;
        this.prepareMigrationIfRequired(config);
        this.migrateDataIfRequired(config);
        this.logger.info("retrieved config", config);
      }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private prepareMigrationIfRequired(config: SystemConfigResponse) {
    const facebookMigrate = this.prepareMigration(config.system.externalUrls, "facebook");
    const instagramMigrate = this.prepareMigration(config.system.externalUrls, "instagram");
    if (facebookMigrate || instagramMigrate) {
      this.systemConfigService.saveConfig(config);
    }
  }

  private migrateDataIfRequired(config: SystemConfigResponse) {
    if (!config.system.externalUrls.facebook) {
      this.config.system.externalUrls.facebook = {appId: null, pagesUrl: null, groupUrl: null, showFeed: true};
      this.logger.info("migrated facebook to", this.config.system.externalUrls.facebook);
    } else {
      this.logger.info("nothing to migrate for facebook", this.config.system.externalUrls.facebook);
    }
    if (!config.system.externalUrls.instagram) {
      this.logger.info("migrated instagram to", this.config.system.externalUrls.instagram);
      this.config.system.externalUrls.instagram = {groupUrl: null, showFeed: true};
    } else {
      this.logger.info("nothing to migrate for instagram", this.config.system.externalUrls.instagram);
    }
  }

  private prepareMigration(externalUrls: ExternalUrls, field: string): boolean {
    const needsMigration = this.needsMigration(externalUrls, field);
    if (needsMigration) {
      this.logger.info("externalUrls ", field, "with value", externalUrls[field], "needs migration");
      externalUrls[field] = null;
    } else {
      this.logger.info("externalUrls ", field, "with value", externalUrls[field], "already migrated");
    }
    return needsMigration;
  }

  private needsMigration(externalUrls: ExternalUrls, field: string): boolean {
    return typeof externalUrls[field] === "string";
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

  headerLogoChanged(logo: string) {
    this.config.system.header.selectedLogo = logo;
  }

}
