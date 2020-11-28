import get from "lodash-es/get";
import map from "lodash-es/map";
import { CommitteeConfig, CommitteeMember } from "../../models/committee.model";
import { MemberLoginService } from "../member/member-login.service";
import { FileType } from "./committee-file-type.model";

export class CommitteeReferenceData {

  constructor(private committeeConfig: CommitteeConfig,
              private memberLoginService: MemberLoginService) {
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

  private localFileTypes: FileType[] = [];
  private localCommitteeMembers: CommitteeMember[] = [];

  static create(referenceData: CommitteeConfig, memberLoginService: MemberLoginService) {
    return new CommitteeReferenceData(referenceData, memberLoginService);
  }

  committeeMembers(): CommitteeMember[] {
    return this.localCommitteeMembers;
  }

  loggedOnRole(): CommitteeMember {
    const memberId = this.memberLoginService.loggedInMember().memberId;
    return this.committeeMembers().find((role) => {
      return role.memberId === memberId;
    });
  }

  fileTypes(): FileType[] {
    return this.localFileTypes;
  }

  committeeMembersForRole(role): CommitteeMember[] {
    const roles = role.split(",").map(value => value.trim());
    return this.committeeMembers().filter(member => roles.includes(member.type));
  }

  contactUsField(role, field): string {
    return get(this.committeeConfig.committee.contactUs, [role, field]);
  }

  memberId(role): string {
    return this.contactUsField(role, "memberId");
  }

  email(role): string {
    return this.contactUsField(role, "email");
  }

  description(role): string {
    return this.contactUsField(role, "description");
  }

  fullName(role): string {
    return this.contactUsField(role, "fullName");
  }

  isPublic(fileTypeDescription): boolean {
    const found = this.fileTypes().find(fileType => fileType.description === fileTypeDescription);
    return found && found.public;
  }
}
