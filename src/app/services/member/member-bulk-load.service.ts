import { Injectable } from "@angular/core";
import each from "lodash-es/each";
import omit from "lodash-es/omit";
import { NgxLoggerLevel } from "ngx-logger";
import { Member, MemberBulkLoadAudit, MemberBulkLoadAuditApiResponse, MemberUpdateAudit } from "../../models/member.model";
import { DisplayDatePipe } from "../../pipes/display-date.pipe";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MailchimpListService } from "../mailchimp/mailchimp-list.service";
import { AlertInstance } from "../notifier.service";
import { MemberBulkLoadAuditService } from "./member-bulk-load-audit.service";
import { MemberNamingService } from "./member-naming.service";
import { MemberUpdateAuditService } from "./member-update-audit.service";
import { MemberService } from "./member.service";

@Injectable({
  providedIn: "root"
})
export class MemberBulkLoadService {
  private logger: Logger;

  constructor(private memberUpdateAuditService: MemberUpdateAuditService,
              private memberBulkLoadAuditService: MemberBulkLoadAuditService,
              private memberService: MemberService,
              private mailchimpListService: MailchimpListService,
              private displayDate: DisplayDatePipe,
              private memberNamingService: MemberNamingService,
              private dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberBulkLoadService, NgxLoggerLevel.OFF);
  }

  processResponse(apiResponse: MemberBulkLoadAuditApiResponse, members: Member[], notify: AlertInstance): Promise<any> {
    notify.setBusy();
    const today = this.dateUtils.momentNowNoTime().valueOf();
    const memberBulkLoadResponse = apiResponse.response as MemberBulkLoadAudit;
    this.logger.debug("processResponse:received", memberBulkLoadResponse);

    const updateGroupMembersPreBulkLoadProcessing = (): Promise<any[]> => {

      if (memberBulkLoadResponse.members && memberBulkLoadResponse.members.length > 1) {
        notify.progress("Processing " + members.length + " members ready for bulk load");

        const memberUpdates = members.map(member => {
          if (member.receivedInLastBulkLoad) {
            member.receivedInLastBulkLoad = false;
            return this.memberService.createOrUpdate(member);
          }
        });
        return Promise.all(memberUpdates).then(() => {
          notify.progress("Marked " + memberUpdates.length + " out of " + members.length + " in preparation for update");
          return memberUpdates;
        });
      } else {
        return Promise.resolve([]);
      }
    };

    const processBulkLoadResponses = async (uploadSessionId: string) => {
      const updatedPromises = await updateGroupMembersPreBulkLoadProcessing();
      each(memberBulkLoadResponse.members, (ramblersMember, recordIndex) => {
        createOrUpdateMember(uploadSessionId, recordIndex, ramblersMember, updatedPromises);
      });
      await Promise.all(updatedPromises);
      this.logger.debug("performed total of", updatedPromises.length, "audit or member updates");
      return updatedPromises;
    };

    const saveAndAuditMemberUpdate = (promises, uploadSessionId, rowNumber, memberAction, changes, auditMessage, member) => {

      const audit: MemberUpdateAudit = {
        uploadSessionId,
        updateTime: this.dateUtils.nowAsValue(),
        memberAction,
        rowNumber,
        changes,
        auditMessage
      };

      const qualifier = "for membership " + member.membershipNumber;
      member.receivedInLastBulkLoad = true;
      member.lastBulkLoadDate = this.dateUtils.momentNow().valueOf();
      return this.memberService.createOrUpdate(member)
        .then(savedMember => {
          audit.memberId = savedMember.id;
          notify.success({title: "Bulk member load " + qualifier + " was successful", message: auditMessage});
          this.logger.debug("saveAndAuditMemberUpdate:", audit);
          promises.push(this.memberUpdateAuditService.create(audit));
          return promises;
        }).catch(response => {
          this.logger.warn("member save error for member:", member, "response:", response);
          audit.member = member;
          audit.memberAction = "error";
          this.logger.warn("member was not saved, so saving it to audit:", audit);
          notify.warning({title: "Bulk member load " + qualifier + " failed", message: auditMessage});
          audit.auditErrorMessage = omit(response.error, "request");
          promises.push(this.memberUpdateAuditService.create(audit));
          return promises;
        });
    };

    const convertMembershipExpiryDate = (ramblersMember) => {
      const dataValue = ramblersMember.membershipExpiryDate ? this.dateUtils.asValueNoTime(ramblersMember.membershipExpiryDate, "DD/MM/YYYY") : ramblersMember.membershipExpiryDate;
      this.logger.debug("ramblersMember", ramblersMember, "membershipExpiryDate", ramblersMember.membershipExpiryDate, "->", this.dateUtils.displayDate(dataValue));
      return dataValue;
    };

    const createOrUpdateMember = (uploadSessionId, recordIndex, ramblersMember, promises) => {

      let memberAction: string;
      ramblersMember.membershipExpiryDate = convertMembershipExpiryDate(ramblersMember);
      ramblersMember.groupMember = !ramblersMember.membershipExpiryDate || ramblersMember.membershipExpiryDate >= today;
      let member: Member = members.find(member => {
        const existingUserName = this.memberNamingService.createUserName(ramblersMember);
        let match: boolean = member.membershipNumber && member.membershipNumber.toString() === ramblersMember.membershipNumber;
        if (!match && member.userName) {
          match = member.userName === existingUserName;
        }
        this.logger.debug("match", !!(match),
          "ramblersMember.membershipNumber", ramblersMember.membershipNumber,
          "ramblersMember.userName", existingUserName,
          "member.membershipNumber", member.membershipNumber,
          "member.userName", member.userName);
        return match;
      });

      if (member) {
        this.mailchimpListService.resetUpdateStatusForMember(member);
      } else {
        memberAction = "created";
        member = {
          userName: this.memberNamingService.createUniqueUserName(ramblersMember, members),
          displayName: this.memberNamingService.createUniqueDisplayName(ramblersMember, members),
          expiredPassword: true
        };
        this.mailchimpListService.defaultMailchimpSettings(member, true);
        this.logger.debug("new member created:", member);
      }

      const updateAudit = {auditMessages: [], fieldsChanged: 0, fieldsSkipped: 0};
      each([
        {fieldName: "membershipExpiryDate", writeDataIf: "changed", type: "date"},
        {fieldName: "membershipNumber", writeDataIf: "changed", type: "string"},
        {fieldName: "mobileNumber", writeDataIf: "empty", type: "string"},
        {fieldName: "email", writeDataIf: "empty", type: "string"},
        {fieldName: "firstName", writeDataIf: "empty", type: "string"},
        {fieldName: "lastName", writeDataIf: "empty", type: "string"},
        {fieldName: "postcode", writeDataIf: "empty", type: "string"},
        {fieldName: "groupMember", writeDataIf: "not-revoked", type: "boolean"}], field => {
        changeAndAuditMemberField(updateAudit, member, ramblersMember, field);
      });

      this.logger.debug("saveAndAuditMemberUpdate -> member:", member, "updateAudit:", updateAudit);
      return saveAndAuditMemberUpdate(promises, uploadSessionId, recordIndex + 1, memberAction || (updateAudit.fieldsChanged > 0 ? "updated" : "skipped"), updateAudit.fieldsChanged, updateAudit.auditMessages.join(", "), member);

    };

    const changeAndAuditMemberField = (updateAudit, member, ramblersMember, field) => {

      const auditValueForType = (field, source) => {
        const dataValue = source[field.fieldName];
        switch (field.type) {
          case "date":
            return this.displayDate.transform(dataValue || "(none)");
          case "boolean":
            return dataValue || false;
          default:
            return dataValue || "(none)";
        }
      };

      const fieldName = field.fieldName;
      let performMemberUpdate = false;
      let auditQualifier = " not overwritten with ";
      let auditMessage;
      const oldValue = auditValueForType(field, member);
      const newValue = auditValueForType(field, ramblersMember);
      if (field.writeDataIf === "changed") {
        performMemberUpdate = (oldValue !== newValue) && ramblersMember[fieldName];
      } else if (field.writeDataIf === "empty") {
        performMemberUpdate = !member[fieldName];
      } else if (field.writeDataIf === "not-revoked") {
        performMemberUpdate = newValue && (oldValue !== newValue) && !member.revoked;
      } else if (field.writeDataIf) {
        performMemberUpdate = newValue;
      }
      if (performMemberUpdate) {
        auditQualifier = " updated to ";
        member[fieldName] = ramblersMember[fieldName];
        updateAudit.fieldsChanged++;
      }
      if (oldValue !== newValue) {
        if (!performMemberUpdate) {
          updateAudit.fieldsSkipped++;
        }
        auditMessage = fieldName + ": " + oldValue + auditQualifier + newValue;
      }
      if ((performMemberUpdate || (oldValue !== newValue)) && auditMessage) {
        updateAudit.auditMessages.push(auditMessage);
      }
    };

    return this.memberBulkLoadAuditService.create(memberBulkLoadResponse)
      .then((auditResponse: MemberBulkLoadAudit) => {
        const uploadSessionId = auditResponse.id;
        return processBulkLoadResponses(uploadSessionId);
      });

  }

}
