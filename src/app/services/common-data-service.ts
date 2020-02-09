import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { each } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class CommonDataService {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommonDataService, NgxLoggerLevel.OFF);
  }

  public toHttpParams(criteria: object): HttpParams {
    let params = new HttpParams();
    each(criteria, (value, field) => {
      const paramValue = typeof value === "object" ? JSON.stringify(value) : value;
      params = params.set(field, paramValue);
      this.logger.debug("query setting params field:", field, "value:", paramValue);
    });
    return params;
  }
}
