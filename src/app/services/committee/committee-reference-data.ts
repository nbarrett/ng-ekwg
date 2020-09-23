import get from "lodash-es/get";
import map from "lodash-es/map";
import { NgxLoggerLevel } from "ngx-logger";
import { CommitteeConfig, CommitteeMember } from "../../models/committee.model";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { MemberLoginService } from "../member/member-login.service";
import { FileType } from "./committee-file-type.model";

export class CommitteeReferenceData {

  constructor(private committeeConfig: CommitteeConfig,
              private memberLoginService: MemberLoginService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeReferenceData, NgxLoggerLevel.DEBUG);
    this.localFileTypes = this.committeeConfig.committee.fileTypes;
    this.localCommitteeMembers = map(this.committeeConfig.committee.contactUs, (data, type) => ({
      type,
      fullName: data.fullName,
      memberId: data.memberId,
      nameAndDescription: data.description + " (" + data.fullName + ")",
      description: data.description,
      email: data.email
    }));
  }
  private logger: Logger;
  private localFileTypes: FileType[] = [];
  private localCommitteeMembers: CommitteeMember[] = [];

  static create(referenceData: CommitteeConfig, memberLoginService: MemberLoginService, loggerFactory: LoggerFactory) {
    return new CommitteeReferenceData(referenceData, memberLoginService, loggerFactory);
  }

  committeeMembers(): CommitteeMember[] {
    return this.localCommitteeMembers;
  }

  loggedOnRole(): CommitteeMember {
    const memberId = this.memberLoginService.loggedInMember().memberId;
    const loggedOnRoleData = this.committeeMembers().find((role) => {
      return role.memberId === memberId;
    });
    this.logger.debug("loggedOnRole for", memberId, "->", loggedOnRoleData);
    return loggedOnRoleData;
  }

  fileTypes(): FileType[] {
    return this.localFileTypes;
  }

  committeeMembersForRole(role): CommitteeMember[] {
    const roles = role.split(",").map(value => value.trim());
    return this.committeeMembers().filter(member => roles.includes(member.type));
  }

  contactUsField(role, field) {
    return get(this.committeeConfig.committee.contactUs, [role, field]);
  }

  memberId(role) {
    return this.contactUsField(role, "memberId");
  }

  email(role) {
    return this.contactUsField(role, "email");
  }

  description(role) {
    return this.contactUsField(role, "description");
  }

  fullName(role) {
    return this.contactUsField(role, "fullName");
  }

  isPublic(fileTypeDescription) {
    const found = this.fileTypes().find(fileType => fileType.description === fileTypeDescription);
    return found && found.public;
  }
}
