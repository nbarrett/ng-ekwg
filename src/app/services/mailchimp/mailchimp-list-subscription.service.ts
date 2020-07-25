import { Injectable } from "@angular/core";
import each from "lodash-es/each";
import { NgxLoggerLevel } from "ngx-logger";
import { chain } from "../../functions/chain";
import { MailchimpSubscription, MergeVariablesRequest, SubscriptionRequest } from "../../models/mailchimp.model";
import { Member } from "../../models/member.model";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MailchimpErrorParserService } from "../mailchimp-error-parser.service";
import { MemberLoginService } from "../member/member-login.service";
import { MemberService } from "../member/member.service";
import { MailchimpListService } from "./mailchimp-list.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpListSubscriptionService {
  private logger: Logger;

  constructor(private memberService: MemberService,
              private dateUtils: DateUtilsService,
              private mailchimpListService: MailchimpListService,
              private memberLoginService: MemberLoginService,
              private mailchimpErrorParserService: MailchimpErrorParserService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpListSubscriptionService, NgxLoggerLevel.OFF);
  }

  resetAllBatchSubscriptions(members, subscribedState) {
    const savePromises = [];
    this.logger.debug(`Resetting Mailchimp subscriptions for ${members.length} members`);
    each(members, member => {
      this.mailchimpListService.defaultMailchimpSettings(member, subscribedState);
      savePromises.push(this.memberService.update(member));
    });

    Promise.all(savePromises).then(() => {
      this.logger.debug("Reset of Mailchimp subscriptions completed. Next member save will resend all lists to Mailchimp");
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

  createBatchSubscriptionForList(listType, members): Promise<Member[]> {
    this.logger.debug(`Sending ${listType} member data to Mailchimp`);
    const batchedMembers = [];
    const subscriptionRequests: SubscriptionRequest[] = chain(members)
      .filter(member => this.mailchimpListService.includeMemberInSubscription(listType, member))
      .map(member => {
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
      }).value();
    this.logger.info("createBatchSubscriptionForList:", listType, "for", subscriptionRequests.length, "members");
    if (subscriptionRequests.length > 0) {
      this.logger.info("sending", subscriptionRequests.length, listType, "subscriptions to mailchimp", subscriptionRequests);
      return this.mailchimpListService.batchSubscribe(listType, subscriptionRequests)
        .then(response => {
          this.logger.info("createBatchSubscriptionForList response", response);
          const errorResponse = this.mailchimpErrorParserService.extractError(response);
          this.logger.info("createBatchSubscriptionForList response:errorResponse", errorResponse, "error:", errorResponse.error);
          if (errorResponse.error) {
            return Promise.reject({
              message: `Sending of ${listType} list subscription to Mailchimp was not successful`,
              error: errorResponse.error
            });
          } else {
            const totalResponseCount = response.updates.concat(response.adds).concat(response.errors).length;
            this.logger.debug(`Send of ${subscriptionRequests.length} ${listType} members completed - processing ${totalResponseCount} Mailchimp response(s)`);
            const savePromises = [];
            this.processValidResponses(listType, response.updates.concat(response.adds), batchedMembers, savePromises);
            this.processErrorResponses(listType, response.errors, batchedMembers, savePromises);
            return Promise.all(savePromises).then(() => {
              return this.refreshMembersIfAdmin().then(refreshedMembers => {
                this.logger.debug(`Send of ${subscriptionRequests.length} members to ${listType} list completed with ${response.add_count} member(s) added, ${response.update_count} updated and ${response.error_count} error(s)`);
                return refreshedMembers;
              });
            });
          }
        }).catch(response => {
          const data = response.error;
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

  processValidResponses(listType, validResponses, batchedMembers, savePromises) {
    each(validResponses, response => {
      const member = this.mailchimpListService.findMemberAndMarkAsUpdated(listType, batchedMembers, response);
      if (member) {
        member.mailchimpLists[listType].code = undefined;
        member.mailchimpLists[listType].error = undefined;
        this.logger.debug(`processing valid response for member ${member.email}`);
        savePromises.push(this.memberService.updateMailSubscription(member.id, listType, member.mailchimpLists[listType]));
      }
    });
  }

  processErrorResponses(listType, errorResponses, batchedMembers, savePromises) {
    each(errorResponses, response => {
      const member = this.mailchimpListService.findMemberAndMarkAsUpdated(listType, batchedMembers, response.email);
      if (member) {
        this.logger.debug(`processing error response for member ${member.email}`);
        member.mailchimpLists[listType].code = response.code;
        member.mailchimpLists[listType].error = response.error;
        if ([210, 211, 212, 213, 214, 215, 220, 250].includes(response.code)) {
          member.mailchimpLists[listType].subscribed = false;
        }
        savePromises.push(this.memberService.update(member));
      }
    });
  }

}
