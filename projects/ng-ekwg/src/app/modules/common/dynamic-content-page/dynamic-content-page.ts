import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import last from "lodash-es/last";
import { NgxLoggerLevel } from "ngx-logger";
import { PageContent } from "../../../models/content-text.model";
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
  public contentPath: string;
  public pageContent: PageContent;
  public pageTitle: string;
  public pathSegments: string[] = [];
  public area: string;
  public editNameEnabled: true;

  constructor(
    private route: ActivatedRoute,
    private urlService: UrlService,
    private pageService: PageService,
    private stringUtils: StringUtilsService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(DynamicContentPageComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.relativePath = paramMap.get("relativePath");
      this.logger.debug("initialised with path:", this.relativePath);
      this.pageTitle = this.pageService.pageTitle(this.relativePath);
    });
  }

}
