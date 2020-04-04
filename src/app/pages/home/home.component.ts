import { Component, OnInit } from "@angular/core";
import take from "lodash-es/take";
import { NgxLoggerLevel } from "ngx-logger";
import { ContentMetadataItem } from "../../models/content-metadata.model";
import { ContentMetadataService } from "../../services/content-metadata.service";
import { InstagramService } from "../../services/instagram.service";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { MemberLoginService } from "../../services/member/member-login.service";
import { UrlService } from "../../services/url.service";
import { SiteEditService } from "../../site-edit/site-edit.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  // styleUrls: ["./home.component.sass"]
})
export class HomeComponent implements OnInit {
  private logger: Logger;
  public feeds: { facebook: {}; instagram: { recentMedia: any[] } };
  public slides: ContentMetadataItem[] = [];
  public interval: number;
  private files: ContentMetadataItem[] = [];

  constructor(
    private  memberLoginService: MemberLoginService,
    private  contentMetaDataService: ContentMetadataService,
    private  siteEditService: SiteEditService,
    private  instagramService: InstagramService,
    private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(HomeComponent, NgxLoggerLevel.DEBUG);
    this.feeds = {instagram: {recentMedia: []}, facebook: {}};
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.contentMetaDataService.items("imagesHome")
      .then(contentMetaData => {
        this.interval = 5000;
        this.files = contentMetaData.files;
        this.slides.push(contentMetaData.files[0]);
      });
    this.instagramService.recentMedia()
      .then(recentMedia => {
        this.feeds.instagram.recentMedia = take(recentMedia, 14);
        this.logger.debug("Refreshed social media", this.feeds.instagram.recentMedia, "count =", this.feeds.instagram.recentMedia.length);
      });
  }

  mediaUrlFor(media) {
    this.logger.off("mediaUrlFor:media", media);
    return (media && media.images) ? media.images.standard_resolution.url : "";
  }

  mediaCaptionFor(media) {
    this.logger.off("mediaCaptionFor:media", media);
    return media ? media.caption.text : "";
  }

  allowEdits() {
    return this.siteEditService.active() && this.memberLoginService.allowContentEdits();
  }

  log(slide: number) {
    this.logger.debug("slide", slide);
    if (this.slides.length < this.files.length) {
      this.slides.push(this.files[this.slides.length]);
    }
  }
}
