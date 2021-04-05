import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { ImageTag } from "../models/content-metadata.model";
import { ImageTagDataService } from "../services/image-tag-data-service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-carousel-story-navigator",
  templateUrl: "./carousel-story-navigator.component.html",
  styleUrls: ["./carousel-story-navigator.component.sass"]

})
export class CarouselStoryNavigatorComponent implements OnInit {
  private logger: Logger;

  constructor(public imageTagDataService: ImageTagDataService,
              private urlService: UrlService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CarouselStoryNavigatorComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const story = params["story"];
      this.logger.debug("story:", story);
      this.imageTagDataService.select(story);
    });
  }

  showTag(tag: ImageTag) {
    this.router.navigate([], {
      queryParams: {story: tag.key}, queryParamsHandling: "merge"
    });
    this.imageTagDataService.select(tag);
  }

}
