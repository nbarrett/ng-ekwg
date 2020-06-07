import { Component, OnDestroy, OnInit } from "@angular/core";
import clone from "lodash-es/clone";
import take from "lodash-es/take";
import { NgxLoggerLevel } from "ngx-logger";
import { ContentMetadataItem } from "../../models/content-metadata.model";
import { InstagramMediaPost, InstagramRecentMediaData } from "../../models/instagram.model";
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
export class HomeComponent implements OnInit, OnDestroy {
  private logger: Logger;
  public feeds: { facebook: {}; instagram: { recentMedia: InstagramMediaPost[] } };
  public loadedSlides: ContentMetadataItem[] = [];
  private availableSlides: ContentMetadataItem[] = [];
  public slideInterval = 5000;
  public slideDisplayInterval = clone(this.slideInterval);
  private addNewSlideInterval: number;

  constructor(
    private  memberLoginService: MemberLoginService,
    private  contentMetaDataService: ContentMetadataService,
    private  siteEditService: SiteEditService,
    private  instagramService: InstagramService,
    private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(HomeComponent, NgxLoggerLevel.OFF);
    this.feeds = {instagram: {recentMedia: []}, facebook: {}};
  }

  ngOnDestroy(): void {
    this.clearInterval();
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
      .then((recentMedia: InstagramRecentMediaData) => {
        this.feeds.instagram.recentMedia = take(recentMedia.data, 14);
        this.logger.debug("Refreshed social media", this.feeds.instagram.recentMedia, "count =", this.feeds.instagram.recentMedia.length);
      });
    this.addNewSlideInterval = setInterval(() => this.addNewSlide(), this.slideInterval);
    this.logger.debug("created add new slide interval:", this.addNewSlideInterval);
  }

  slideTracker(index: number, item: ContentMetadataItem) {
    return item.image;
  }

  slidesFunction() {
    this.logger.debug("slidesFunction - length:", this.loadedSlides.length);
    return this.loadedSlides;
  }

  allowEdits() {
    return this.siteEditService.active() && this.memberLoginService.allowContentEdits();
  }

  addNewSlide(force?: boolean) {
    if (force || this.slideDisplayInterval > 0) {
      this.logger.debug("addNewSlide - slide count:", this.loadedSlides.length);
      if (this.loadedSlides.length < this.availableSlides.length) {
        this.logger.debug("adding slide", this.loadedSlides.length + 1);
        this.loadedSlides.push(this.availableSlides[this.loadedSlides.length]);
      } else {
        this.logger.debug("no more slides to add:", this.loadedSlides.length);
        this.clearInterval();
      }
    } else {
      this.logger.debug("paused - not adding new slide");
    }
  }

  private clearInterval() {
    this.logger.debug("clearing add new slide:", this.addNewSlideInterval);
    clearInterval(this.addNewSlideInterval);
  }

  activeSlideChange(slideNumber: number) {
    this.logger.debug("displaying slide:", slideNumber + 1, "slide count:", this.loadedSlides.length);
    if (this.loadedSlides.length < this.availableSlides.length && slideNumber === this.loadedSlides.length - 1) {
      this.addNewSlide(true);
    }
  }

  mouseEnter($event: MouseEvent) {
    this.logger.debug("mouseEnter", $event);
    this.slideDisplayInterval = 0;
  }

  mouseLeave($event: MouseEvent) {
    this.logger.debug("mouseLeave", $event);
    this.slideDisplayInterval = clone(this.slideInterval);
  }
}
