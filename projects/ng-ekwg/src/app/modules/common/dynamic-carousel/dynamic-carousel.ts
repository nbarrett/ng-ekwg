import { Component, HostListener, Input, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { max, min, uniq } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { AwsFileData } from "../../../models/aws-object.model";
import { NamedEventType } from "../../../models/broadcast.model";
import { PageContent, PageContentColumn, PageContentRow } from "../../../models/content-text.model";
import { DeviceSize } from "../../../models/page.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { slideClasses } from "../../../services/card-utils";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { PageContentActionsService } from "../../../services/page-content-actions.service";
import { PageContentService } from "../../../services/page-content.service";
import { PageService } from "../../../services/page.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";

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
  @Input()
  public editNameEnabled: boolean;

  public rows: PageContentRow[];
  private logger: Logger;
  public contentPath: string;
  public slideIndex = 0;
  private marginBottom = "mb-4";
  public maxViewableSlideCount: number;
  public actualViewableSlideCount: number;
  public relativePath: string;
  public row: PageContentRow;
  siteLinks: string[];
  public awsFileData: AwsFileData;
  public activeEditColumnIndex: number;
  public faPencil = faPencil;

  constructor(
    public siteEditService: SiteEditService,
    private urlService: UrlService,
    private pageService: PageService,
    private stringUtils: StringUtilsService,
    private route: ActivatedRoute,
    public pageContentService: PageContentService,
    public actions: PageContentActionsService,
    private broadcastService: BroadcastService<PageContent>,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(DynamicCarouselComponent, NgxLoggerLevel.INFO);
  }

  @HostListener("window:resize", ["event"])
  onResize() {
    this.detectWidth();
  }

  ngOnInit() {
    this.row = this.pageContent.rows[this.rowIndex];
    this.logger.info("ngOnInit:editNameEnabled", this.editNameEnabled);
    this.pageContentService.all().then(response => {
      this.logger.info("pageContentService.all:", response);
      this.siteLinks = uniq(response.map(item => item.path)).sort();
      this.logger.info("siteLinks:", this.siteLinks);
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.relativePath = paramMap.get("relativePath");
      this.contentPath = this.pageService.contentPath(this.relativePath);
      this.logger.info("initialised with contentPath:", this.contentPath);
    });
    this.detectWidth();
    this.pageColumnsChanged();
    this.broadcastService.on(NamedEventType.PAGE_CONTENT_CHANGED, () => {
      this.logger.info("event received:", NamedEventType.PAGE_CONTENT_CHANGED);
      this.pageColumnsChanged();
    });
  }

  private pageColumnsChanged() {
    this.actualViewableSlideCount = min([this.pageContentColumns().length, this.maxViewableSlideCount]);
  }

  pageContentColumns(): PageContentColumn[] {
    return this.pageContent.rows[this.rowIndex].columns;
  }

  private detectWidth() {
    if (window.innerWidth <= DeviceSize.SMALL) {
      this.maxViewableSlideCount = 1;
    } else if (window.innerWidth <= DeviceSize.LARGE) {
      this.maxViewableSlideCount = 2;
    } else if (window.innerWidth <= DeviceSize.EXTRA_LARGE) {
      this.maxViewableSlideCount = 3;
    } else {
      this.maxViewableSlideCount = 4;
    }
    this.logger.info("detectWidth:", window.innerWidth, "maxViewableSlideCount", this.maxViewableSlideCount);
  }

  slideClasses() {
    return slideClasses(this.actualViewableSlideCount, this.marginBottom);
  }

  viewableColumns(): PageContentColumn[] {
    const viewableSlides = this.pageContentColumns().slice(this.slideIndex, this.slideIndex + this.maxViewableSlideCount);
    this.logger.debug("viewableSlides:slideIndex", this.slideIndex, "this.slides", this.pageContentColumns(), "viewableSlideCount:", this.maxViewableSlideCount, "viewableSlides:", viewableSlides);
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

  exitImageEdit() {
    this.activeEditColumnIndex = null;
    this.awsFileData = null;
  }

  editImage(columnIndex) {
    this.activeEditColumnIndex = columnIndex;
  }

  imageSourceOrPreview(column, columnIndex): string {
    if (this.activeEditColumnIndex === columnIndex) {
      return this.awsFileData?.image || column?.imageSource;
    } else {
      return column?.imageSource;
    }
  }

  imagedSaved(event: AwsFileData) {
    const imageSource = this.urlService.resourceRelativePathForAWSFileName(event.awsFileName);
    this.logger.info("imagedSaved:", event, "setting imageSource for columnIndex", this.activeEditColumnIndex, "to", imageSource);
    this.row.columns[this.activeEditColumnIndex].imageSource = imageSource;
  }

  imageChanged(awsFileData: AwsFileData) {
    this.logger.info("imageChanged:", awsFileData);
    this.awsFileData = awsFileData;
  }
}
