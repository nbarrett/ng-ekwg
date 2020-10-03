import { Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { ContentMetadataItem } from "../../../models/content-metadata.model";
import { SocialEventsPermissions } from "../../../models/social-events.model";
import { Confirm } from "../../../models/ui-actions";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-social-information",
  styleUrls: ["./social-information.component.sass"],
  templateUrl: "./social-information.component.html",
})
export class SocialInformationComponent implements OnInit {
  @Input()
  public allow: SocialEventsPermissions;
  @Input()
  public confirm: Confirm;
  @Input()
  public notifyTarget: AlertTarget;
  public slides: ContentMetadataItem[];

  constructor(private contentMetadataService: ContentMetadataService,
              private urlService: UrlService,
              protected dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SocialInformationComponent, NgxLoggerLevel.OFF);
  }

  private logger: Logger;

  ngOnInit() {
    this.refreshImages();
  }

  refreshImages() {
    this.contentMetadataService.items("imagesSocialEvents")
      .then((contentMetaData) => {
        this.slides = contentMetaData.files;
        this.logger.debug("found", contentMetaData.files.length, "slides");
      });
  }

}
