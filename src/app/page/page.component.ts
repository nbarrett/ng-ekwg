import { Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Page } from "../models/page.model";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { HOME, PageService } from "../services/page.service";

@Component({
  selector: "app-page",
  templateUrl: "./page.component.html",
  styleUrls: ["./page.component.sass"]
})
export class PageComponent implements OnInit {

  @Input() pageTitle: string;
  @Input() lastBreadcrumb: string;

  public open: boolean;
  private logger: Logger;
  pages: Page[] = [];

  constructor(private pageService: PageService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit(): void {
    this.logger.debug(this.lastBreadcrumb);
    this.pages = this.pageService.pages.filter(page => {
      if (page === HOME) {
        return true;
      } else {
        return page.title.toLowerCase() === this.lastBreadcrumb;
      }
    });
    this.logger.debug("pageTitle:", this.pageTitle, "lastBreadcrumb:", this.lastBreadcrumb, "pages:", this.pages);
  }

}

