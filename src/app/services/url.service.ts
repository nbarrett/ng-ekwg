import { first, isArray, last, some } from "lodash-es";
import { ActivatedRoute } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { NGXLogger } from "ngx-logger";

@Injectable({
  providedIn: "root"
})

export class UrlService {

  constructor(@Inject(DOCUMENT) private document: Document, private logger: NGXLogger, private route: ActivatedRoute) {
  }

  relativeUrlFirstSegment(optionalUrl?: string) {
    const url = new URL(optionalUrl || this.absUrl());
    return "/" + first(url.pathname.substring(1).split("/"));
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

  isArea(areas) {
    return some(isArray(areas) ? areas : [areas], (area) => {
      const matched = area === this.area();
      this.logger.debug("isArea", area, "matched", matched);
      return matched;
    });
  }

  pageUrl(page?: string) {
    const pageOrEmpty = (page ? page : "");
    return pageOrEmpty.startsWith("/") ? pageOrEmpty : "/" + pageOrEmpty;
  }

  noArea() {
    return this.relativeUrlFirstSegment() === "";
  }


}
