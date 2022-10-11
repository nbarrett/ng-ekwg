import { Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Page } from "../models/page.model";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { PageService } from "../services/page.service";
import { StringUtilsService } from "../services/string-utils.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-page",
  templateUrl: "./page.component.html",
  styleUrls: ["./page.component.sass"]
})
export class PageComponent implements OnInit {

  @Input() pageTitle: string;
  @Input() area: string;
  @Input() relativePath: string;

  public open: boolean;
  private logger: Logger;
  pages: Page[] = [];
  public pathSegments: string[];

  constructor(private pageService: PageService,
              private stringUtils: StringUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit(): void {
    this.logger.debug("area:", this.area, "relativePath:", this.relativePath);
    this.pages = this.pageService.pagesFor(this.area, this.relativePath)
    this.logger.debug("pageTitle:", this.pageTitle, "lastBreadcrumb:", this.area, "pages:", this.pages);
  }

}

