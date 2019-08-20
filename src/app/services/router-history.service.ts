import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { NavigationEnd, Router } from "@angular/router";
import { PageService } from "./page.service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { UrlService } from "./url.service";
import { filter } from "rxjs/operators";
import { first } from "lodash-es";

@Injectable({
  providedIn: "root"
})
export class RouterHistoryService {
  private logger: Logger;
  public pageHistory: string[] = [];

  constructor(private router: Router, private urlService: UrlService,
              private pageService: PageService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(RouterHistoryService, NgxLoggerLevel.OFF);
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
      .map(page => first(page.substring(1).split("/")))
      .find((page) => validPages.includes(page));
    this.logger.debug("navigateBackToLastMainPage:pageHistory", this.pageHistory, "lastPage ->", lastPage);
    this.urlService.navigateTo(lastPage || "/");
  }

  setRoot() {
    return this.urlService.navigateTo();
  }

}
