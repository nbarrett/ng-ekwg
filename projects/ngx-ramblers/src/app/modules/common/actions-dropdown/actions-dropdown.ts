import { Component, Input, OnInit } from "@angular/core";
import { faTableCells } from "@fortawesome/free-solid-svg-icons/faTableCells";
import { NgxLoggerLevel } from "ngx-logger";
import { PageContent, PageContentColumn, PageContentRow } from "../../../models/content-text.model";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { PageContentActionsService } from "../../../services/page-content-actions.service";

@Component({
  selector: "app-actions-dropdown",
  templateUrl: "./actions-dropdown.html",
  styleUrls: ["./actions-dropdown.sass"],
})
export class ActionsDropdownComponent implements OnInit {
  @Input()
  public pageContent: PageContent;
  @Input()
  public row: PageContentRow;
  @Input()
  public column: PageContentColumn;
  @Input()
  public columnIndex: number;
  @Input()
  public rowIndex: number;

  private logger: Logger;
  faTableCells = faTableCells;

  constructor(
    public actions: PageContentActionsService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ActionsDropdownComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
  }

  nestedRowsExistFor(column: PageContentColumn): boolean {
    return column && column?.rows?.length > 0;
  }

  rows(): PageContentRow[] {
    return this.column ? this.column.rows : this.pageContent.rows;
  }
}
