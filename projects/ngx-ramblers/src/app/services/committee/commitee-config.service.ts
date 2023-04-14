import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, BehaviorSubject } from "rxjs";
import { CommitteeConfig } from "../../models/committee.model";
import { ConfigService } from "../config.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { CommitteeReferenceData } from "./committee-reference-data";

@Injectable({
  providedIn: "root"
})
export class CommitteeConfigService {

  private subject = new BehaviorSubject<CommitteeReferenceData>(null);
  private logger: Logger;

  constructor(private config: ConfigService,
              private memberLoginService: MemberLoginService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeConfigService, NgxLoggerLevel.OFF);
    this.refresh();
  }

  refresh(): void {
    this.logger.debug("queryData:started");
    this.getConfig().then(referenceData => {
      this.logger.debug("notifying subscribers:", referenceData);
      this.subject.next(CommitteeReferenceData.create(referenceData, this.memberLoginService));
    });
  }

  private getConfig(): Promise<CommitteeConfig> {
    return this.config.getConfig("committee");
  }

  saveConfig(config) {
    return this.config.saveConfig("committee", config).then(() => this.refresh());
  }

  public events(): Observable<CommitteeReferenceData> {
    return this.subject.asObservable();
  }
}
