import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpErrorParserService {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpErrorParserService, NgxLoggerLevel.DEBUG);
  }

  extractError(responseData) {
    let error;
    if (responseData && (responseData.error || responseData.errno)) {
      error = {error: responseData};
    } else if (responseData && responseData.errors && responseData.errors.length > 0) {
      error = {
        error: responseData.errors.map(error => error.error + (error.email ? ": " + error.email : "")).join(", ")
      };
    } else {
      error = {error: undefined};
    }
    this.logger.debug("responseData:", responseData, "error:", error);
    return error;
  }

}
