import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { ActivatedRoute, Router } from "@angular/router";
import { PageService } from "./page.service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root"
})
export class PageNavigatorService {
  private logger: Logger;
  public pageHistory: string[] = [];

  constructor(private route: ActivatedRoute, private router: Router, activatedRoute: ActivatedRoute,
              private urlService: UrlService, private pageService: PageService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageNavigatorService, NgxLoggerLevel.INFO);
    activatedRoute.url.subscribe(url => {
      const newUrl = url.toString();
      this.pageHistory.push(this.urlService.relativeUrl(newUrl));
      this.logger.info("newUrl", newUrl, "pageHistory", this.pageHistory);
    });

  }

  navigateBackToLastMainPage() {
    const validPages: string[] = this.pageService.pages.map(page => page.href);
    const lastPage = this.pageHistory.reverse()
      .find((page) => validPages.includes(this.urlService.relativeUrlFirstSegment(page)));
    this.logger.info("navigateBackToLastMainPage:pageHistory", this.pageHistory, "lastPage->", lastPage);
    this.navigateTo(lastPage || "/");
  }

  navigateTo(page?: string, area?: string) {
    const url = this.urlService.pageUrl(page) + (area ? "/" + area : "");
    this.logger.info("navigating to page:", page, "area:", area, "->", url);
    this.router.navigate([url]);
    this.logger.info("area is now", this.urlService.area());
  }

  setRoot() {
    return this.navigateTo();
  }

}
