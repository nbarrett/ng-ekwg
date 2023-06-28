import { Component, OnDestroy, OnInit } from "@angular/core";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AlertTarget } from "../../../models/alert-target.model";
import { BannerImageType, ExternalUrls, SystemConfig } from "../../../models/system.model";
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
  public config: SystemConfig;
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
      .subscribe((config: SystemConfig) => {
        this.config = config;
        this.prepareMigrationIfRequired(config);
        this.migrateDataIfRequired(config);
        if (!this.config?.national?.mainSite) {
          this.config.national = this.systemConfigService.defaultRamblersConfig();
        }
        this.logger.info("retrieved config", config);
      }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private prepareMigrationIfRequired(config: SystemConfig) {
    const facebookMigrate = this.prepareMigration(config.externalUrls, "facebook");
    const instagramMigrate = this.prepareMigration(config.externalUrls, "instagram");
    if (facebookMigrate || instagramMigrate) {
      this.systemConfigService.saveConfig(config);
    }
  }

  private migrateDataIfRequired(config: SystemConfig) {
    if (!config.externalUrls.facebook) {
      this.config.externalUrls.facebook = {appId: null, pagesUrl: null, groupUrl: null, showFeed: true};
      this.logger.info("migrated facebook to", this.config.externalUrls.facebook);
    } else {
      this.logger.info("nothing to migrate for facebook", this.config.externalUrls.facebook);
    }
    if (!config.externalUrls.instagram) {
      this.logger.info("migrated instagram to", this.config.externalUrls.instagram);
      this.config.externalUrls.instagram = {groupUrl: null, showFeed: true};
    } else {
      this.logger.info("nothing to migrate for instagram", this.config.externalUrls.instagram);
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
    this.config.header.selectedLogo = logo;
  }

}
