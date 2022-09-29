import { Injectable } from "@angular/core";
import flatten from "lodash-es/flatten";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEventType } from "../models/broadcast.model";
import { ContentText, PageContent, PageContentColumn, PageContentRow, PageContentType } from "../models/content-text.model";
import { BroadcastService } from "./broadcast-service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { NumberUtilsService } from "./number-utils.service";
import { StringUtilsService } from "./string-utils.service";

@Injectable({
  providedIn: "root"
})
export class PageContentActionsService {
  private logger: Logger;

  constructor(private stringUtils: StringUtilsService,
              private broadcastService: BroadcastService<PageContent>,
              private numberUtils: NumberUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(PageContentActionsService, NgxLoggerLevel.INFO);
  }

  saveContentTextId(contentText: ContentText, rowIndex: number, columnIndex: number, pageContent: PageContent) {
    if (pageContent.rows[rowIndex].columns[columnIndex].contentTextId !== contentText?.id) {
      pageContent.rows[rowIndex].columns[columnIndex].contentTextId = contentText?.id;
      if (!this.unsavedMarkdownElements(pageContent)) {
        // this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.SAVE_PAGE_CONTENT, pageContent));
      }
    }
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

  addRow(rowIndex, pageContentType: PageContentType | string, pageContent: PageContent) {
    pageContent.rows.splice(rowIndex, 0, this.defaultRowFor(pageContentType));
    this.logger.info("pageContent:", pageContent);
  }

  deleteRow(rowIndex, pageContent: PageContent) {
    pageContent.rows = pageContent.rows.filter((item, index) => index !== rowIndex);
    this.logger.info("pageContent:", pageContent);
  }

  addColumn(row: PageContentRow, columnIndex: number, pageContent: PageContent) {
    const columnData: PageContentColumn = row.type === PageContentType.TEXT ?
      {columns: this.calculateColumnsFor(row, 1)} :
      {href: null, imageSource: null, title: null};
    row.columns.splice(columnIndex, 0, columnData);
    this.logger.info("pageContent:", pageContent);
    this.notifyPageContentChanges();
  }

  deleteColumn(row: PageContentRow, columnIndex: number, pageContent: PageContent) {
    this.calculateColumnsFor(row, -1);
    row.columns = row.columns.filter((item, index) => index !== columnIndex);
    this.logger.info("pageContent:", pageContent);
    this.notifyPageContentChanges();
  }

  private calculateColumnsFor(row: PageContentRow, columnIncrement: number) {
    const newColumnCount = row.columns.length + columnIncrement;
    const columns = this.numberUtils.asNumber(12 / newColumnCount, 0);
    row.columns.forEach(column => column.columns = columns);
    return columns;
  }


  changeColumnWidthFor($event: HTMLInputElement, column: PageContentColumn) {
    const inputValue = +$event.value;
    const columnWidth: number = inputValue > 12 ? 12 : inputValue < 1 ? 1 : +$event.value;
    $event.value = columnWidth.toString();
    column.columns = columnWidth;
    this.logger.info("changeColumnsFor:", column, columnWidth,);
  }

  public unsavedMarkdownElements(pageContent: PageContent): boolean {
    const columnsWithNewlyCreatedMarkdown = flatten(pageContent.rows.map(item => item.columns.map(col => col.contentTextId)))
      .filter(item => item === null);
    this.logger.debug("unsavedMarkdownElements:", columnsWithNewlyCreatedMarkdown);
    return columnsWithNewlyCreatedMarkdown.length > 0;
  }

  rowColFor(rowIndex: number, columnIndex: number): string {
    const rowPrefix = rowIndex ? `row-${rowIndex + 1}-` : "";
    return `${rowPrefix}column-${columnIndex + 1}`;
  }

  rowColumnIdentifierFor(rowIndex: number, columnIndex: number, identifier: string): string {
    return `${identifier}-${this.rowColFor(rowIndex, columnIndex)}`;
  }

  columnIdentifierFor(columnIndex: number, identifier: string): string {
    return `${identifier}-${this.rowColFor(null, columnIndex)}`;
  }

  descriptionFor(rowIndex, columnIndex, identifier: string): string {
    return (this.stringUtils.replaceAll("-", " ", this.rowColumnIdentifierFor(rowIndex, columnIndex, identifier)) as string).trim();
  }

  descriptionForContent(relativePath: string): string | number {
    return this.stringUtils.replaceAll("-", " ", relativePath);
  }

  private notifyPageContentChanges() {
    this.broadcastService.broadcast(NamedEventType.PAGE_CONTENT_CHANGED);
  }
}
