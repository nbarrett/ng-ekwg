import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { MemberLoginService } from "src/app/services/member-login.service";
import { BroadcastService, NamedEventType } from "../../../services/broadcast-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-walk-admin",
  templateUrl: "./walk-admin.component.html",
  styleUrls: ["./walk-admin.component.sass"],
  changeDetection: ChangeDetectionStrategy.Default
})
export class WalkAdminComponent implements OnInit {
  allowAdminEdits: boolean;
  private logger: Logger;

  constructor(private memberLoginService: MemberLoginService,
              private broadcastService: BroadcastService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkAdminComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.setPrivileges();
    this.broadcastService.on(NamedEventType.MEMBER_LOGIN_COMPLETE, () => this.setPrivileges());
    this.broadcastService.on(NamedEventType.MEMBER_LOGOUT_COMPLETE, () => this.setPrivileges());
  }

  private setPrivileges() {
    this.allowAdminEdits = this.memberLoginService.allowWalkAdminEdits();
    this.logger.info("setPrivileges:allowAdminEdits", this.allowAdminEdits);
  }

  selectWalksForExport() {
    this.urlService.navigateTo("walks", "export");
  }

  addWalkSlots() {
    this.urlService.navigateTo("walks", "add-walk-slots");
  }

  meetupSettings() {
    this.urlService.navigateTo("walks", "meetup-settings");
  }
}
