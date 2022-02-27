import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-site-navigator",
  templateUrl: "./site-navigator.component.html",
  styleUrls: ["./site-navigator.component.sass"]

})
export class SiteNavigatorComponent implements OnInit {
  private logger: Logger;
  public sites = [
    {href: "#", title: "EKWG", active: true},
    {href: "http://www.kentramblers.org.uk", title: "Kent Ramblers"},
    {href: "http://www.ramblers.org.uk/", title: "National Ramblers"}];

  constructor(loggerFactory: LoggerFactory,
              private urlService: UrlService) {
    this.logger = loggerFactory.createLogger(SiteNavigatorComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit(): void {
    this.logger.info("dddSiteNavigatorComponent created with sites:", this.sites);
  }

}
