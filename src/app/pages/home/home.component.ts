import { Component, OnDestroy, OnInit } from "@angular/core";
import { take } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { groupEventTypeFor } from "../../models/committee.model";
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
  private selectedSlides: ContentMetadataItem[] = [];
  public slideInterval = 5000;
  private lastTransition: number;
  private addNewSlideInterval: number;
  public hoverActive: boolean;
  private paused = false;

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
    this.logger.debug("ngOnDestroy fired");
    this.clearInterval();
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.imageTagDataService.selectedTag().subscribe(tag => {
      if (tag) {
        this.viewableSlides = [];
        const showRecent: boolean = tag === RECENT_PHOTOS;
        if (showRecent) {
          const excludeFromRecentKeys: number[] = this.imageTagDataService.imageTagsSorted().filter(tag => tag.excludeFromRecent).map(tag => tag.key);
          const sinceDate = this.dateUtils.momentNow().add(-6, "months");
          this.selectedSlides = this.allSlides.filter(file => file.date >= sinceDate.valueOf() && !(file.tags.length === 1 && file.tags.find(tag => excludeFromRecentKeys.includes(tag))));
          this.logger.debug(this.selectedSlides.length, "photos selected from", tag.subject, "since", this.dateUtils.displayDate(sinceDate), "excludeFromRecentKeys:", excludeFromRecentKeys.join(", "));
        } else {
          this.selectedSlides = this.allSlides.filter(file => file?.tags?.includes(tag.key));
          this.logger.debug(this.selectedSlides.length, "slides selected from tag:", tag.subject);
        }
        this.addNewSlideInterval = setInterval(() => this.addNewSlideIfValid(), this.slideInterval);
        this.logger.debug("created add new slide interval:", this.addNewSlideInterval);
        this.addNewSlideIfValid();
      }
    });

    this.contentMetadataService.items("imagesHome")
      .then(contentMetaData => {
        this.allSlides = contentMetaData.files;
        this.imageTagDataService.populateFrom(contentMetaData.imageTags);
        this.logger.debug("initialised with", this.allSlides.length, "slides in total");
        this.addNewSlideIfValid();
      });
    this.instagramService.recentMedia()
      .then((recentMedia: InstagramRecentMediaData) => {
        this.feeds.instagram.recentMedia = take(recentMedia.data, 14);
        this.logger.debug("Refreshed social media", this.feeds.instagram.recentMedia, "count =", this.feeds.instagram.recentMedia.length);
      });
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

  eventTooltip(slide: ContentMetadataItem) {
    return "Show details of this " + (groupEventTypeFor(slide.dateSource)?.description || slide.dateSource).toLowerCase();
  }

  addNewSlideIfValid(force?: boolean) {
    this.logger.debug("addNewSlideIfValid called");
    if (force) {
      this.addNewSlide();
    } else if (this.paused) {
      this.logger.debug("paused - not adding new slide");
    } else if (this.viewableSlides.length === 0) {
      this.addNewSlide();
    } else if (this.viewableSlides.length < this.selectedSlides.length) {
      if (this.dateUtils.momentNow().valueOf() - this.slideInterval <= this.lastTransition) {
        this.logger.debug("this.viewableSlides.length", this.viewableSlides.length, "not adding new slide as previous one added ", this.dateUtils.displayDateAndTime(this.lastTransition));
      } else {
        this.addNewSlide();
      }
    } else {
      this.logger.debug("addNewSlide:all", this.viewableSlides.length, "slides added to carousel");
      this.clearInterval();
    }
  }

  private addNewSlide() {
    const slide = this.selectedSlides[this.viewableSlides.length];
    if (slide) {
      this.logger.debug("addNewSlide:adding slide", this.viewableSlides.length + 1, "of", this.selectedSlides.length, slide.text, slide.image);
      this.viewableSlides.push(slide);
      this.lastTransition = this.dateUtils.momentNow().valueOf();
    }
  }

  private clearInterval() {
    this.logger.debug("clearing slide interval:", this.addNewSlideInterval);
    clearInterval(this.addNewSlideInterval);
    this.addNewSlideInterval = 0;
  }

  activeSlideChange() {
    this.logger.debug("activeSlideChange");
    this.addNewSlideIfValid(true);
  }

  mouseEnter($event: MouseEvent) {
    this.logger.debug("mouseEnter", $event);
    this.paused = true;
  }

  mouseLeave($event: MouseEvent) {
    this.logger.debug("mouseLeave", $event);
    this.paused = false;
  }

  hoverEvent(hoverActive: boolean) {
    this.hoverActive = hoverActive;
  }
}
