import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, ReplaySubject } from "rxjs";
import { SystemConfig } from "../../models/system.model";
import { ConfigService } from "../config.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";

@Injectable({
  providedIn: "root"
})
export class SystemConfigService {

  private subject = new ReplaySubject<SystemConfig>();
  private logger: Logger;

  constructor(private config: ConfigService,
              private memberLoginService: MemberLoginService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SystemConfigService, NgxLoggerLevel.OFF);
    this.refresh();
  }

  refresh(): void {
    this.logger.debug("systemConfig query:started");
    this.getConfig().then((systemConfig: SystemConfig) => {
      this.logger.debug("notifying systemConfig subscribers:", systemConfig);
      this.subject.next(systemConfig);
    });
  }

  private getConfig(): Promise<SystemConfig> {
    return this.config.getConfig("system");
  }

  saveConfig(config: SystemConfig) {
    return this.config.saveConfig("system", config).then(() => this.refresh());
  }

  public events(): Observable<SystemConfig> {
    return this.subject.asObservable();
  }
}
