import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { ExternalUrls } from "../../models/system.model";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { SystemConfigService } from "../../services/system/system-config.service";

@Component({
  selector: "app-footer-icons",
  templateUrl: "./footer-icons.html",
  styleUrls: ["./footer-icons.sass"]
})
export class FooterIconsComponent implements OnInit {

  public externalUrls: ExternalUrls;
  private logger: Logger;

  constructor(private systemConfigService: SystemConfigService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(FooterIconsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit(): void {
    this.logger.info("subscribing to systemConfigService events");
    this.systemConfigService.events().subscribe(item => this.externalUrls = item.system.externalUrls);
  }
}
