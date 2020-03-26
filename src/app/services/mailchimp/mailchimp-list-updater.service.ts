import { Inject, Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Member } from "../../models/member.model";
import { MailchimpListSubscriptionService } from "./mailchimp-list-subscription.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { AlertInstance } from "../notifier.service";
import { StringUtilsService } from "../string-utils.service";
import { MailchimpListService } from "./mailchimp-list.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpListUpdaterService {
  private logger: Logger;

  constructor(private mailchimpListService: MailchimpListService,
              private stringUtils: StringUtilsService,
              private mailchimpListSubscriptionService: MailchimpListSubscriptionService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpListUpdaterService, NgxLoggerLevel.OFF);
  }

  updateMailchimpLists(notify: AlertInstance, members: Member[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      notify.success("Sending updates to Mailchimp lists", true);
      this.updateWalksList(members, notify)
        .then(() => this.updateSocialEventsList(members, notify))
        .then(() => this.updateGeneralList(members, notify))
        .then(() => this.unsubscribeWalksList(members, notify))
        .then(() => this.unsubscribeSocialEventsList(members, notify))
        .then(() => this.unsubscribeGeneralList(members, notify))
        .then(() => this.notifyUpdatesComplete(members, notify))
        .then(() => resolve(this.resetSendFlags()))
        .catch((error) => reject(this.mailchimpError(error, notify)));
    });
  }

  private resetSendFlags() {
    this.logger.debug("resetSendFlags");
    return true;
  }

  private unsubscribeWalksList(members, notify: AlertInstance) {
    return this.mailchimpListService.batchUnsubscribeMembers("walks", members, notify);
  }

  private unsubscribeSocialEventsList(members, notify: AlertInstance) {
    return this.mailchimpListService.batchUnsubscribeMembers("socialEvents", members, notify);
  }

  private unsubscribeGeneralList(members, notify: AlertInstance) {
    return this.mailchimpListService.batchUnsubscribeMembers("general", members, notify);
  }

  private mailchimpError(errorResponse, notify: AlertInstance) {
    this.resetSendFlags();
    notify.error({
      title: "Mailchimp updates failed",
      message: (errorResponse.message || errorResponse) + (errorResponse.error ? (". Error was: " + this.stringUtils.stringify(errorResponse.error)) : "")
    });
    notify.clearBusy();
  }

  private resetAllBatchSubscriptions(members: Member[]) {
    // careful with calling this - it resets all batch subscriptions to default values
    this.mailchimpListSubscriptionService.resetAllBatchSubscriptions(members, false);
  }

  private updateWalksList(members, notify: AlertInstance) {
    return this.mailchimpListSubscriptionService.createBatchSubscriptionForList("walks", members);
  }

  private updateSocialEventsList(members, notify: AlertInstance) {
    return this.mailchimpListSubscriptionService.createBatchSubscriptionForList("socialEvents", members);
  }

  private updateGeneralList(members, notify: AlertInstance) {
    return this.mailchimpListSubscriptionService.createBatchSubscriptionForList("general", members);
  }

  private notifyUpdatesComplete(members, notify: AlertInstance) {
    notify.success({title: "Mailchimp updates", message: "Mailchimp lists were updated successfully"});
    notify.clearBusy();
    return true;
  }

}
