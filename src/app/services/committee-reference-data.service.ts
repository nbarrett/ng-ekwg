import { get, map } from "lodash-es";
import { Inject, Injectable } from "@angular/core";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { BehaviorSubject, Observable } from "rxjs";
import { CommitteeMember } from "./committee-member.model";
import { FileType } from "./committee-file-type.model";

@Injectable({
  providedIn: "root"
})

export class CommitteeReferenceDataService {

  private messageSource = new BehaviorSubject({});
  private logger: Logger;
  public events: Observable<object>;
  private localFileTypes: FileType[] = [];
  private localCommitteeMembers: CommitteeMember[] = [];
  private referenceData: object = {};

  constructor(@Inject("CommitteeConfig") private committeeConfig, loggerFactory: LoggerFactory) {
    this.events = this.messageSource.asObservable();
    this.logger = loggerFactory.createLogger(CommitteeReferenceDataService, NgxLoggerLevel.OFF);
    this.queryData();
  }

  private queryData(): void {
    this.committeeConfig.getConfig().then(referenceData => {
      this.logger.info("queryData:referenceData", referenceData);
      this.localFileTypes = get(referenceData, "committee.fileTypes");
      this.localCommitteeMembers = map(get(referenceData, "committee.contactUs"), (data, type) => ({
        type,
        fullName: data.fullName,
        memberId: data.memberId,
        nameAndDescription: data.description + " (" + data.fullName + ")",
        description: data.description,
        email: data.email
      }));
      this.referenceData = referenceData;
      this.logger.info("queryData:localCommitteeMembers", this.localCommitteeMembers);
      this.messageSource.next(referenceData);
    });
  }

  fileTypes(): FileType[] {
    return this.localFileTypes;
  }

  committeeMembers(): CommitteeMember[] {
    return this.localCommitteeMembers;
  }

  committeeMembersForRole(role): CommitteeMember[] {
    const roles = role.split(",").map(value => value.trim());
    return this.committeeMembers().filter(member => roles.includes(member.type));
  }

  contactUsField(role, field) {
    return get(this.referenceData, `committee.contactUs.${role}.${field}`);
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
