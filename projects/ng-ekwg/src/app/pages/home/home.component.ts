import { Component, OnDestroy, OnInit } from "@angular/core";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { NgxLoggerLevel } from "ngx-logger";
import { groupEventTypeFor } from "../../models/committee.model";
import { ContentMetadataItem } from "../../models/content-metadata.model";
import { ContentMetadataService } from "../../services/content-metadata.service";
import { ImageTagDataService } from "../../services/image-tag-data-service";
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
  public feeds: { facebook: {} };
  public viewableSlides: ContentMetadataItem[] = [];
  private allSlides: ContentMetadataItem[] = [];
  public selectedSlides: ContentMetadataItem[] = [];
  public slideInterval = 5000;
  public hoverActive: boolean;
  activeSlideIndex = 0;
  public showIndicators: boolean;
  faPencil = faPencil;
  constructor(
    public imageTagDataService: ImageTagDataService,
    private memberLoginService: MemberLoginService,
    private contentMetadataService: ContentMetadataService,
    private siteEditService: SiteEditService,
    private urlService: UrlService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(HomeComponent, NgxLoggerLevel.OFF);
    this.feeds = {facebook: {}};
  }

  ngOnDestroy(): void {
    this.logger.debug("ngOnDestroy fired");
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.imageTagDataService.selectedTag().subscribe(tag => {
      if (tag) {
        this.viewableSlides = [];
        this.activeSlideIndex = 0;
        this.selectedSlides = this.contentMetadataService.filterSlides(this.allSlides, tag);
        this.logger.debug("clearing existing slides to display", tag.subject, "allSlides:", this.allSlides.length, "this.selectedSlides:", this.selectedSlides.length);
        this.addNewSlide();
      }
    });

    this.contentMetadataService.items("imagesHome")
      .then(contentMetaData => {
        this.allSlides = contentMetaData.files;
        this.imageTagDataService.populateFrom(contentMetaData.imageTags);
        this.logger.debug("initialised with", this.allSlides.length, "slides in total");
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

  activeSlideChange(force: boolean, $event: number) {
    this.logger.debug("activeSlideChange:force", force, "$event:", $event, "activeSlideIndex:", this.activeSlideIndex);
    this.addNewSlide();
  }

  private addNewSlide() {
    const slide = this.selectedSlides[this.viewableSlides.length];
    if (slide) {
      this.logger.debug("addNewSlide:adding slide", this.viewableSlides.length + 1, "of", this.selectedSlides.length, slide.text, slide.image);
      this.viewableSlides.push(slide);
      this.showIndicators = this.viewableSlides.length <= 20;
    } else {
      this.logger.debug("addNewSlide:no slides selected from", this.selectedSlides.length, "available");
    }
  }

  hoverEvent(hoverActive: boolean) {
    this.hoverActive = hoverActive;
  }
}
