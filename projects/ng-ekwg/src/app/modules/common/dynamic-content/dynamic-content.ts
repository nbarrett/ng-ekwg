import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { faMinusCircle, faPlusCircle, faSave, faUndo } from "@fortawesome/free-solid-svg-icons";
import { faTableCells } from "@fortawesome/free-solid-svg-icons/faTableCells";
import last from "lodash-es/last";
import { BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { NamedEvent, NamedEventType } from "../../../models/broadcast.model";
import { PageContent, PageContentColumn, PageContentRow, PageContentType } from "../../../models/content-text.model";
import { BroadcastService } from "../../../services/broadcast-service";
import { ContentTextNamingService } from "../../../services/content-text-naming.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { NumberUtilsService } from "../../../services/number-utils.service";
import { PageContentService } from "../../../services/page-content.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { SiteEditService } from "../../../site-edit/site-edit.service";

@Component({
  selector: "app-dynamic-content",
  templateUrl: "./dynamic-content.html",
  styleUrls: ["./dynamic-content.sass"],
})
export class DynamicContentComponent implements OnInit {
  private logger: Logger;
  public relativePath: string;
  public contentPath: string;
  public pageContent: PageContent;
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  public pageTitle: string;
  faPlusCircle = faPlusCircle;
  faMinusCircle = faMinusCircle;
  faSave = faSave;
  faUndo = faUndo;
  faTableCells = faTableCells;
  public pathSegments: string[] = [];
  public area: string;
  providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }];

  constructor(
    public siteEditService: SiteEditService,
    private route: ActivatedRoute,
    private notifierService: NotifierService,
    private urlService: UrlService,
    private numberUtils: NumberUtilsService,
    private stringUtils: StringUtilsService,
    private pageContentService: PageContentService,
    public namingService: ContentTextNamingService,
    private broadcastService: BroadcastService<PageContent>,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(DynamicContentComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.area = this.urlService.area();
      this.relativePath = paramMap.get("relativePath");
      this.contentPath = `${this.area}/${this.relativePath}`;
      this.pathSegments = this.urlService.toPathSegments(this.relativePath);
      this.logger.debug("initialised with path:", this.relativePath, "pathSegments:", this.pathSegments);
      this.pageTitle = this.stringUtils.asTitle(last(this.pathSegments));
      this.logger.debug("Finding page content for " + this.relativePath);
      this.pageContentService.findByPath(this.contentPath)
        .then(pageContent => {
          this.logger.info("Found page content for", this.contentPath, "as:", pageContent);
          this.pageContent = pageContent;
          if (!pageContent) {
            this.notify.success({
              title: `Page content doesn't exist`,
              message: `for ${this.pageTitle} page`
            });
          }
        });
      this.broadcastService.on(NamedEventType.SAVE_PAGE_CONTENT, (namedEvent: NamedEvent<PageContent>) => {
        this.logger.info("event received:", namedEvent);
        if (namedEvent.data.id === this.pageContent.id) {
          this.savePageContent();
        }
      });
    });
  }

  defaultRowFor(type: PageContentType | string): PageContentRow {
    return {
      type: type as PageContentType,
      columns: [this.columnFor(type)]
    };
  };

  private columnFor(type: PageContentType | string): PageContentColumn {
    return type === PageContentType.TEXT ? {columns: 12} : {};
  }

  createContent() {
    this.pageContent = {
      path: this.contentPath,
      rows: [this.defaultRowFor(PageContentType.TEXT)]
    };
    this.logger.info("this.pageContent:", this.pageContent);
  }

  public savePageContent() {
    this.pageContentService.createOrUpdate(this.pageContent)
      .then(response => this.pageContent = response);
  }

  public revertPageContent() {
    this.pageContentService.findByPath(this.pageContent.path)
      .then(response => this.pageContent = response);
  }

  addRow(rowIndex, pageContentType: PageContentType | string) {
    this.pageContent.rows.splice(rowIndex, 0, this.defaultRowFor(pageContentType));
    this.logger.info("this.pageContent:", this.pageContent);
  }

  deleteRow(rowIndex) {
    this.pageContent.rows = this.pageContent.rows.filter((item, index) => index !== rowIndex);
    this.logger.info("this.pageContent:", this.pageContent);
  }

  addColumn(row: PageContentRow, columnIndex: number) {
    const columns = this.calculateColumnsFor(row, 1);
    row.columns.splice(columnIndex, 0, {columns});
    this.logger.info("this.pageContent:", this.pageContent);
  }

  private calculateColumnsFor(row: PageContentRow, columnIncrement: number) {
    const newColumnCount = row.columns.length + columnIncrement;
    const columns = this.numberUtils.asNumber(12 / newColumnCount, 0);
    row.columns.forEach(column => column.columns = columns);
    return columns;
  }

  deleteColumn(row: PageContentRow, columnIndex: number) {
    this.calculateColumnsFor(row, -1);
    row.columns = row.columns.filter((item, index) => index !== columnIndex);
    this.logger.info("this.pageContent:", this.pageContent);
  }

  changeColumnWidthFor($event: HTMLInputElement, rowIndex: number, columnIndex: number) {
    const inputValue = +$event.value;
    const columnWidth: number = inputValue > 12 ? 12 : inputValue < 1 ? 1 : +$event.value;
    $event.value = columnWidth.toString();
    this.pageContent.rows[rowIndex].columns[columnIndex].columns = columnWidth;
    this.logger.info("changeColumnsFor:", rowIndex, columnIndex, columnWidth, "this.pageContent:", this.pageContent);
  }
}
