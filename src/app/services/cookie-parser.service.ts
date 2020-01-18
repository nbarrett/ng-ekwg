import { Injectable } from "@angular/core";
import isObject from "lodash-es/isObject";
import { CookieService } from "ngx-cookie-service";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class CookieParserService {
  private logger: Logger;

  constructor(private cookieService: CookieService, private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CookieParserService, NgxLoggerLevel.OFF);
  }

  public setCookie(key, value) {
    this.logger.info("setting cookie", key, "with value", value);
    if (value) {
      this.cookieService.set(key, JSON.stringify(value));
    } else {
      this.removeCookie(key);
    }
  }

  public removeCookie(key) {
    this.logger.info(`removing cookie ${key}`);
    this.cookieService.delete(key);
  }

  public cookieValueFor(key: string): any {
    const cookieResponse = this.cookieService.get(key);
    this.logger.debug(`cookie: ${key} response: ${cookieResponse} type: ${typeof cookieResponse}`);
    const parsedResponse = cookieResponse ? isObject(cookieResponse) ? cookieResponse : JSON.parse(cookieResponse) : {};
    this.logger.debug(`parsed response: ${key}`, parsedResponse);
    return parsedResponse;
  }
}
