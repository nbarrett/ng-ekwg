import { Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import first from "lodash-es/first";
import { NgxLoggerLevel } from "ngx-logger";
import { filter } from "rxjs/operators";
import { LoginResponse } from "../models/member.model";
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
    this.logger = loggerFactory.createLogger(RouterHistoryService, NgxLoggerLevel.OFF);
    this.loadRouting();
  }

  public loadRouting(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(({urlAfterRedirects}: NavigationEnd) => {
        this.pageHistory = [...this.pageHistory, urlAfterRedirects];
        this.logger.info("constructed: pageHistory:urlAfterRedirects", urlAfterRedirects, "history now:", this.pageHistory);
      });
  }

  navigateBackToLastMainPage(response: LoginResponse) {
    const validPages: string[] = this.pageService.pages.map(page => page.href);
    const lastPage = this.pageHistory.reverse()
      .find(page => {
        const pagePortion = first(page.substring(1).split("/"));
        const match = validPages.includes(pagePortion);
        this.logger.debug("event:", response, "pagePortion", pagePortion, "of", page, "match ->", match);
        return match;
      });
    this.logger.debug("event:", response, "pageHistory", this.pageHistory, "lastPage ->", lastPage);
    this.urlService.navigateTo(lastPage || "/");
  }

  setRoot() {
    return this.urlService.navigateTo();
  }

}
