import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-header-buttons",
  templateUrl: "./header-buttons.html",
  styleUrls: ["./header-buttons.sass"]

})
export class HeaderButtonsComponent implements OnInit {
  private logger: Logger;
  public sites = [
    {href: "http://www.kentramblers.org.uk", title: "Kent Ramblers"},
    {href: "https://beta.ramblers.org.uk", title: "National Ramblers"}];

  constructor(loggerFactory: LoggerFactory, public urlService: UrlService) {
    this.logger = loggerFactory.createLogger(HeaderButtonsComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit(): void {
    this.logger.info("HeaderButtonsComponent created with sites:", this.sites);
  }

}
