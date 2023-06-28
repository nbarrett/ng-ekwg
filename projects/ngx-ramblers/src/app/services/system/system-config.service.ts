import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { BehaviorSubject, Observable } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { ConfigKey } from "../../models/config.model";
import { BannerImageType, Images, Organisation, Ramblers, SystemConfig } from "../../models/system.model";
import { ConfigService } from "../config.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { StringUtilsService } from "../string-utils.service";

@Injectable({
  providedIn: "root"
})
export class SystemConfigService {

  private subject = new BehaviorSubject<SystemConfig>(this.default());
  private logger: Logger;
  private state: { [key: string]: boolean } = {};

  constructor(private config: ConfigService,
              private memberLoginService: MemberLoginService,
              public stringUtils: StringUtilsService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger("SystemConfigService", NgxLoggerLevel.OFF);
    this.refresh();
  }

  async refresh() {
    this.logger.debug("systemConfig query:started");
    const systemConfig = await this.getConfig();
    this.logger.debug("notifying systemConfig subscribers with:", systemConfig);
    this.subject.next(systemConfig);
  }

  private async getConfig(): Promise<SystemConfig> {
    return await this.config.queryConfig<SystemConfig>(ConfigKey.SYSTEM, this.default());
  }

  imageTypeDescription(imageType: BannerImageType) {
    return this.stringUtils.asTitle(imageType);
  }

  saveConfig(config: SystemConfig) {
    return this.config.saveConfig<SystemConfig>(ConfigKey.SYSTEM, config).then(() => this.refresh());
  }

  public events(): Observable<SystemConfig> {
    return this.subject.pipe(shareReplay());
  }

  private emptyOrganisation(): Organisation {
    return {
      shortName: "", longName: "", pages: [], href: null
    };
  }

  public setAppState(key: string, state: boolean): void {
    this.state[key] = state;
  }

  public queryAppState(key: string): boolean {
    return this.state[key];
  }

  public defaultImages(imageType: BannerImageType): Images {
    return {rootFolder: imageType, images: []};
  }

  default(): SystemConfig {
    return {
      backgrounds: this.defaultImages(BannerImageType.backgrounds),
      icons: this.defaultImages(BannerImageType.icons),
      logos: this.defaultImages(BannerImageType.logos),
      externalUrls: {
        facebook: {appId: null, pagesUrl: null, groupUrl: null},
        meetup: null,
        instagram: null,
        linkedIn: null
      },
      area: this.emptyOrganisation(), group: this.emptyOrganisation(), national: this.defaultRamblersConfig(),
      header: {selectedLogo: null, navigationButtons: []},
      footer: {appDownloads: {apple: undefined, google: undefined}, legals: [], pages: [], quickLinks: []}
    };
  };

  public defaultRamblersConfig(): Ramblers {
    return {
      mainSite: {
        href: "https://ramblers.org.uk",
        title: "Ramblers"
      }, walksManager: {
        href: "https://walks-manager.ramblers.org.uk/walks-manager",
        title: "Walks Manager",
        apiKey: null,
        password: null,
        userName: null
      }
    };
  }
}
