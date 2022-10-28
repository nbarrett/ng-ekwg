import { Component, HostListener, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { isEqual, max, min } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEventType } from "../../../models/broadcast.model";
import { PageContent, PageContentColumn, PageContentEditEvent, PageContentRow } from "../../../models/content-text.model";
import { DeviceSize } from "../../../models/page.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { CARD_MARGIN_BOTTOM, cardClasses } from "../../../services/card-utils";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { PageContentActionsService } from "../../../services/page-content-actions.service";
import { PageService } from "../../../services/page.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";

@Component({
  selector: "app-action-buttons",
  templateUrl: "./action-buttons.html",
  styleUrls: ["./action-buttons.sass"]
})
export class ActionButtonsComponent implements OnInit {
  @Input()
  public pageContent: PageContent;
  @Input()
  public rowIndex: number;
  @Input()
  public editNameEnabled: boolean;

  private logger: Logger;
  public contentPath: string;
  public slideIndex = 0;
  public maxViewableSlideCount: number;
  public actualViewableSlideCount: number;
  public relativePath: string;
  public row: PageContentRow;
  public activeEditColumnIndex: number;
  public faPencil = faPencil;
  private pageContentEditEvents: PageContentEditEvent[] = [];
  constructor(
    public siteEditService: SiteEditService,
    private urlService: UrlService,
    private pageService: PageService,
    private stringUtils: StringUtilsService,
    private route: ActivatedRoute,
    public actions: PageContentActionsService,
    private broadcastService: BroadcastService<PageContent>,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ActionButtonsComponent, NgxLoggerLevel.INFO);
  }

  @HostListener("window:resize", ["event"])
  onResize() {
    this.determineViewableSlideCount();
  }

  ngOnInit() {
    this.row = this.pageContent.rows[this.rowIndex];
    this.logger.debug("ngOnInit:editNameEnabled", this.editNameEnabled);
    this.contentPath = this.pageContent.path;
    this.logger.debug("initialised with contentPath:", this.contentPath);
    this.determineViewableSlideCount();
    this.pageColumnsChanged();
    this.broadcastService.on(NamedEventType.PAGE_CONTENT_CHANGED, () => {
      this.logger.debug("event received:", NamedEventType.PAGE_CONTENT_CHANGED);
      this.pageColumnsChanged();
    });
  }

 private pageColumnsChanged() {
    this.actualViewableSlideCount = min([this.pageContentColumns().length, this.maxViewableSlideCount]);
  }

  pageContentColumns(): PageContentColumn[] {
    return this.pageContent.rows[this.rowIndex].columns;
  }

  private determineViewableSlideCount() {
    if (window.innerWidth <= DeviceSize.SMALL) {
      this.maxViewableSlideCount = 1;
    } else if (window.innerWidth <= DeviceSize.LARGE) {
      this.maxViewableSlideCount = 2;
    } else if (window.innerWidth <= DeviceSize.EXTRA_LARGE) {
      this.maxViewableSlideCount = 3;
    } else {
      this.maxViewableSlideCount = 4;
    }
    this.logger.debug("determineViewableSlideCount:", window.innerWidth, "maxViewableSlideCount", this.maxViewableSlideCount);
  }

  slideClasses(column: PageContentColumn) {
    return this.columnInEditMode(column) ? "col-md-6" : cardClasses(this.row.maxColumns || this.actualViewableSlideCount, CARD_MARGIN_BOTTOM);
  }

  private columnInEditMode(column: PageContentColumn) {
    const columnIndex = this.row.columns.indexOf(column);
    return this.pageContentEditEvents.find(item => isEqual(item,
      {columnIndex, rowIndex: this.rowIndex, path: this.pageContent.path, editActive: true}));
  }

  viewableColumns(): PageContentColumn[] {
    if (this.row.showSwiper) {
      const endIndex = this.slideIndex + this.maxViewableSlideCount;
      const viewableSlides: PageContentColumn[] = this.pageContentColumns().slice(this.slideIndex, endIndex);
      this.logger.debug("viewableSlides:slideIndex", this.slideIndex, "end index:", endIndex, "all slides:", this.pageContentColumns(), "viewableSlideCount:", this.maxViewableSlideCount, "viewableSlides:", viewableSlides);
      return viewableSlides;
    } else {
      return this.pageContentColumns();
    }
  }

  back() {
    this.slideIndex = max([0, this.slideIndex - 1]);
    this.logger.debug("back:slideIndex", this.slideIndex);
  }

  forward() {
    const columnCount = this.pageContentColumns().length;
    if (this.forwardPossible()) {
      this.slideIndex = min([this.slideIndex + 1, columnCount - 1]);
      this.logger.debug("forward:slideIndex", this.slideIndex);
    } else {
      this.logger.debug("forward:cant go further - slideIndex", this.slideIndex);
    }
  }

  private forwardPossible() {
    return this.maxViewableSlideCount + this.slideIndex < this.pageContentColumns().length;
  }

  backDisabled(): boolean {
    const disabled = this.slideIndex === 0;
    this.logger.debug("backDisabled:", disabled);
    return disabled;
  }

  forwardDisabled(): boolean {
    const disabled = !this.forwardPossible();
    this.logger.debug("forwardDisabled:", disabled);
    return disabled;
  }

  listenForEvents(pageContentEditEvent: PageContentEditEvent) {
    if (pageContentEditEvent.editActive) {
      this.pageContentEditEvents.push(pageContentEditEvent);
      this.logger.info("received pageContentEditEvent:", pageContentEditEvent, "added to:", this.pageContentEditEvents);
    } else {
      this.pageContentEditEvents = this.pageContentEditEvents
        .filter(item => !isEqual(pageContentEditEvent, item));
      this.logger.info("received pageContentEditEvent:", pageContentEditEvent, "removed from:", this.pageContentEditEvents);
    }

  }
}
