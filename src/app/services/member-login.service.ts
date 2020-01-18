import { HttpErrorResponse } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import isEmpty from "lodash-es/isEmpty";
import { CookieService } from "ngx-cookie-service";
import { NgxLoggerLevel } from "ngx-logger";
import { Subject } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { AuthResponse } from "../models/auth-data.model";
import { LoginResponse, Member, MemberCookie } from "../models/member.model";
import { FullNamePipe } from "../pipes/full-name.pipe";
import { BroadcastService, NamedEventType } from "./broadcast-service";
import { CookieParserService } from "./cookie-parser.service";
import { DateUtilsService } from "./date-utils.service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { NumberUtilsService } from "./number-utils.service";
import { UrlService } from "./url.service";

@Injectable({
  providedIn: "root"
})

export class MemberLoginService {
  private logger: Logger;
  private loginResponseListener = new Subject<LoginResponse>();

  constructor(
    @Inject("MemberService") private memberService,
    @Inject("MemberAuditService") private memberAuditService,
    private fullNamePipe: FullNamePipe,
    private broadcastService: BroadcastService,
    private authService: AuthService,
    private numberUtils: NumberUtilsService,
    private urlService: UrlService,
    private dateUtils: DateUtilsService, private loggerFactory: LoggerFactory, private cookieParserService: CookieParserService, private cookieService: CookieService) {
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

  logout() {
    const member = this.loggedInMember();
    if (!isEmpty(member)) {
      this.authService.logout().subscribe((authResponse: AuthResponse) => {
        this.cookieParserService.removeCookie("editSite");
        this.loginResponseListener.next(authResponse.loginResponse);
      });
    }
  }

  login(userName, password) {
    this.authService.login({userName, password}).subscribe((authResponse: AuthResponse) => {
      this.logger.info("authService.login:authResponse", authResponse);
      this.loginResponseListener.next(authResponse.loginResponse);
    }, (error: HttpErrorResponse) => {
      this.logger.error("login error:", error);
      const loginResponse: LoginResponse = error.error.loginResponse;
      this.loginResponseListener.next(loginResponse);
    });
  }

  loginResponseObservable() {
    return this.loginResponseListener.asObservable();
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

  private toMemberCookie(member: Member): MemberCookie {
    return {
      memberId: member.$id(),
      walkAdmin: member.walkAdmin,
      socialAdmin: member.socialAdmin,
      socialMember: member.socialMember,
      contentAdmin: member.contentAdmin,
      memberAdmin: member.memberAdmin,
      financeAdmin: member.financeAdmin,
      committee: member.committee,
      treasuryAdmin: member.treasuryAdmin,
      fileAdmin: member.fileAdmin,
      firstName: member.firstName,
      lastName: member.lastName,
      postcode: member.postcode,
      userName: member.userName,
      profileSettingsConfirmed: member.profileSettingsConfirmed
    };
  }

  saveMember(memberToSave: Member, saveCallback?, errorSaveCallback?) {
    return memberToSave.$saveOrUpdate(saveCallback, saveCallback, errorSaveCallback, errorSaveCallback)
      .then((savedMember) => {
        return this.refreshLoggedInMemberToken(this.toMemberCookie(savedMember));
      })
      .then(() => {
        this.broadcastService.broadcast("memberSaveComplete");
      });
  }

  resetPassword(userName, newPassword, newPasswordConfirm) {
    return this.getMemberForUserName(userName)
      .then((member) => this.validateAndSaveNewPassword(member, newPassword, newPasswordConfirm))
      .then((loginResponse) => this.broadcastMemberLoginComplete(loginResponse))
      .then((loginResponse) => this.auditPasswordChange(loginResponse));
  }

  validateAndSaveNewPassword(member: Member, newPassword, newPasswordConfirm): Promise<LoginResponse> {
    const loginResponse: LoginResponse = {memberLoggedIn: false, showResetPassword: true};
    if (member.password === newPassword) {
      loginResponse.alertMessage = `The new password was the same as the old one for ${member.userName}. Please try again or`;
    } else if (!newPassword || newPassword.length < 6) {
      loginResponse.alertMessage = "The new password needs to be at least 6 characters long. Please try again or";
    } else if (newPassword !== newPasswordConfirm) {
      loginResponse.alertMessage = `The new password was not confirmed correctly for ${member.userName}. Please try again or`;
    } else {
      loginResponse.showResetPassword = false;
      this.logger.debug(`Saving new password for ${member.userName} and removing expired status`);
      delete member.expiredPassword;
      delete member.passwordResetId;
      member.password = newPassword;
      this.logger.debug("saveNewPassword.loginResponse:", loginResponse);
      return member.$update().then((updatedMember) => {
        const memberCookie = this.toMemberCookie(updatedMember);
        this.refreshLoggedInMemberToken(memberCookie);
        loginResponse.alertMessage = `The password for ${member.userName} was changed successfully`;
        loginResponse.memberLoggedIn = true;
        return loginResponse;
      });
    }
    return Promise.resolve(loginResponse);
  }

  auditPasswordChange(loginResponse: LoginResponse) {
    this.logger.info("auditPasswordChange:loginResponse", loginResponse);
    this.authService.auditMemberLogin(loginResponse.userName, loginResponse);
    return loginResponse;
  }

  broadcastMemberLoginComplete(resetPasswordData) {
    this.loginResponseListener.next(resetPasswordData);
    return resetPasswordData;
  }

  getMemberForUserName(userName: string): Promise<Member> {
    return this.memberService.query({userName: userName.toLowerCase()}, {limit: 1})
      .then((queryResults) => {
        return (queryResults && queryResults.length > 0) ? queryResults[0] : {};
      });
  }

  getMemberForId(memberId: string): Promise<Member> {
    return this.memberService.getById(memberId);
  }

  getMemberForResetPassword(credentialOne, credentialTwo) {
    const credentialOneCleaned = credentialOne.toLowerCase().trim();
    const credentialTwoCleaned = credentialTwo.toUpperCase().trim();
    const orOne = {$or: [{userName: {$eq: credentialOneCleaned}}, {email: {$eq: credentialOneCleaned}}]};
    const orTwo = {$or: [{membershipNumber: {$eq: credentialTwoCleaned}}, {postcode: {$eq: credentialTwoCleaned}}]};
    const criteria = {$and: [orOne, orTwo]};
    this.logger.info("querying member using", criteria);
    return this.memberService.query(criteria, {limit: 1})
      .then((queryResults) => {
        this.logger.info("queryResults:", queryResults);
        return (queryResults && queryResults.length > 0) ? queryResults[0] : {};
      });
  }

  getMemberForMemberId(memberId) {
    return this.memberService.getById(memberId);
  }

  getMemberByPasswordResetId(passwordResetId) {
    return this.memberService.query({passwordResetId}, {limit: 1})
      .then((queryResults) => {
        return (queryResults && queryResults.length > 0) ? queryResults[0] : {};
      });
  }

  setPasswordResetId(member) {
    member.passwordResetId = this.numberUtils.generateUid();
    this.logger.debug("member.userName", member.userName, "member.passwordResetId", member.passwordResetId);
    return member;
  }

}
