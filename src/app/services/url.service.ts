import { Inject, Injectable } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import first from "lodash-es/first";
import last from "lodash-es/last";
import { NGXLogger } from "ngx-logger";

@Injectable({
  providedIn: "root"
})

export class UrlService {

  constructor(@Inject(DOCUMENT) private document: Document, private logger: NGXLogger) {
  }

  relativeUrlFirstSegment(optionalUrl?: string) {
    const relativeUrlValue = this.relativeUrl(optionalUrl);
    const index = relativeUrlValue.indexOf("/", 1);
    return index === -1 ? relativeUrlValue : relativeUrlValue.substring(0, index);
  }

  absUrl() {
    this.logger.debug("absUrl: document.location.href", this.document.location.href);
    return this.document.location.href;
  }

  baseUrl(optionalUrl?: string) {
    return first((optionalUrl || this.absUrl()).split("/#"));
  }

  relativeUrl(optionalUrl?: string) {
    return last((optionalUrl || this.absUrl()).split("/#"));
  }

  resourceUrl(area: string, type: string, id: string) {
    return this.baseUrl() + "/#/" + area + "/" + type + "Id/" + id;
  }

  area(optionalUrl?: string) {
    return this.relativeUrlFirstSegment(optionalUrl).substring(1);
  }

}
