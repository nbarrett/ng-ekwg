import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, BehaviorSubject } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { Images, BannerImageType, Organisation, SystemConfigResponse } from "../../models/system.model";
import { ConfigService } from "../config.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { StringUtilsService } from "../string-utils.service";

@Injectable({
  providedIn: "root"
})
export class SystemConfigService {

  private subject = new BehaviorSubject<SystemConfigResponse>(this.default());
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

  private async getConfig(): Promise<SystemConfigResponse> {
    return (await this.config.getConfig<SystemConfigResponse>("system", this.default()));
  }

  imageTypeDescription(imageType: BannerImageType) {
    return this.stringUtils.asTitle(imageType);
  }

  saveConfig(config: SystemConfigResponse) {
    return this.config.saveConfig<SystemConfigResponse>("system", config).then(() => this.refresh());
  }

  public events(): Observable<SystemConfigResponse> {
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

  default(): SystemConfigResponse {
    return {
      system: {
        backgrounds: this.defaultImages(BannerImageType.backgrounds),
        icons: this.defaultImages(BannerImageType.icons),
        logos: this.defaultImages(BannerImageType.logos),
        externalUrls: {
          facebook: {appId: null, pagesUrl: null, groupUrl: null},
          meetup: null,
          instagram: null,
          linkedIn: null
        },
        area: this.emptyOrganisation(), group: this.emptyOrganisation(), national: this.emptyOrganisation(),
        header: {selectedLogo: null, navigationButtons: []},
        footer: {appDownloads: {apple: undefined, google: undefined}, legals: [], pages: [], quickLinks: []}
      }
    };
  };
}
