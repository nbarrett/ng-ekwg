import { Injectable } from "@angular/core";
import flatten from "lodash-es/flatten";
import { NgxLoggerLevel } from "ngx-logger";
import { NamedEvent, NamedEventType } from "../models/broadcast.model";
import { ContentText, PageContent } from "../models/content-text.model";
import { BroadcastService } from "./broadcast-service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { StringUtilsService } from "./string-utils.service";

@Injectable({
  providedIn: "root"
})
export class ContentTextNamingService {
  private logger: Logger;

  constructor(private stringUtils: StringUtilsService,
              private broadcastService: BroadcastService<PageContent>,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ContentTextNamingService, NgxLoggerLevel.OFF);
  }

  saveContentTextId(contentText: ContentText, rowIndex: number, columnIndex: number, pageContent: PageContent) {
    if (pageContent.rows[rowIndex].columns[columnIndex].contentTextId !== contentText?.id) {
      pageContent.rows[rowIndex].columns[columnIndex].contentTextId = contentText?.id;
      if (!this.unsavedMarkdownElements(pageContent)) {
        this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.SAVE_PAGE_CONTENT, pageContent));
      }
    }
  }

  public unsavedMarkdownElements(pageContent: PageContent): boolean {
    const columnsWithNewlyCreatedMarkdown = flatten(pageContent.rows.map(item => item.columns.map(col => col.contentTextId)))
      .filter(item => item === null);
    this.logger.debug("unsavedMarkdownElements:", columnsWithNewlyCreatedMarkdown);
    return columnsWithNewlyCreatedMarkdown.length > 0;
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

  descriptionForContent(relativePath: string) {
    return this.stringUtils.replaceAll("-", " ", relativePath);
  }

}
