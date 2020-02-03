import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { AlertTarget } from "../../../models/alert-target.model";
import { Member } from "../../../models/member.model";
import { EmailSubscriptionService } from "../../../services/email-subscription.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";
import { MemberLoginService } from "../../../services/member-login.service";
import { AlertInstance, NotifierService } from "../../../services/notifier.service";
import { StringUtilsService } from "../../../services/string-utils.service";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-forgot-password-modal-component",
  templateUrl: "./forgot-password-modal.component.html",
  styleUrls: ["./forgot-password-modal.component.sass"]
})
export class ForgotPasswordModalComponent implements OnInit, OnDestroy {
  private notify: AlertInstance;
  public notifyTarget: AlertTarget = {};
  private logger: Logger;
  public credentialTwo;
  public credentialOne;
  private subscription: Subscription;
  private campaignSendInitiated = false;
  private FORGOTTEN_PASSWORD_SEGMENT = "Forgotten Password";
  public readonly credentialOneLabel = "User name or email address";
  public readonly credentialTwoLabel = "Ramblers membership number or home postcode";
  private forgottenPasswordMember: Member;

  constructor(@Inject("MailchimpSegmentService") private mailchimpSegmentService,
              @Inject("MailchimpConfig") private mailchimpConfigService,
              @Inject("MailchimpCampaignService") private mailchimpCampaignService,
              private emailSubscriptionService: EmailSubscriptionService,
              public bsModalRef: BsModalRef,
              private stringUtils: StringUtilsService,
              private authService: AuthService,
              private memberLoginService: MemberLoginService,
              private urlService: UrlService,
              private notifierService: NotifierService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ForgotPasswordModalComponent, NgxLoggerLevel.OFF);
  }

  ngOnDestroy(): void {
    this.logger.debug("unsubscribing");
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.notify = this.notifierService.createAlertInstance(this.notifyTarget);
    this.logger.debug("constructed");
    this.subscription = this.authService.authResponse().subscribe((loginResponse) => {
      this.logger.info("subscribe:forgot password", loginResponse);
      if (loginResponse.member) {
        this.forgottenPasswordMember = loginResponse.member as Member;
        this.sendForgottenPasswordEmailToMember();
      } else {
        this.logger.debug("loginResponse", loginResponse);
        this.notify.showContactUs(true);
        this.notify.error({
          continue: true,
          title: "Forgot password request failed",
          message: loginResponse.alertMessage
        });
      }
    });
  }

  submit() {
    const userDetails = `${this.credentialOneLabel} as ${this.credentialOne} and ${this.credentialTwoLabel} as ${this.credentialTwo}`;
    this.notify.progress({title: "Forgot password", message: `Checking our records for ${userDetails}`});
    if (!this.submittable()) {
      this.notify.error({
        continue: true,
        title: "Incorrect information entered",
        message: `Please enter ${this.credentialOneLabel} and ${this.credentialTwoLabel}`
      });
    } else {
      this.notify.setBusy();
      this.notify.showContactUs(false);
      this.authService.forgotPassword(this.credentialOne, this.credentialTwo, userDetails);
    }
  }

  getMailchimpConfig() {
    return this.mailchimpConfigService.getConfig()
      .then(config => {
        return config.mailchimp;
      });
  }

  createOrSaveForgottenPasswordSegment(config) {
    return this.mailchimpSegmentService.saveSegment("general", {segmentId: config.segments.general.forgottenPasswordSegmentId}, [{id: this.forgottenPasswordMember.id}], this.FORGOTTEN_PASSWORD_SEGMENT, [this.forgottenPasswordMember]);
  }

  saveSegmentDataToMailchimpConfig(segmentResponse) {
    return this.mailchimpConfigService.getConfig()
      .then(config => {
        config.mailchimp.segments.general.forgottenPasswordSegmentId = segmentResponse.segment.id;
        return this.mailchimpConfigService.saveConfig(config);
      });
  }

  sendForgottenPasswordCampaign() {
    const member = this.forgottenPasswordMember.firstName + " " + this.forgottenPasswordMember.lastName;
    return this.mailchimpConfigService.getConfig()
      .then(config => {
        this.logger.debug("config.mailchimp.campaigns.forgottenPassword.campaignId", config.mailchimp.campaigns.forgottenPassword.campaignId);
        this.logger.debug("config.mailchimp.segments.general.forgottenPasswordSegmentId", config.mailchimp.segments.general.forgottenPasswordSegmentId);
        return this.mailchimpCampaignService.replicateAndSendWithOptions({
          campaignId: config.mailchimp.campaigns.forgottenPassword.campaignId,
          campaignName: "EKWG website password reset instructions (" + member + ")",
          segmentId: config.mailchimp.segments.general.forgottenPasswordSegmentId
        });
      });
  }

  updateGeneralList() {
    return this.emailSubscriptionService.createBatchSubscriptionForList("general", [this.forgottenPasswordMember]);
  }

  sendForgottenPasswordEmailToMember() {
    this.campaignSendInitiated = true;
    return Promise.resolve(this.notify.success("Sending forgotten password email"))
      .then(() => this.updateGeneralList())
      .then(() => this.getMailchimpConfig())
      .then((config) => this.createOrSaveForgottenPasswordSegment(config))
      .then(segmentResponse => this.saveSegmentDataToMailchimpConfig(segmentResponse))
      .then(() => this.sendForgottenPasswordCampaign())
      .then(() => this.finalMessage())
      .then(() => this.notify.clearBusy())
      .catch((error) => this.handleSendError(error));
  }

  handleSendError(errorResponse) {
    this.logger.error("handleSendError:", errorResponse);
    this.campaignSendInitiated = false;
    this.notify.error({
      continue: true,
      title: "Your email could not be sent",
      message: (errorResponse.message || errorResponse) + (errorResponse.error ? (". Error was: " + this.stringUtils.stringify(errorResponse.error)) : "")
    });
  }

  finalMessage() {
    return this.notify.success({
      title: "Message sent",
      message: "We've sent a message to the email address we have for you. Please check your inbox and follow the instructions in the message."
    });
  }

  fieldPopulated(object) {
    return (object || "").length > 0;
  }

  submittable() {
    const credentialOnePopulated = this.fieldPopulated(this.credentialOne);
    const passwordPopulated = this.fieldPopulated(this.credentialTwo);
    return passwordPopulated && credentialOnePopulated && !this.notifyTarget.busy && !this.campaignSendInitiated;
  }

  close() {
    this.bsModalRef.hide();
  }

}
