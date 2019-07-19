import isArray from "lodash-es/isArray";
import last from "lodash-es/last";
import some from "lodash-es/some";
import tail from "lodash-es/tail";
import { ActivatedRoute, Router } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { first } from "lodash-es";

@Injectable({
  providedIn: "root"
})

export class UrlService {
  private logger: Logger;

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router,
              private loggerFactory: LoggerFactory, private route: ActivatedRoute) {
    this.logger = loggerFactory.createLogger(UrlService, NgxLoggerLevel.INFO);
  }

  relativeUrlFirstSegment(optionalUrl?: string) {
    const url = new URL(optionalUrl || this.absUrl());
    return "/" + first(url.pathname.substring(1).split("/"));
  }

  navigateTo(page?: string, area?: string) {
    const url = `${this.pageUrl(page)}${area ? "/" + area : ""}`;
    this.logger.info("navigating to page:", page, "area:", area, "->", url);
    this.router.navigate([url], {relativeTo: this.route}).then(() => {
      this.logger.info("area is now", this.area());
    });
  }

  absUrl() {
    this.logger.debug("absUrl: document.location.href", this.document.location.href);
    return this.document.location.href;
  }

  baseUrl(optionalUrl?: string) {
    const url = new URL(optionalUrl || this.absUrl());
    return `${url.protocol}//${url.host}`;
  }

  relativeUrl(optionalUrl?: string) {
    return last((optionalUrl || this.absUrl()).split("/"));
  }

  resourceUrl(area: string, type: string, id: string) {
    return this.baseUrl() + "/" + area + "/" + type + "Id/" + id;
  }

  area(optionalUrl?: string) {
    return this.relativeUrlFirstSegment(optionalUrl).substring(1);
  }

  refresh() {
    location.reload(true);
  }

  notificationHref(ctrl) {
    const href = (ctrl.name) ? this.resourceUrlForAWSFileName(ctrl.name) : this.resourceUrl(ctrl.area, ctrl.type, ctrl.id);
    this.logger.debug("href:", href);
    return href;
  }

  resourceUrlForAWSFileName(fileName) {
    const API_PATH_PREFIX = "api/aws/s3/";
    return this.baseUrl() + "/" + API_PATH_PREFIX + fileName;
  }

  hasRouteParameter(parameter) {
    const has = this.route.snapshot.url.includes(parameter);
    this.logger.debug("hasRouteParameter", parameter, has);
    return has;
  }

  isArea(...areas: string[]) {
    return some(isArray(areas) ? areas : [areas], (area) => {
      const matched = area === this.area();
      this.logger.debug("this.area()", this.area(), "isArea", area, "matched", matched);
      return matched;
    });
  }

  isSubArea(...subAreas: string[]) {
    return some(isArray(subAreas) ? subAreas : [subAreas], (subArea) => {
      const matched = this.areaUrl().includes(subArea);
      this.logger.debug("this.subArea()", this.areaUrl(), "isSubArea", subArea, "matched", matched);
      return matched;
    });
  }

  pageUrl(page?: string) {
    const pageOrEmpty = (page ? page : "");
    return pageOrEmpty.startsWith("/") ? pageOrEmpty : "/" + pageOrEmpty;
  }

  noArea() {
    return this.areaUrl() === "";
  }


  areaUrl() {
    return tail(new URL(this.absUrl()).pathname.substring(1).split("/")).join("/");
  }
}
