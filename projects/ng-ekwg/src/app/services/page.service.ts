import { Injectable } from "@angular/core";
import { last } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { Link } from "../models/page.model";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { StringUtilsService } from "./string-utils.service";
import { SystemConfigService } from "./system/system-config.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root"
})

export class PageService {
  private logger: Logger;

  constructor(private stringUtils: StringUtilsService,
              private systemConfigService: SystemConfigService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageService, NgxLoggerLevel.OFF);
    this.systemConfigService.events().subscribe(item => this.pages = item.system.group.pages);
  }

  public pages: Link[] = [];

  pageForArea(area: string): Link {
    area = area.replace("/", "");
    return this.pages.find(page => page.href === area) || this.pages[0];
  }

  pagesFor(area: string, relativePath: string): Link[] {
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

  private basePagesForArea(area: string): Link[] {
    return this.pages
      .filter((page, index) => index === 0 || page?.title?.toLowerCase() === area?.toLowerCase());
  }

  private relativePages(area: string, pathSegments: string[]): Link[] {
    this.logger.info("area:", area, "pathSegments:", pathSegments);
    return pathSegments
      ?.filter(item => item !== last(pathSegments))
      ?.map((path, index) => ({title: this.stringUtils.asTitle(path), href: this.pathSegmentsUpTo(area, pathSegments, index)}));
  }

  private pathSegmentsUpTo(area: string, pathSegments: string[], upToIndex: number): string {
    return `${area}/${pathSegments.filter((item, index) => index <= upToIndex).join("/")}`;
  }

}
