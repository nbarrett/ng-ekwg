import { Injectable } from "@angular/core";
import isEmpty from "lodash-es/isEmpty";
import last from "lodash-es/last";
import { NgxLoggerLevel } from "ngx-logger";
import { ContentMetadataService } from "./services/content-metadata.service";
import { DateUtilsService } from "./services/date-utils.service";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { UrlService } from "./services/url.service";

@Injectable({
  providedIn: "root"
})
export class FileUtilsService {
  private logger: Logger;

  constructor(protected dateUtils: DateUtilsService,
              private contentMetadataService: ContentMetadataService,
              private urlService: UrlService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(FileUtilsService, NgxLoggerLevel.OFF);
  }

  basename(path) {
    return path.split(/[\\/]/).pop();
  }

  path(path) {
    return path.split(this.basename(path))[0];
  }

  attachmentTitle(resource, container, resourceName) {
    return (resource && isEmpty(this.getFileNameData(resource, container)) ? "Attach" : "Replace") + " " + resourceName;
  }

  getFileNameData(resource, container) {
    return container ? resource[container].fileNameData : resource.fileNameData;
  }

  resourceUrl(resource, container, metaDataPathSegment) {
    const fileNameData = this.getFileNameData(resource, container);
    return resource && fileNameData ? this.urlService.baseUrl() + this.contentMetadataService.baseUrl(metaDataPathSegment) + "/" + fileNameData.awsFileName : "";
  }

  resourceTitle(resource) {
    this.logger.debug("resourceTitle:resource =>", resource);
    return resource ? (this.dateUtils.asString(resource.resourceDate, undefined, this.dateUtils.formats.displayDateTh) + " - " + (resource.data ? resource.data.fileNameData.title : "")) : "";
  }

  fileExtensionIs(fileName, extensions: string[]) {
    return extensions.includes(this.fileExtension(fileName));
  }

  fileExtension(fileName: string) {
    return fileName ? last(fileName.split(".")).toLowerCase() : "";
  }

  icon(resource, container) {
    let icon = "icon-default.jpg";
    const fileNameData = this.getFileNameData(resource, container);
    if (fileNameData && this.fileExtensionIs(fileNameData.awsFileName, ["doc", "docx", "jpg", "pdf", "ppt", "png", "txt", "xls", "xlsx"])) {
      icon = "icon-" + this.fileExtension(fileNameData.awsFileName).substring(0, 3) + ".jpg";
    }
    return "images/ramblers/" + icon;
  }

}
