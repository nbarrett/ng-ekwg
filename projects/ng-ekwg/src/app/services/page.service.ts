import { Injectable } from "@angular/core";
import { last } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { Page } from "../models/page.model";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { StringUtilsService } from "./string-utils.service";
import { UrlService } from "./url.service";

export const HOME: Page = {href: "", title: "Home"};

@Injectable({
  providedIn: "root"
})

export class PageService {
  private logger: Logger;

  constructor(private stringUtils: StringUtilsService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageService, NgxLoggerLevel.OFF);
  }

  public pages: Page[] = [
    {href: "walks", title: "Walks"},
    {href: "social", title: "Social"},
    {href: "join-us", title: "Join Us"},
    {href: "contact-us", title: "Contact Us"},
    {href: "committee", title: "Committee"},
    {href: "admin", title: "Admin"},
    {href: "how-to", title: "How-to"}];

  pageForArea(area: string): Page {
    area = area.replace("/", "");
    return this.pages.find(page => page.href === area) || HOME;
  }

  pagesFor(area: string, relativePath: string): Page[] {
    return this.basePagesForArea(area).concat(this.relativePages(area, this.urlService.toPathSegments(relativePath)));
  }

  pageTitle(relativePath: string): string {
    return this.stringUtils.asTitle(last(this.pathSegments(relativePath)));
  }

  contentDescription(relativePath: string): string {
    return this.stringUtils.replaceAll("/", " ", this.contentPath(relativePath)).toString().toLowerCase();
  }

  contentPath(relativePath: string, anchor?: string): string {
    const anchorSuffix = anchor ? "#" + anchor : "";
    const area = this.urlService.area();
    if (relativePath) {
      return `${area}/${relativePath}${anchorSuffix}`;
    } else {
      return `${area}${anchorSuffix}`;
    }
  }

  pathSegments(relativePath: string): string[] {
    return this.urlService.toPathSegments(relativePath);
  }

  private basePagesForArea(area: string): Page[] {
    return this.pages
      .filter(page => page === HOME || page?.title?.toLowerCase() === area?.toLowerCase());
  }

  private relativePages(area: string, pathSegments: string[]): Page[] {
    this.logger.info("area:", area, "pathSegments:", pathSegments);
    return pathSegments
      ?.filter(item => item !== last(pathSegments))
      ?.map((path, index) => ({title: this.stringUtils.asTitle(path), href: this.pathSegmentsUpTo(area, pathSegments, index)}));
  }

  private pathSegmentsUpTo(area: string, pathSegments: string[], upToIndex: number): string {
    return `${area}/${pathSegments.filter((item, index) => index <= upToIndex).join("/")}`;
  }

}
