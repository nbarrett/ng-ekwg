import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { Link } from "../../../models/page.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { PageService } from "../../../services/page.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-dynamic-content-page",
  templateUrl: "./dynamic-content-page.html",
  styleUrls: ["./dynamic-content-page.sass"],
})
export class DynamicContentPageComponent implements OnInit {
  private logger: Logger;
  public relativePath: string;
  public pageTitle: string;
  public area: string;
  private page: Link;

  constructor(
    private route: ActivatedRoute,
    private urlService: UrlService,
    private pageService: PageService,
    private stringUtils: StringUtilsService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(DynamicContentPageComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.relativePath = paramMap.get("relativePath");
      this.pageTitle = this.pageService.pageTitle(this.relativePath);
      this.pageService.contentPath(this.relativePath);
      this.area = this.urlService.area();
      this.page = this.pageService.pageForArea(this.area);
      this.logger.info("initialised with path:", this.relativePath, "contentPath:", this.pageService.contentPath(this.relativePath), this.pageTitle, "this.page:", this.page);
    });
  }

}
