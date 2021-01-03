import { Injectable } from "@angular/core";
import { cloneDeep } from "lodash-es";
import each from "lodash-es/each";
import { NgxLoggerLevel } from "ngx-logger";
import {
  MailchimpBatchSubscriptionResponse,
  MailchimpSubscription,
  MergeVariablesRequest,
  AuditStatus,
  SubscriberIdentifiers,
  SubscriberIdentifiersWithError,
  SubscriptionRequest,
  toMailchimpMemberIdentifiers
} from "../../models/mailchimp.model";
import { Member } from "../../models/member.model";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MailchimpErrorParserService } from "../mailchimp-error-parser.service";
import { MemberLoginService } from "../member/member-login.service";
import { MemberService } from "../member/member.service";
import { AlertInstance } from "../notifier.service";
import { MailchimpListAuditService } from "./mailchimp-list-audit.service";
import { MailchimpListService } from "./mailchimp-list.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpListSubscriptionService {
  private logger: Logger;

  constructor(private memberService: MemberService,
              private dateUtils: DateUtilsService,
              private mailchimpListAuditService: MailchimpListAuditService,
              private mailchimpListService: MailchimpListService,
              private memberLoginService: MemberLoginService,
              private mailchimpErrorParserService: MailchimpErrorParserService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpListSubscriptionService, NgxLoggerLevel.OFF);
  }

  setMailchimpSubscriptionsStateFor(members: Member[], subscribedState: boolean, notify: AlertInstance): Promise<any> {
    const endState: string = subscribedState ? "subscribe" : "unsubscribe";
    const savePromises = [];
    notify.warning({title: "Bulk " + endState, message: `Bulk setting Mailchimp subscriptions for ${members.length} members to ${subscribedState}`}, false, true);
    each(members, member => {
      this.mailchimpListService.setMailchimpSubscriptionStateFor(member, subscribedState);
      savePromises.push(this.memberService.update(member));
    });

    return Promise.all(savePromises).then(() => {
      notify.success({title: "Bulk " + endState, message: `Reset of subscriptions completed. Next Mailchimp send will bulk ${endState} all Mailchimp lists`}, false);
      return this.refreshMembersIfAdmin();
    });
  }

  private refreshMembersIfAdmin(): Promise<Member[]> {
    if (this.memberLoginService.allowMemberAdminEdits()) {
      return this.memberService.all();
    } else {
      return Promise.resolve([]);
    }
  }

  addMailchimpIdentifiersToRequest(member: Member, listType, mergeVariablesRequest?: MergeVariablesRequest): SubscriptionRequest {
    const mailchimpIdentifiers: MailchimpSubscription = {email: {email: member.email}};
    if (member.mailchimpLists[listType].leid) {
      mailchimpIdentifiers.email.leid = member.mailchimpLists[listType].leid;
    }
    if (mergeVariablesRequest) {
      return {...mergeVariablesRequest, ...mailchimpIdentifiers};
    } else {
      return mailchimpIdentifiers.email;
    }
  }

  createBatchSubscriptionForList(listType, members: Member[]): Promise<Member[]> {
    this.logger.debug(`Sending ${listType} member data to Mailchimp`);
    const batchedMembers = [];
    const subscriptionRequests: SubscriptionRequest[] = members
      .filter(member => this.mailchimpListService.includeMemberInSubscription(listType, member))
      .map((member: Member) => {
        batchedMembers.push(member);
        const request: MergeVariablesRequest = {
          merge_vars: {
            FNAME: member.firstName,
            LNAME: member.lastName,
            MEMBER_NUM: member.membershipNumber,
            MEMBER_EXP: this.dateUtils.displayDate(member.membershipExpiryDate),
            USERNAME: member.userName,
            PW_RESET: member.passwordResetId || ""
          }
        };
        return this.addMailchimpIdentifiersToRequest(member, listType, request);
      });
    this.logger.info("createBatchSubscriptionForList:", listType, "for", subscriptionRequests.length, "members");
    if (subscriptionRequests.length > 0) {
      this.logger.info("sending", subscriptionRequests.length, listType, "subscriptions to mailchimp", subscriptionRequests);
      return this.mailchimpListService.batchSubscribe(listType, subscriptionRequests)
        .then((response: MailchimpBatchSubscriptionResponse) => {
          this.logger.info("createBatchSubscriptionForList response", response);
          const savePromises = [];
          this.processValidResponses(listType, response.updates.concat(response.adds), batchedMembers, savePromises);
          this.processErrorResponses(listType, response.errors, batchedMembers, savePromises);
          const totalResponseCount = response.updates.length + response.adds.length + response.errors.length;
          this.logger.debug(`Send of ${subscriptionRequests.length} ${listType} members completed - processing ${totalResponseCount} Mailchimp response(s)`);
          return Promise.all(savePromises).then(() => {
            return this.refreshMembersIfAdmin().then(refreshedMembers => {
              this.logger.debug(`Send of ${subscriptionRequests.length} members to ${listType} list completed with ${response.add_count} member(s) added, ${response.update_count} updated and ${response.error_count} error(s)`);
              return refreshedMembers;
            });
          });
        }).catch(response => {
          this.logger.error(response);
          const data = response.error || response;
          const errorMessage = `Sending of ${listType} member data to Mailchimp was not successful due to response: ${data}`;
          return Promise.reject(errorMessage);
        });
    } else {
      const message = `No ${listType} updates to send Mailchimp`;
      this.logger.info(message);
      this.logger.debug(message);
      return this.refreshMembersIfAdmin();
    }
  }

  processValidResponses(listType, validResponses: SubscriberIdentifiers[], batchedMembers, savePromises) {
    each(validResponses, (subscriberIdentifiers: SubscriberIdentifiers) => {
      const member = this.mailchimpListService.findMemberAndMarkAsUpdated(listType, batchedMembers, toMailchimpMemberIdentifiers(subscriberIdentifiers));
      if (member) {
        member.mailchimpLists[listType].code = undefined;
        member.mailchimpLists[listType].error = undefined;
        this.logger.debug(`processing valid response for member ${member.email}`);
        savePromises.push(this.memberService.updateMailSubscription(member.id, listType, member.mailchimpLists[listType]));
      }
    });
  }

  processErrorResponses(listType, errorResponses: SubscriberIdentifiersWithError[], batchedMembers, savePromises) {
    errorResponses.forEach(response => {
      const member: Member = this.mailchimpListService.findMemberAndMarkAsUpdated(listType, batchedMembers, toMailchimpMemberIdentifiers(response.email));
      if (member) {
        this.logger.debug("processing error response", response, "for member", member.email);
        const recoverable = [210, 211, 212, 213, 214, 215, 220, 250].includes(response.code);
        this.mailchimpListAuditService.create({
          audit: cloneDeep(response),
          listType,
          memberId: member.id,
          status: recoverable ? AuditStatus.warning : AuditStatus.error,
          timestamp: this.dateUtils.nowAsValue()
        });
        if (recoverable) {
          member.mailchimpLists[listType].subscribed = false;
          delete response.error;
        }
        savePromises.push(this.memberService.update(member));
      } else {
        this.logger.warn("failed to find member when processing error response", response);
      }
    });
  }

}
