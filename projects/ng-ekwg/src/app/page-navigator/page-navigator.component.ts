import { Component } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Page } from "../models/page.model";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { PageService } from "../services/page.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-page-navigator",
  templateUrl: "./page-navigator.component.html",
  styleUrls: ["../new-brand/styles/style-1.css", "../new-brand/styles/style-btn.css", "../new-brand/styles/style-bg.css", "../new-brand/styles/style-text.css", "../new-brand/styles/style-list.css"]

})
export class PageNavigatorComponent {
  private logger: Logger;

  constructor(private pageService: PageService, private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageNavigatorComponent, NgxLoggerLevel.OFF);
  }

  isOnPage(page: string) {
    if (page === "") {
      return this.urlService.relativeUrlFirstSegment() === "/";
    } else {
      const relativeUrlFirstSegment = this.urlService.relativeUrlFirstSegment();
      const isOnPage = relativeUrlFirstSegment.endsWith(page);
      this.logger.debug("isOnPage", page, "->", isOnPage, "relativeUrlFirstSegment", relativeUrlFirstSegment);
      return isOnPage;
    }
  }

  pages(): Page[] {
    return this.pageService.pages;
  }
}
