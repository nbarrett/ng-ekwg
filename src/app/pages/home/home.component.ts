import { Component, OnDestroy, OnInit } from "@angular/core";
import { take } from "lodash-es";
import clone from "lodash-es/clone";
import { NgxLoggerLevel } from "ngx-logger";
import { ContentMetadataItem, RECENT_PHOTOS } from "../../models/content-metadata.model";
import { InstagramMediaPost, InstagramRecentMediaData } from "../../models/instagram.model";
import { ContentMetadataService } from "../../services/content-metadata.service";
import { DateUtilsService } from "../../services/date-utils.service";
import { ImageTagDataService } from "../../services/image-tag-data-service";
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
  public viewableSlides: ContentMetadataItem[] = [];
  private allSlides: ContentMetadataItem[] = [];
  private selectedStorySlides: ContentMetadataItem[] = [];
  public slideInterval = 5000;
  public slideDisplayInterval = clone(this.slideInterval);
  private addNewSlideInterval: number;

  constructor(
    public imageTagDataService: ImageTagDataService,
    private  memberLoginService: MemberLoginService,
    private  contentMetadataService: ContentMetadataService,
    private  siteEditService: SiteEditService,
    private  dateUtils: DateUtilsService,
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
    this.imageTagDataService.selectedTag().subscribe(tag => {
      if (tag) {
        this.viewableSlides = [];
        const excludeFromRecentKeys: number[] = this.imageTagDataService.imageTagsSorted().filter(tag => tag.excludeFromRecent).map(tag => tag.key);
        const sinceDate = this.dateUtils.momentNow().add(-6, "months");
        const showRecentPhotos: boolean = tag === RECENT_PHOTOS;
        this.selectedStorySlides = this.allSlides.filter(file => showRecentPhotos ?
          file.date >= sinceDate.valueOf() && !file.tags.find(tag => excludeFromRecentKeys.includes(tag))
          : file?.tags?.includes(tag.key));
        this.logger.info(this.selectedStorySlides.length, "slides selected from tag:", tag.subject, "excludeFromRecentKeys:", excludeFromRecentKeys.join(", "), "sinceDate:", this.dateUtils.displayDate(sinceDate));
        this.addNewSlide();
      }
    });

    this.contentMetadataService.items("imagesHome")
      .then(contentMetaData => {
        this.allSlides = contentMetaData.files;
        this.imageTagDataService.populateFrom(contentMetaData.imageTags);
        this.logger.debug("initialised with", this.allSlides.length, "slides in total");
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
    this.logger.debug("slidesFunction - length:", this.viewableSlides.length);
    return this.viewableSlides;
  }

  allowEdits() {
    return this.siteEditService.active() && this.memberLoginService.allowContentEdits();
  }

  eventUrl(slide: ContentMetadataItem) {
    return this.urlService.notificationHref({
      area: slide.dateSource,
      id: slide.eventId
    });
  }

  addNewSlide(force?: boolean) {
    if (force || this.slideDisplayInterval > 0) {
      this.logger.info("addNewSlide - slide count:", this.viewableSlides.length);
      if (this.viewableSlides.length < this.selectedStorySlides.length) {
        this.logger.info("adding slide", this.viewableSlides.length + 1);
        this.viewableSlides.push(this.selectedStorySlides[this.viewableSlides.length]);
      } else {
        this.logger.info("no more slides to add:", this.viewableSlides.length);
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
    this.logger.debug("displaying slide:", slideNumber + 1, "slide count:", this.viewableSlides.length);
    if (this.viewableSlides.length < this.selectedStorySlides.length && slideNumber === this.viewableSlides.length - 1) {
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
