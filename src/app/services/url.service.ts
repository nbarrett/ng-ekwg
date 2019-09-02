import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "lodash-es";
import isArray from "lodash-es/isArray";
import last from "lodash-es/last";
import some from "lodash-es/some";
import tail from "lodash-es/tail";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class UrlService {
  private logger: Logger;

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router,
              private loggerFactory: LoggerFactory, private route: ActivatedRoute) {
    this.logger = loggerFactory.createLogger(UrlService, NgxLoggerLevel.INFO);
  }

  relativeUrlFirstSegment(optionalUrl?: string): string {
    const url = new URL(optionalUrl || this.absUrl());
    return "/" + first(url.pathname.substring(1).split("/"));
  }

  navigateTo(page?: string, area?: string): Promise<boolean> {
    const url = `${this.pageUrl(page)}${area ? "/" + area : ""}`;
    this.logger.debug("navigating to page:", page, "area:", area, "->", url);
    return this.router.navigate([url], {relativeTo: this.route}).then((activated: boolean) => {
      this.logger.debug("activated:", activated, "area is now:", this.area());
      return activated;
    });
  }

  absUrl(): string {
    this.logger.debug("absUrl: document.location.href", this.document.location.href);
    return this.document.location.href;
  }

  baseUrl(optionalUrl?: string): string {
    const url = new URL(optionalUrl || this.absUrl());
    return `${url.protocol}//${url.host}`;
  }

  relativeUrl(optionalUrl?: string): string {
    return last((optionalUrl || this.absUrl()).split("/"));
  }

  resourceUrl(area: string, type: string, id: string): string {
    return this.baseUrl() + "/" + area + "/" + type + "Id/" + id;
  }

  area(optionalUrl?: string): string {
    return this.relativeUrlFirstSegment(optionalUrl).substring(1);
  }

  refresh(): void {
    location.reload(true);
  }

  notificationHref(ctrl): string {
    const href = (ctrl.name) ? this.resourceUrlForAWSFileName(ctrl.name) : this.resourceUrl(ctrl.area, ctrl.type, ctrl.id);
    this.logger.debug("href:", href);
    return href;
  }

  resourceUrlForAWSFileName(fileName): string {
    const API_PATH_PREFIX = "api/aws/s3/";
    return this.baseUrl() + "/" + API_PATH_PREFIX + fileName;
  }

  hasRouteParameter(parameter): boolean {
    return this.router.url.split("/").includes(parameter);
  }

  isArea(...areas: string[]): boolean {
    return some(isArray(areas) ? areas : [areas], (area) => {
      const matched = area === this.area();
      this.logger.debug("this.area()", this.area(), "isArea", area, "matched", matched);
      return matched;
    });
  }

  isSubArea(...subAreas: string[]): boolean {
    return some(isArray(subAreas) ? subAreas : [subAreas], (subArea) => {
      const matched = this.areaUrl().includes(subArea);
      this.logger.debug("this.subArea()", this.areaUrl(), "isSubArea", subArea, "matched", matched);
      return matched;
    });
  }

  pageUrl(page?: string): string {
    const pageOrEmpty = (page ? page : "");
    return pageOrEmpty.startsWith("/") ? pageOrEmpty : "/" + pageOrEmpty;
  }

  noArea(): boolean {
    return this.areaUrl() === "";
  }

  areaUrl(): string {
    return tail(new URL(this.absUrl()).pathname.substring(1).split("/")).join("/");
  }
}
