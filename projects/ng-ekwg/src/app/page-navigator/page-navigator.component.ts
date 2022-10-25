import { Component } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEvent, NamedEventType } from "../models/broadcast.model";
import { Page } from "../models/page.model";
import { BroadcastService } from "../services/broadcast-service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { HOME, PageService } from "../services/page.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-page-navigator",
  templateUrl: "./page-navigator.component.html",
  styleUrls: ["./page-navigator.component.sass"]

})
export class PageNavigatorComponent {
  private logger: Logger;

  constructor(private broadcastService: BroadcastService<boolean>,
              private pageService: PageService,
              private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageNavigatorComponent, NgxLoggerLevel.OFF);
  }

  isOnPage(page: Page): boolean {
    const relativeUrlFirstSegment = this.urlService.relativeUrlFirstSegment();
    if (page === HOME) {
      const isOnPage = this.urlService.relativeUrlFirstSegment() === "/";
      this.logger.debug("isOnPage", page, "relativeUrlFirstSegment", relativeUrlFirstSegment, "->", isOnPage);
      return isOnPage;
    } else {
      const isOnPage = relativeUrlFirstSegment.endsWith(page.href);
      this.logger.debug("isOnPage", page, "relativeUrlFirstSegment", relativeUrlFirstSegment, "->", isOnPage);
      return isOnPage;
    }
  }

  pages(): Page[] {
    return this.pageService.pages;
  }

  unToggleMenu() {
    this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.MENU_TOGGLE, false));
  }
}
