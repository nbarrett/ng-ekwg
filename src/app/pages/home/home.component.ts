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
  styleUrls: ["./home.component.sass"]
})
export class HomeComponent implements OnInit {
  private logger: Logger;
  public feeds: { facebook: {}; instagram: { recentMedia: any[] } };
  public loadedSlides: ContentMetadataItem[] = [];
  private availableSlides: ContentMetadataItem[] = [];
  public slideInterval = 5000;
  private interval: number;

  constructor(
    private  memberLoginService: MemberLoginService,
    private  contentMetaDataService: ContentMetadataService,
    private  siteEditService: SiteEditService,
    private  instagramService: InstagramService,
    private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(HomeComponent, NgxLoggerLevel.OFF);
    this.feeds = {instagram: {recentMedia: []}, facebook: {}};
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.contentMetaDataService.items("imagesHome")
      .then(contentMetaData => {
        this.availableSlides = take(contentMetaData.files, contentMetaData.files.length);
        this.logger.debug("initialised with", this.availableSlides.length, "available slides");
        this.addNewSlide();
      });
    this.instagramService.recentMedia()
      .then(recentMedia => {
        this.feeds.instagram.recentMedia = take(recentMedia, 14);
        this.logger.debug("Refreshed social media", this.feeds.instagram.recentMedia, "count =", this.feeds.instagram.recentMedia.length);
      });
    this.interval = setInterval(() => this.addNewSlide(), this.slideInterval);
    this.logger.debug("created interval:", this.interval);
  }

  slideTracker(index: number, item: ContentMetadataItem) {
    return item.image;
  }

  slidesFunction() {
    this.logger.debug("slidesFunction - length:", this.loadedSlides.length);
    return this.loadedSlides;
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

  addNewSlide() {
    this.logger.debug("addNewSlide - slide count:", this.loadedSlides.length);
    if (this.loadedSlides.length < this.availableSlides.length) {
      this.logger.debug("adding slide", this.loadedSlides.length + 1);
      this.loadedSlides.push(this.availableSlides[this.loadedSlides.length]);
    } else {
      this.logger.debug("no more slides to add:", this.loadedSlides.length);
      clearInterval(this.interval);
    }
  }

  activeSlideChange(slideNumber: number) {
    this.logger.debug("displaying slide:", slideNumber + 1, "slide count:", this.loadedSlides.length);
    if (this.loadedSlides.length < this.availableSlides.length && slideNumber === this.loadedSlides.length - 1) {
      this.addNewSlide();
    }
  }
}
