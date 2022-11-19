import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, ReplaySubject } from "rxjs";
import { Organisation, SystemConfigResponse } from "../../models/system.model";
import { ConfigService } from "../config.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";

@Injectable({
  providedIn: "root"
})
export class SystemConfigService {

  private subject = new ReplaySubject<SystemConfigResponse>();
  private logger: Logger;
  private state: { [key: string]: boolean } = {};

  constructor(private config: ConfigService,
              private memberLoginService: MemberLoginService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SystemConfigService, NgxLoggerLevel.OFF);
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

  saveConfig(config: SystemConfigResponse) {
    return this.config.saveConfig<SystemConfigResponse>("system", config).then(() => this.refresh());
  }

  public events(): Observable<SystemConfigResponse> {
    return this.subject.asObservable();
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

  default(): SystemConfigResponse {
    return {
      system: {
        externalUrls: {
          facebook: {appId: null, pagesUrl: null, groupUrl: null},
          meetup: null,
          instagram: null,
          linkedIn: null
        },
        area: this.emptyOrganisation(), group: this.emptyOrganisation(), national: this.emptyOrganisation(),
        header: {navigationButtons: []},
        footer: {appDownloads: {apple: undefined, google: undefined}, legals: [], pages: [], quickLinks: []}
      }
    };
  };
}
