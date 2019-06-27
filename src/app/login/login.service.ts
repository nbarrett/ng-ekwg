import { Inject, Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { CookieService } from "ngx-cookie-service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class LoginService {
  private logger: Logger;

  constructor(@Inject("DateUtils") private DateUtils, private loggerFactory: LoggerFactory, private cookieService: CookieService) {
    this.logger = loggerFactory.createLogger(LoginService, NgxLoggerLevel.INFO);
    this.logger.info("constructed at", DateUtils.currentMemberBulkLoadDisplayDate());
  }

  memberLoggedIn() {
    const loginResponse = this.cookieValueFor("loginResponse");
    this.logger.debug("loginResponse", loginResponse, "memberLoggedIn", loginResponse.memberLoggedIn);
    return loginResponse.memberLoggedIn;
  }

  loggedInMember() {
    return this.cookieValueFor("loggedInMember");
  }

  private cookieValueFor(key: string) {
    const response = this.cookieService.get(key);
    const member = response ? JSON.parse(response) : {};
    this.logger.debug(`cookie value: ${key}`, member);
    return member;
  }
}
