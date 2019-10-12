import { Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import first from "lodash-es/first";
import { NgxLoggerLevel } from "ngx-logger";
import { filter } from "rxjs/operators";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { PageService } from "./page.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root"
})
export class RouterHistoryService {
  private logger: Logger;
  public pageHistory: string[] = [];

  constructor(private router: Router, private urlService: UrlService,
              private pageService: PageService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(RouterHistoryService, NgxLoggerLevel.INFO);
    this.logger.debug("constructed");
    this.loadRouting();
  }

  public loadRouting(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(({urlAfterRedirects}: NavigationEnd) => {
        this.pageHistory = [...this.pageHistory, urlAfterRedirects];
      });
  }

  navigateBackToLastMainPage() {
    const validPages: string[] = this.pageService.pages.map(page => page.href);
    const lastPage = this.pageHistory.reverse()
      .find(page => {
        const pagePortion = first(page.substring(1).split("/"));
        const match = validPages.includes(pagePortion);
        this.logger.debug("pagePortion", pagePortion, "of", page, "match ->", match);
        return match;
      });
    this.logger.debug("navigateBackToLastMainPage:pageHistory", this.pageHistory, "lastPage ->", lastPage);
    this.urlService.navigateTo(lastPage || "/");
  }

  setRoot() {
    return this.urlService.navigateTo();
  }

}
