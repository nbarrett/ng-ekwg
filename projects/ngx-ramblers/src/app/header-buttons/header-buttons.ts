import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { SystemConfigResponse } from "../models/system.model";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { SystemConfigService } from "../services/system/system-config.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-header-buttons",
  templateUrl: "./header-buttons.html",
  styleUrls: ["./header-buttons.sass"]

})
export class HeaderButtonsComponent implements OnInit {
  private logger: Logger;
  public systemConfigResponse: SystemConfigResponse;

  constructor(private systemConfigService: SystemConfigService, loggerFactory: LoggerFactory, public urlService: UrlService) {
    this.logger = loggerFactory.createLogger(HeaderButtonsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit(): void {
    this.systemConfigService.events().subscribe(item => this.systemConfigResponse = item);
  }

}
