import { Pipe, PipeTransform } from "@angular/core";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";

@Pipe({name: "filter"})
export class SearchFilterPipe implements PipeTransform {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SearchFilterPipe, NgxLoggerLevel.INFO);
  }

  transform(items: any[], searchText: string): any[] {
    this.logger.debug("items", items, "searchText", searchText);
    if (!items) {
      return [];
    }

    if (!searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();
    return items.filter(item => {
      this.logger.debug("item", item);
      return JSON.stringify(item).toLowerCase().includes(searchText);
    });
  }
}
