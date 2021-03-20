import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, ReplaySubject} from "rxjs";
import { CommitteeConfig } from "../../models/committee.model";
import { CommitteeReferenceData } from "./committee-reference-data";
import { ConfigService } from "../config.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";

@Injectable({
  providedIn: "root"
})
export class CommitteeConfigService {

  private subject = new ReplaySubject<CommitteeReferenceData>();
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
