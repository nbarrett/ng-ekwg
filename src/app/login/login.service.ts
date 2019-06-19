import { Inject, Injectable } from "@angular/core";
import { NGXLogger } from "ngx-logger";
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: "root"
})

export class LoginService {
  constructor(@Inject("DateUtils") private DateUtils, private logger: NGXLogger, private cookieService: CookieService) {
    logger.info(LoginService.name, "constructed at", DateUtils.currentMemberBulkLoadDisplayDate());
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
