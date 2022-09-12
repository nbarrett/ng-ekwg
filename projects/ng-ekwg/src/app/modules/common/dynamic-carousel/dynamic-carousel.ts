import { Component, HostListener, Input, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { max, min } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { PageContent, PageContentColumn, PageContentRow } from "../../../models/content-text.model";
import { DeviceSize } from "../../../models/page.model";
import { ContentTextNamingService } from "../../../services/content-text-naming.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-dynamic-carousel",
  templateUrl: "./dynamic-carousel.html",
  styleUrls: ["./dynamic-carousel.sass"]
})
export class DynamicCarouselComponent implements OnInit {
  @Input()
  public pageContent: PageContent;
  @Input()
  public rowIndex: number;
  rows: PageContentRow[];
  private logger: Logger;
  public contentPath: string;
  public slideIndex = 0;
  public width: number;
  public maxViewableSlideCount: number;
  public actualViewableSlideCount: number;
  public relativePath: string;
  private area: string;

  constructor(
    private urlService: UrlService,
    private stringUtils: StringUtilsService,
    private route: ActivatedRoute,
    public namingService: ContentTextNamingService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(DynamicCarouselComponent, NgxLoggerLevel.INFO);
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.detectWidth(event.target.innerWidth);
  }

  ngOnInit() {
    // this.columns.push(
    //   {
    //     href: "https://beta.ramblers.org.uk/go-walking-hub/walking-boots-buyers-guide",
    //     // text: "Choose the right footwear to get the maximum enjoyment from your walk. Read our expert advice on choosing the right walking boots for you.",
    //     title: "Walking boots Buyer’s Guide",
    //     imageSource: "https://prod-static.ramblers.nomensa.xyz/styles/large/s3/2022-01/walking-boots-buyers-guide.jpg?itok=zj0_lzql"
    //   },
    //   {
    //     href: "https://beta.ramblers.org.uk/go-walking-hub/walking-poles-buyers-guide",
    //     // text: "You may find walking poles useful for long-distance hikes.  Read our expert advice on choosing the right poles for you.",
    //     title: "Walking poles Buyer's Guide",
    //     imageSource: "https://prod-static.ramblers.nomensa.xyz/styles/large/s3/2022-01/walking-poles-19283318b.jpg?itok=siSdvBqB"
    //   },
    //   {
    //     href: "https://beta.ramblers.org.uk/go-walking-hub/walking-trousers-buyers-guide",
    //     // text: "A good pair of walking trousers will make your walks more comfortable.\n" +
    //     //   "Read our expert advice on choosing the right trousers for you.",
    //     title: "Walking trousers Buyer's Guide",
    //     imageSource: "https://prod-static.ramblers.nomensa.xyz/styles/large/s3/2022-01/Trousers-Inverness-Young-Walkers-Oct-2021---B.jpg?itok=ogqkK_mE"
    //   },
    //   {
    //     href: "https://beta.ramblers.org.uk/go-walking-hub/waterproof-jackets-buyers-guide",
    //     // text: "A good waterproof jacket will help you enjoy your walks whatever the weather.\n" +
    //     //   "Read our expert advice on choosing the right jacket for you.",
    //     title: "Walking jacket Buyer's Guide",
    //     imageSource: "https://prod-static.ramblers.nomensa.xyz/styles/large/s3/2022-01/Ramblers-Winter-Oct-2021-4980-2.jpg?itok=QySKZZck"
    //   }
    // );
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.area = this.urlService.area();
      this.relativePath = paramMap.get("relativePath");
      this.contentPath = `${this.area}/${this.relativePath}`;
      this.logger.debug("initialised with path:", this.relativePath);
      this.logger.debug("Finding page content for " + this.relativePath);
    });

    this.detectWidth(window.innerWidth);
    this.actualViewableSlideCount = min([this.pageContentColumns().length, this.maxViewableSlideCount]);

  }

  pageContentColumns(): PageContentColumn[] {
    return this.pageContent.rows[this.rowIndex].columns;
  }

// col-sm for larger mobile phones (devices with resolutions ≥ 576px);
// col-md for tablets (≥768px);
// col-lg for laptops (≥992px);
// col-xl for desktops (≥1200px)

  private detectWidth(width: number) {
    this.width = width;
    if (width <= DeviceSize.SMALL) {
      this.maxViewableSlideCount = 1;
    } else if (width <= DeviceSize.LARGE) {
      this.maxViewableSlideCount = 2;
    } else if (width <= DeviceSize.EXTRA_LARGE) {
      this.maxViewableSlideCount = 3;
    } else {
      this.maxViewableSlideCount = 4;
    }
  }

  slideClasses() {
    switch (this.actualViewableSlideCount) {
      case 4:
        return "mb-4 col-sm-12 col-md-6 col-lg-4 col-xl-3";
      case 3:
        return "mb-4 col-sm-12 col-md-6 col-lg-4 col-xl-4";
      case 2:
        return "mb-4 col-sm-12 col-md-6 col-lg-6 col-xl-6";
      default :
        return "mb-4 col-sm-12";
    }
  }

  viewableColumns(): PageContentColumn[] {
    const viewableSlides = this.pageContentColumns().slice(this.slideIndex, this.slideIndex + this.maxViewableSlideCount);
    this.logger.info("viewableSlides:slideIndex", this.slideIndex, "this.slides", this.pageContentColumns(), "viewableSlideCount:", this.maxViewableSlideCount, "viewableSlides:", viewableSlides);
    return viewableSlides;
  }

  back() {
    this.slideIndex = max([0, this.slideIndex - 1]);
    this.logger.info("back:slideIndex", this.slideIndex);
  }

  forward() {
    if (this.maxViewableSlideCount + this.slideIndex < this.pageContentColumns().length) {
      this.slideIndex = min([this.slideIndex + 1, this.pageContentColumns().length - 1]);
      this.logger.info("forward:slideIndex", this.slideIndex);
    } else {
      this.logger.info("forward:cant go further - slideIndex", this.slideIndex);
    }
  }

}
