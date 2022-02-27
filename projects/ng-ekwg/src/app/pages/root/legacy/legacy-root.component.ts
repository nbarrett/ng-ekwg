import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-legacy-root",
  templateUrl: "./legacy-root.component.html"
})

export class LegacyRootComponent implements OnInit {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory,
              private urlService: UrlService) {
    this.logger = loggerFactory.createLogger(LegacyRootComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit(): void {
    this.logger.info("LegacyRootComponent created with area:", this.urlService.area());
  }

}
