import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-root",
  templateUrl: "./root-selector.component.html",
})
export class RootSelectorComponent implements OnInit {
  private logger: Logger;
  legacy: boolean;

  constructor(loggerFactory: LoggerFactory,
              private urlService: UrlService) {
    this.logger = loggerFactory.createLogger(RootSelectorComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit(): void {
    this.legacy = this.urlService.area() !== "new-brand";
    this.logger.info("area:", this.urlService.area(), " legacy:", this.legacy);
  }

}
