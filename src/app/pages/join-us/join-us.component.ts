import { Component, OnInit } from "@angular/core";
import { UrlService } from "../../services/url.service";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";

@Component({
  selector: "app-join-us",
  templateUrl: "./join-us.component.html"
})
export class JoinUsComponent implements OnInit {
  private logger: Logger;

  constructor(private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(JoinUsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.info("ngOnInit");
    // this.urlService.refresh();
  }

}
