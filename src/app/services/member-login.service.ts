import { Inject, Injectable } from "@angular/core";
import isEmpty from "lodash-es/isEmpty";
import { NgxLoggerLevel } from "ngx-logger";
import { AuthService } from "../auth/auth.service";
import { Member, MemberCookie } from "../models/member.model";
import { FullNamePipe } from "../pipes/full-name.pipe";
import { BroadcastService } from "./broadcast-service";
import { CookieParserService } from "./cookie-parser.service";
import { DateUtilsService } from "./date-utils.service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { MemberService } from "./member.service";
import { NumberUtilsService } from "./number-utils.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root"
})

export class MemberLoginService {
  private logger: Logger;

  constructor(
    @Inject("MemberAuditService") private memberAuditService,
    private memberService: MemberService,
    private fullNamePipe: FullNamePipe,
    private broadcastService: BroadcastService,
    private authService: AuthService,
    private numberUtils: NumberUtilsService,
    private urlService: UrlService,
    private dateUtils: DateUtilsService,
    private loggerFactory: LoggerFactory,
    private cookieParserService: CookieParserService) {
    this.logger = loggerFactory.createLogger(MemberLoginService, NgxLoggerLevel.INFO);
  }

  loggedInMember(): MemberCookie {
    const loggedInMember = this.authService.parseAuthPayload() as MemberCookie;
    this.logger.debug("loggedInMember", loggedInMember);
    return loggedInMember;
  }

  allowContentEdits() {
    return this.loggedInMember().contentAdmin;
  }

  allowMemberAdminEdits() {
    return this.loggedInMember().memberAdmin;
  }

  allowFinanceAdmin() {
    return this.loggedInMember().financeAdmin;
  }

  allowCommittee() {
    return this.loggedInMember().committee;
  }

  allowTreasuryAdmin() {
    return this.loggedInMember().treasuryAdmin;
  }

  allowFileAdmin() {
    return this.loggedInMember().fileAdmin;
  }

  memberLoggedIn() {
    return !isEmpty(this.loggedInMember());
  }

  showLoginPromptWithRouteParameter(routeParameter) {
    if (this.urlService.hasRouteParameter(routeParameter) && !this.memberLoggedIn()) {
      this.urlService.navigateTo("login");
    }
  }

  allowWalkAdminEdits(): boolean {
    return this.loggedInMember().walkAdmin;
  }

  allowSocialAdminEdits() {
    return this.loggedInMember().socialAdmin;
  }

  allowSocialDetailView() {
    return this.loggedInMember().socialMember;
  }

  refreshLoggedInMemberToken(member: MemberCookie): Promise<void> {
    const existingCookie = this.cookieParserService.cookieValueFor("loggedInMember");
    const notCurrentMember = existingCookie.memberId !== member.memberId;
    if (!isEmpty(existingCookie) && notCurrentMember) {
      return Promise.reject(`Invalid attempt to set logged-on member from ${this.fullNamePipe.transform(existingCookie)} to ${this.fullNamePipe.transform(member)}`);
    } else {
      // TODO: need to refresh token in server
      return Promise.resolve();
    }
  }

  saveMember(memberToSave: Member, saveCallback?, errorSaveCallback?) {
    Promise.reject("saveMember needs to be implemented on server");
    this.broadcastService.broadcast("memberSaveComplete");
  }

}
