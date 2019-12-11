import { Inject, Injectable } from "@angular/core";
import isEmpty from "lodash-es/isEmpty";
import { CookieService } from "ngx-cookie-service";
import { NgxLoggerLevel } from "ngx-logger";
import { Error } from "tslint/lib/error";
import { LoginResponse, Member, MemberCookie } from "../models/member.model";
import { BroadcastService } from "./broadcast-service";
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

  constructor(
    @Inject("MemberService") private memberService,
    @Inject("MemberAuditService") private memberAuditService,
    private broadcastService: BroadcastService,
    private numberUtils: NumberUtilsService,
    private urlService: UrlService,
    private dateUtils: DateUtilsService, private loggerFactory: LoggerFactory, private cookieParserService: CookieParserService, private cookieService: CookieService) {
    this.logger = loggerFactory.createLogger(MemberLoginService, NgxLoggerLevel.OFF);
  }

  loggedInMember(): MemberCookie {
    return this.cookieParserService.cookieValueFor("loggedInMember");
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

  allowWalkAdminEdits() {
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
      const loginResponseValue: LoginResponse = {member};
      loginResponseValue.alertMessage = `The member ${member.userName} logged out successfully`;
      this.auditMemberLogin(member.userName, member, loginResponseValue);
    }
    this.removeCookie("loggedInMember");
    this.broadcastService.broadcast("memberLogoutComplete");
  }

  auditMemberLogin(userName, member: MemberCookie, loginResponse) {
    const audit = new this.memberAuditService({
      userName,
      loginTime: this.dateUtils.nowAsValue(),
      loginResponse
    });
    if (isEmpty(member)) {
      audit.member = member;
    }
    return audit.$save();
  }

  setCookie(key, value) {
    this.logger.info("setting cookie", key, "with value", value);
    if (value) {
      this.cookieService.set(key, JSON.stringify(value));
    } else {
      this.removeCookie(key);
    }
  }

  removeCookie(key) {
    this.logger.info(`removing cookie ${key}`);
    this.cookieService.delete(key);
  }

  login(userName, password) {
    this.removeCookie("loggedInMember");
    return this.getMemberForUserName(userName)
      .then((member: Member): LoginResponse => {
        this.logger.info("member", member);
        this.removeCookie("showResetPassword");
        const memberCookie = this.toMemberCookie(member);
        const loginResponse: LoginResponse = {member: memberCookie};
        if (isEmpty(member)) {
          loginResponse.alertMessage = `The member ${userName} was not recognised. Please try again or`;
          loginResponse.memberLoggedIn = false;
        } else {
          if (!member.groupMember) {
            loginResponse.alertMessage = `Logins for member ${userName} have been disabled. Please`;
          } else if (member.password !== password) {
            loginResponse.alertMessage = `The password was incorrectly entered for ${userName}. Please try again or`;
          } else if (member.expiredPassword) {
            loginResponse.showResetPassword = true;
            loginResponse.alertMessage = `The password for ${userName} has expired. You must enter a new password before continuing. Alternatively`;
          } else {
            loginResponse.memberLoggedIn = true;
            loginResponse.alertMessage = `The member ${userName} logged in successfully`;
            this.setLoggedInMemberCookie(memberCookie);
            this.broadcastService.broadcast("memberLoginComplete");
          }
        }
        this.auditMemberLogin(userName, memberCookie, loginResponse.loginResponse);
        return loginResponse;
      }).catch((response) => {
        throw new Error(`Login failed:${response}`);
      });
  }

  setLoggedInMemberCookie(member: MemberCookie) {
    this.setCookie("loggedInMember", member);
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

  saveMember(memberToSave, saveCallback?, errorSaveCallback?) {
    memberToSave.$saveOrUpdate(saveCallback, saveCallback, errorSaveCallback, errorSaveCallback)
      .then(() => {
        this.setLoggedInMemberCookie(memberToSave);
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
        this.setLoggedInMemberCookie(memberCookie);
        loginResponse.alertMessage = `The password for ${member.userName} was changed successfully`;
        loginResponse.memberLoggedIn = true;
        loginResponse.member = memberCookie;
        return loginResponse;
      });
    }
    return Promise.resolve(loginResponse);
  }

  auditPasswordChange(loginResponse: LoginResponse) {
    this.logger.info("auditPasswordChange:loginResponse", loginResponse);
    this.auditMemberLogin(loginResponse.userName, loginResponse.member, loginResponse.loginResponse);
    return loginResponse;
  }

  broadcastMemberLoginComplete(resetPasswordData) {
    this.broadcastService.broadcast("memberLoginComplete");
    return resetPasswordData;
  }

  getMemberForUserName(userName): Promise<Member> {
    return this.memberService.query({userName: userName.toLowerCase()}, {limit: 1})
      .then((queryResults) => {
        return (queryResults && queryResults.length > 0) ? queryResults[0] : {};
      });
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
