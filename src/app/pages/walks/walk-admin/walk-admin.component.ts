import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { MemberLoginService } from "src/app/services/member-login.service";
import { AuthService } from "../../../auth/auth.service";
import { LoginResponse } from "../../../models/member.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-walk-admin",
  templateUrl: "./walk-admin.component.html",
  styleUrls: ["./walk-admin.component.sass"],
  changeDetection: ChangeDetectionStrategy.Default
})
export class WalkAdminComponent implements OnInit, OnDestroy {
  allowAdminEdits: boolean;
  private logger: Logger;
  private subscription: Subscription;

  constructor(private memberLoginService: MemberLoginService,
              private authService: AuthService,
              private broadcastService: BroadcastService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkAdminComponent, NgxLoggerLevel.INFO);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.setPrivileges();
    this.subscription = this.authService.authResponse().subscribe((loginResponse: LoginResponse) => this.setPrivileges(loginResponse));
  }

  private setPrivileges(loginResponse?: LoginResponse) {
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
