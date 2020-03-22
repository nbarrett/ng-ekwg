import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { BsModalService } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { EnteredMemberCredentials, LoginResponse, Member, ProfileUpdateType } from "../../../models/member.model";
import { SearchFilterPipe } from "../../../pipes/search-filter.pipe";
import { BroadcastService } from "../../../services/broadcast-service";
import { ContentMetadataService } from "../../../services/content-metadata.service";
import { DateUtilsService } from "../../../services/date-utils.service";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MailchimpListUpdaterService } from "../../../services/mailchimp/mailchimp-list-updater.service";
import { MemberLoginService } from "../../../services/member/member-login.service";
import { MemberService } from "../../../services/member/member.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { ProfileConfirmationService } from "../../../services/profile-confirmation.service";
import { RouterHistoryService } from "../../../services/router-history.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";
import { ProfileService } from "./profile.service";

const pleaseTryAgain = " - please try again";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./../admin/admin.component.sass"],
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  public member: Member;
  private subscription: Subscription;

  constructor(private memberService: MemberService,
              private contentMetadata: ContentMetadataService,
              private searchFilterPipe: SearchFilterPipe,
              private modalService: BsModalService,
              private notifierService: NotifierService,
              private dateUtils: DateUtilsService,
              private urlService: UrlService,
              private profileConfirmationService: ProfileConfirmationService,
              private emailSubscriptionService: EmailSubscriptionService,
              private mailchimpListUpdaterService: MailchimpListUpdaterService,
              private stringUtils: StringUtilsService,
              private profileService: ProfileService,
              private authService: AuthService,
              private broadcastService: BroadcastService,
              private routerHistoryService: RouterHistoryService,
              private memberLoginService: MemberLoginService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ChangePasswordComponent, NgxLoggerLevel.OFF);
  }

  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  public enteredMemberCredentials: EnteredMemberCredentials = {};

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.notify.setBusy();
    this.profileService.queryMember(this.notify, ProfileUpdateType.LOGIN_DETAILS).then(member => {
      this.member = member;
      this.enteredMemberCredentials.userName = this.member.userName;
      this.notify.clearBusy();
    });
    this.subscription = this.profileService.subscribeToLogout(this.logger);
  }

  private processResetPasswordResponse(loginResponse: LoginResponse) {
    this.logger.debug("processResetPasswordResponse:", loginResponse);
    this.notify.clearBusy();
    delete this.enteredMemberCredentials.newPassword;
    delete this.enteredMemberCredentials.newPasswordConfirm;
    if (loginResponse.showResetPassword) {
      this.logger.debug("reset password failed", loginResponse);
      this.notify.showContactUs(true);
      this.notify.error({
        continue: true,
        title: "Reset password failed",
        message: loginResponse.alertMessage
      });
    } else {
      this.logger.debug("reset password success", loginResponse);
      this.notify.success({
        title: "Reset password success",
        message: loginResponse.alertMessage
      });
    }
  }

  undoLoginDetails() {
    this.profileService.undoChangesTo(this.notify, ProfileUpdateType.LOGIN_DETAILS, this.member).then(member => {
      this.enteredMemberCredentials.userName = member.userName;
      delete this.enteredMemberCredentials.newPassword;
      delete this.enteredMemberCredentials.newPasswordConfirm;
    });
  }

  validateUserNameExistence(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.enteredMemberCredentials.userName !== this.member.userName) {
        this.memberService.getMemberForUserName(this.enteredMemberCredentials.userName)
          .then(member => {
            const reason = `The user name ${this.enteredMemberCredentials.userName} is already used by another member${pleaseTryAgain}`;
            this.enteredMemberCredentials.userName = this.member.userName;
            reject(reason);
          })
          .catch(error => {
            if (error instanceof HttpErrorResponse && error.status === 404) {
              resolve(this.logger.debug("validateUserNameExistence:", this.enteredMemberCredentials.userName, "available"));
            }
          });
      } else {
        resolve(this.logger.debug("validateUserNameExistence:", this.enteredMemberCredentials.userName, "no changes"));
      }
    });
  }

  resetPassword(): Promise<any> {
    if (this.enteredMemberCredentials.newPassword || this.enteredMemberCredentials.newPasswordConfirm) {
      this.notify.showContactUs(false);
      this.notify.setBusy();
      this.notify.progress({
        title: "Reset password",
        message: "Attempting reset of password for " + this.enteredMemberCredentials.userName
      });
      return this.authService.resetPassword(this.enteredMemberCredentials.userName, this.enteredMemberCredentials.newPassword, this.enteredMemberCredentials.newPasswordConfirm)
        .then(loginResponse => this.processResetPasswordResponse(loginResponse));
    } else {
      return Promise.resolve(this.logger.debug("resetPassword:no changes"));
    }
  }

  validateUserName(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.enteredMemberCredentials.userName !== this.member.userName) {
        this.enteredMemberCredentials.userName = this.enteredMemberCredentials.userName.trim();
        if (this.enteredMemberCredentials.userName.length === 0) {
          reject("The new user name cannot be blank.");
        } else {
          this.member.userName = this.enteredMemberCredentials.userName;
          resolve(true);
        }
      } else {
        resolve(this.logger.debug("validateUserName:no changes"));
      }
    });
  }

  saveLoginDetails() {
    this.logger.debug("saveLoginDetails");
    this.notify.hide();
    this.validateUserNameExistence()
      .then(() => this.resetPassword())
      // .then(() => this.validateUserName())
      .catch(response => {
        this.logger.error(response);
        this.notify.error({title: "Profile", message: response});
      });
  }
}
