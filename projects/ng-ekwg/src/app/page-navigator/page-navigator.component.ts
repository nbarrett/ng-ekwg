import { Component } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Page } from "../models/page.model";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { PageService } from "../services/page.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-page-navigator",
  templateUrl: "./page-navigator.component.html",
  styleUrls: ["./page-navigator.component.sass"]

})
export class PageNavigatorComponent {
  private logger: Logger;

  constructor(private pageService: PageService, private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageNavigatorComponent, NgxLoggerLevel.DEBUG);
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
