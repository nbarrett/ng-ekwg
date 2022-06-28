import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { take } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { InstagramMediaPost, InstagramRecentMediaData } from "../../models/instagram.model";
import { DateUtilsService } from "../../services/date-utils.service";
import { InstagramService } from "../../services/instagram.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { UrlService } from "../../services/url.service";

@Component({
  selector: "app-facebook",
  templateUrl: "./facebook.component.html",
  styleUrls: ["./facebook.component.sass"]
})
export class FacebookComponent implements OnInit {
  private logger: Logger;
  public recentMedia: InstagramMediaPost[];
  url: any;
  width = "560";
  height = "612";
  facebookUrl = "https%3A%2F%2Fwww.facebook.com%2Feastkentwalking%2F";

  constructor(private urlService: UrlService,
              private instagramService: InstagramService,
              public dateUtils: DateUtilsService,
              private sanitiser: DomSanitizer,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(FacebookComponent, NgxLoggerLevel.DEBUG);
  }

  imageWidth(media: InstagramMediaPost): string {
    return this.recentMedia.indexOf(media) <= 1 ? "50%" : "25%";
  }

  parameters() {
    return [
      "href=" + this.facebookUrl,
      "tabs=timeline&width=" + this.width + "&height=" + this.height,
      "small_header=false",
      "adapt_container_width=true",
      "hide_cover=false",
      "show_facepile=true",
      "appId=643977439755625"
    ].join("&");
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");

    this.url = this.sanitiser.bypassSecurityTrustResourceUrl("https://www.facebook.com/plugins/page.php?" + this.parameters()
    );
    this.instagramService.recentMedia()
      .then((recentMedia: InstagramRecentMediaData) => {
        this.recentMedia = take(recentMedia.data, 14);
        this.logger.debug("Refreshed instagram recent media", this.recentMedia, "count =", this.recentMedia.length);
      });
  }

  dimensions() {
    return `width: ${this.width}; height: ${this.height};`;
  }
}
