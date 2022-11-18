import { Component, OnInit } from "@angular/core";
import { take } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { InstagramMediaPost, InstagramRecentMediaData } from "../../models/instagram.model";
import { DateUtilsService } from "../../services/date-utils.service";
import { InstagramService } from "../../services/instagram.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { UrlService } from "../../services/url.service";

@Component({
  selector: "app-instagram",
  templateUrl: "./instagram.component.html",
  styleUrls: ["./instagram.component.sass"]
})
export class InstagramComponent implements OnInit {
  private logger: Logger;
  public recentMedia: InstagramMediaPost[];

  constructor(private urlService: UrlService,
              private instagramService: InstagramService,
              public dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(InstagramComponent, NgxLoggerLevel.OFF);
  }

  imageWidth(media: InstagramMediaPost): string {
    return this.recentMedia.indexOf(media) <= 1 ? "50%" : "25%";
  }

  imageHeight(media: InstagramMediaPost): string {
    return this.recentMedia.indexOf(media) <= 1 ? "250px" : "130px";
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.instagramService.recentMedia()
      .then((recentMedia: InstagramRecentMediaData) => {
        this.recentMedia = take(recentMedia.data, 14);
        this.logger.debug("Refreshed instagram recent media", this.recentMedia, "count =", this.recentMedia.length);
      });
  }

}
