import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Member } from "src/app/models/member.model";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberService } from "../member/member.service";
import { StringUtilsService } from "../string-utils.service";
import { MailchimpListSubscriptionService } from "./mailchimp-list-subscription.service";
import { MailchimpListService } from "./mailchimp-list.service";

@Injectable({
  providedIn: "root"
})
export class MailchimpSegmentService {
  private logger: Logger;

  constructor(private stringUtils: StringUtilsService,
              private dateUtils: DateUtilsService,
              private memberService: MemberService,
              private mailchimpListSubscriptionService: MailchimpListSubscriptionService,
              private mailchimpListService: MailchimpListService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MailchimpSegmentService, NgxLoggerLevel.DEBUG);
  }

  renameSegment(listType, segmentId, segmentNameInput) {
    const segmentName = this.formatSegmentName(segmentNameInput);
    return this.mailchimpListService.renameSegment(listType, segmentId, segmentName);
  }

  buildSegmentMemberData(listType: string, memberIds: string[], members: Member[]) {
    const segmentMembers = memberIds
      .map(memberId => this.memberService.toMember(memberId, members))
      .filter(member => member && member.email)
      .map(member => this.mailchimpListSubscriptionService.addMailchimpIdentifiersToRequest(member, listType));
    if (!segmentMembers || segmentMembers.length === 0) {
      throw new Error(`No members were added to the ${listType} email segment from the ${memberIds.length} supplied members. Please check that they have a valid email address and are subscribed to ${listType}`);
    }
    return segmentMembers;
  }

  saveSegment(listType, mailchimpConfig, memberIds, segmentName, members) {
    const segmentMembers = this.buildSegmentMemberData(listType, memberIds, members);
    this.logger.debug("saveSegment:buildSegmentMemberData:", listType, memberIds, segmentMembers);
    if (mailchimpConfig && mailchimpConfig.segmentId) {
      const segmentId = mailchimpConfig.segmentId;
      this.logger.debug("saveSegment:segmentId", mailchimpConfig);
      return this.mailchimpListService.resetSegment(listType, segmentId)
        .then(() => this.renameSegment(listType, segmentId, segmentName))
        .then((renameSegmentResponse) => this.addSegmentMembersDuringUpdate(listType, segmentId, segmentMembers, renameSegmentResponse))
        .then((addSegmentMembersResponse) => ({members: addSegmentMembersResponse.members, segment: {id: segmentId}}));
    } else {
      return this.mailchimpListService.addSegment(listType, segmentName)
        .then((addSegmentResponse) => this.addSegmentMembersDuringAdd(listType, segmentMembers, addSegmentResponse));
    }
  }

  addSegmentMembersDuringUpdate(listType, segmentId, segmentMembers, renameSegmentResponse) {
    if (segmentMembers.length > 0) {
      return this.mailchimpListService.addSegmentMembers(listType, segmentId, segmentMembers)
        .then(addMemberResponse => ({segment: renameSegmentResponse, members: addMemberResponse}));
    } else {
      return Promise.resolve({segment: renameSegmentResponse.id, members: {}});
    }
  }

  addSegmentMembersDuringAdd(listType, segmentMembers, addSegmentResponse) {
    if (segmentMembers.length > 0) {
      return this.mailchimpListService.addSegmentMembers(listType, addSegmentResponse.id, segmentMembers)
        .then(addMemberResponse => ({segment: addSegmentResponse, members: addMemberResponse}));
    } else {
      return Promise.resolve({segment: addSegmentResponse, members: {}});
    }
  }

  getMemberSegmentId(member, segmentType) {
    if (member.mailchimpSegmentIds) {
      return member.mailchimpSegmentIds[segmentType];
    }
  }

  setMemberSegmentId(member, segmentType, segmentId) {
    if (!member.mailchimpSegmentIds) {
      member.mailchimpSegmentIds = {};
    }
    member.mailchimpSegmentIds[segmentType] = segmentId;
  }

  public formatSegmentName(prefix): string {
    const dateSuffix = ` (${this.dateUtils.nowAsValue()})`;
    const segmentName = this.stringUtils.stripLineBreaks(prefix, true).substring(0, 99 - dateSuffix.length) + dateSuffix;
    this.logger.debug("segmentName", segmentName, "length", segmentName.length);
    return segmentName;
  }

}
