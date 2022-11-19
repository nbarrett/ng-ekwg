import { Component, OnInit } from "@angular/core";
import { take } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { InstagramMediaPost, InstagramRecentMediaData } from "../../models/instagram.model";
import { ExternalUrls } from "../../models/system.model";
import { DateUtilsService } from "../../services/date-utils.service";
import { InstagramService } from "../../services/instagram.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { SystemConfigService } from "../../services/system/system-config.service";
import { UrlService } from "../../services/url.service";

@Component({
  selector: "app-instagram",
  templateUrl: "./instagram.component.html",
  styleUrls: ["./instagram.component.sass"]
})
export class InstagramComponent implements OnInit {
  private logger: Logger;
  public recentMedia: InstagramMediaPost[];
  public externalUrls: ExternalUrls;

  constructor(private urlService: UrlService,
              private instagramService: InstagramService,
              private systemConfigService: SystemConfigService,
              public dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(InstagramComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.systemConfigService.events().subscribe(item => this.externalUrls = item.system.externalUrls);
    this.instagramService.recentMedia()
      .then((recentMedia: InstagramRecentMediaData) => {
        this.recentMedia = take(recentMedia.data, 14);
        this.logger.debug("Refreshed instagram recent media", this.recentMedia, "count =", this.recentMedia.length);
      });
  }

  imageWidth(media: InstagramMediaPost): string {
    return this.recentMedia.indexOf(media) <= 1 ? "50%" : "25%";
  }

  imageHeight(media: InstagramMediaPost): string {
    return this.recentMedia.indexOf(media) <= 1 ? "250px" : "130px";
  }

  instagramPath() {
    return this.urlService.urlPath(this.externalUrls?.instagram?.groupUrl)
  }
}
