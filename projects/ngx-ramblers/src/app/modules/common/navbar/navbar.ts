import { Component, HostListener, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { LogoFileData, SystemConfig } from "../../../models/system.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { SystemConfigService } from "../../../services/system/system-config.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.html",
  styleUrls: ["./navbar.sass"]
})
export class NavbarComponent implements OnInit {
  private logger: Logger;
  public navbarContentWithinCollapse: boolean;
  public logo: LogoFileData;
  public navbarExpanded = false;
  public system: SystemConfig;

  constructor(
    private systemConfigService: SystemConfigService,
    private broadcastService: BroadcastService<boolean>,
    public urlService: UrlService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NavbarComponent, NgxLoggerLevel.OFF);
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    const width = event?.target?.innerWidth;
    this.detectWidth(width);
  }

  private detectWidth(width: number) {
    this.navbarContentWithinCollapse = width < 980;
    this.logger.info("detectWidth:", width, "this.navbarContentWithinCollapse:", this.navbarContentWithinCollapse);
  }

  toggleNavBar() {
    this.navbarExpanded = !this.navbarExpanded;
  }

  ngOnInit(): void {
    this.systemConfigService.events().subscribe(item => {
      this.system = item.system;
      this.logo = this.system?.logos?.images?.find(logo => logo.originalFileName === this.system?.header?.selectedLogo);
    });
    this.broadcastService.on(NamedEventType.MENU_TOGGLE, (event: NamedEvent<boolean>) => {
      this.logger.info("menu toggled with event:", event);
      this.navbarExpanded = event.data;
    });
    this.detectWidth(window.innerWidth);
  }

  icon() {
    return this.navbarExpanded ? "i-cross" : "i-menu";
  }

}
