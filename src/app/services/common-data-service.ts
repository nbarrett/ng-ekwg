import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { each } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { share } from "rxjs/operators";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class CommonDataService {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommonDataService, {level: NgxLoggerLevel.OFF, serverLogLevel: NgxLoggerLevel.OFF});
  }

  public async responseFrom<T>(logger: Logger, observable: Observable<T>, notifications: Subject<T>): Promise<T> {
    const shared = observable.pipe(share());
    shared.subscribe((apiResponse: T) => {
      this.logger.log(apiResponse);
      notifications.next(apiResponse);
    }, (httpErrorResponse: HttpErrorResponse) => {
      logger.error("http error response", httpErrorResponse);
      notifications.next(httpErrorResponse.error);
    });
    return await shared.toPromise();
  }

  public toHttpParams(criteria: object): HttpParams {
    let params = new HttpParams();
    each(criteria, (value, field) => {
      const paramValue = typeof value === "object" ? JSON.stringify(value) : value;
      params = params.set(field, paramValue);
      this.logger.off("query setting params field:", field, "value:", paramValue);
    });
    return params;
  }
}
