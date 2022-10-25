import { DOCUMENT, Location } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import first from "lodash-es/first";
import isArray from "lodash-es/isArray";
import isEmpty from "lodash-es/isEmpty";
import last from "lodash-es/last";
import some from "lodash-es/some";
import tail from "lodash-es/tail";
import { NgxLoggerLevel } from "ngx-logger";
import { NotificationAWSUrlConfig, NotificationUrlConfig } from "../models/resource.model";
import { SiteEditService } from "../site-edit/site-edit.service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { isMongoId } from "./mongo-utils";

@Injectable({
  providedIn: "root"
})

export class UrlService {
  private logger: Logger;
  private API_PATH_PREFIX = "api/aws/s3/";

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router,
              private location: Location,
              private siteEdit: SiteEditService,
              private loggerFactory: LoggerFactory, private route: ActivatedRoute) {
    this.logger = loggerFactory.createLogger(UrlService, NgxLoggerLevel.OFF);
  }

  pathContains(path: string): boolean {
    return this.location.path().includes(path);
  }

  navigateTo(...pathSegments: string[]): Promise<boolean> {
    if (this.siteEdit.active()) {
      return Promise.resolve(false);
    } else {
      const url = `${this.pageUrl(pathSegments.filter(item => item).join("/"))}`;
      this.logger.debug("navigating to pathSegments:", pathSegments, "->", url);
      return this.router.navigate([url], {relativeTo: this.route, queryParamsHandling: "merge"}).then((activated: boolean) => {
        this.logger.debug("activated:", activated, "area is now:", this.area());
        return activated;
      });
    }
  }

  navigateToUrl(url: string, $event: MouseEvent) {
    if (!this.siteEdit.active()) {
      const controlOrMetaKey: boolean = $event.ctrlKey || $event.metaKey;
      this.logger.info("navigateToUrl:", url, "controlOrMetaKey:", controlOrMetaKey, "$event:", $event);
      if (controlOrMetaKey) {
        window.open(url, "_blank");
      } else {
        this.document.location.href = url;
      }
    }
  }

  relativeUrlFirstSegment(optionalUrl?: string): string {
    const url = new URL(optionalUrl || this.absUrl());
    return "/" + (first(this.toPathSegments(url.pathname.substring(1))) || "");
  }

  absUrl(): string {
    this.logger.debug("absUrl: document.location.href", this.document.location.href);
    return this.document.location.href;
  }

  baseUrl(): string {
    const url = new URL(this.absUrl());
    return `${url.protocol}//${url.host}`;
  }

  relativeUrl(optionalUrl?: string): string {
    const url = new URL(optionalUrl || this.absUrl());
    return "/" + url.pathname.substring(1);
  }

  relativeUrlAsPathSegments(): string[] {
    return this.toPathSegments(this.relativeUrl());
  }

  lastPathSegment() {
    return last(this.relativeUrlAsPathSegments());
  }

  toPathSegments(relativePath: string): string[] {
    return relativePath ? relativePath?.split("/").filter(item => !isEmpty(item)) : [];
  }

  pathContainsMongoId(): boolean {
    return this.isMongoId(this.lastPathSegment());
  }

  isMongoId(id: string): boolean {
    return isMongoId(id);
  }

  resourceUrl(area: string, subArea: string, id: string, relative?: boolean): string {
    return [relative ? null : this.baseUrl(), area, subArea, id].filter(item => !!item).join("/");
  }

  area(optionalUrl?: string): string {
    return this.relativeUrlFirstSegment(optionalUrl).substring(1);
  }

  refresh(): void {
    location.reload();
  }

  notificationHref(linkConfig: NotificationUrlConfig | NotificationAWSUrlConfig): string {
    if (this.isNotificationUrlConfig(linkConfig)) {
      return this.resourceUrl(linkConfig.area, linkConfig.subArea, linkConfig.id, linkConfig.relative);
    } else {
      return this.resourceUrlForAWSFileName(linkConfig.name);
    }
  }

  routerLinkUrl(url: string) {
    const routerLinkUrl = url.startsWith("http") ? null : "/" + url;
    this.logger.info("routerLinkUrl:imageLink", url, "routerLinkUrl:", routerLinkUrl);
    return routerLinkUrl;
  }

  isNotificationUrlConfig(linkConfig: NotificationUrlConfig | NotificationAWSUrlConfig): linkConfig is NotificationUrlConfig {
    return (linkConfig as NotificationUrlConfig).area !== undefined;
  }

  resourceUrlForAWSFileName(fileName): string {
    return this.baseUrl() + "/" + this.API_PATH_PREFIX + fileName;
  }

  resourceRelativePathForAWSFileName(fileName: string): string {
    return this.API_PATH_PREFIX + fileName;
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
