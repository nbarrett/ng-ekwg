import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { faMinusCircle, faPlusCircle, faSave, faUndo } from "@fortawesome/free-solid-svg-icons";
import flatten from "lodash-es/flatten";
import last from "lodash-es/last";
import sum from "lodash-es/sum";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertTarget } from "../../../models/alert-target.model";
import { ContentText, defaultRow, PageContent, PageContentRow } from "../../../models/content-text.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { PageContentService } from "../../../services/page-content.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { WalksService } from "../../../services/walks/walks.service";
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
  public pathSegments: string[] = [];
  public area: string;

  constructor(
    public siteEditService: SiteEditService,
    private route: ActivatedRoute,
    private notifierService: NotifierService,
    private urlService: UrlService,
    private stringUtils: StringUtilsService,
    private pageContentService: PageContentService,
    private walksService: WalksService,
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
          this.logger.debug("Found page content for", this.contentPath, "as:", pageContent);
          this.pageContent = pageContent;
          if (!pageContent) {
            this.notify.success({
              title: `Page content doesn't exist`,
              message: `for ${this.relativePath}`
            });
          }
        });
    });
  }

  createContent() {
    this.pageContent = {
      path: this.contentPath,
      rows: [defaultRow]
    };
    this.logger.info("this.pageContent:", this.pageContent);
  }

  rowColFor(rowIndex: number, columnIndex: number) {
    return `row-${rowIndex + 1}-column-${columnIndex + 1}`;
  }

  identifierFor(rowIndex: number, columnIndex: number, identifier: string) {
    return `${identifier}-${this.rowColFor(rowIndex, columnIndex)}`;
  }

  descriptionFor(rowIndex, columnIndex, identifier: string) {
    return (this.stringUtils.replaceAll("-", " ", this.identifierFor(rowIndex, columnIndex, identifier)) as string).trim();
  }

  descriptionForContent() {
    return this.stringUtils.replaceAll("-", " ", this.relativePath);
  }

  saveContentTextId(contentText: ContentText, rowIndex: number, columnIndex: number) {
    if (this.pageContent.rows[rowIndex].columns[columnIndex].contentTextId !== contentText?.id) {
      this.pageContent.rows[rowIndex].columns[columnIndex].contentTextId = contentText?.id;
      if (!this.unsavedMarkdownElements()) {
        this.savePageContent();
      }
    }
  }

  public unsavedMarkdownElements(): boolean {
    const columnsWithNewlyCreatedMarkdown = flatten(this.pageContent.rows.map(item => item.columns.map(col => col.contentTextId)))
      .filter(item => item === null);
    this.logger.debug("unsavedMarkdownElements:", columnsWithNewlyCreatedMarkdown);
    return columnsWithNewlyCreatedMarkdown.length > 0;
  }

  public savePageContent() {
    this.pageContentService.createOrUpdate(this.pageContent)
      .then(response => this.pageContent = response);
  }

  public revertPageContent() {
    this.pageContentService.findByPath(this.pageContent.path)
      .then(response => this.pageContent = response);
  }

  addRow() {
    this.pageContent.rows.push(defaultRow);
    this.logger.info("this.pageContent:", this.pageContent);
  }

  addColumn(row: PageContentRow, columnIndex: number) {
    const existingColumns = sum(row.columns.map(item => item.columns));
    const columns = 12 - existingColumns;
    const newColumn = {columns: columns === 0 ? 6 : columns, contentTextId: null};
    row.columns.splice(columnIndex, 0, newColumn);
    this.logger.info("this.pageContent:", this.pageContent);
  }

  deleteColumn(row: PageContentRow, columnIndex: number) {
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
