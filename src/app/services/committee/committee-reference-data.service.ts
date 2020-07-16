import { Injectable, OnInit } from "@angular/core";
import get from "lodash-es/get";
import map from "lodash-es/map";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { CommitteeMember } from "../../models/committee.model";
import { CommitteeConfigService } from "../commitee-config.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { FileType } from "./committee-file-type.model";

@Injectable({
  providedIn: "root"
})

export class CommitteeReferenceDataService {
  private messageSource = new Subject<CommitteeMember[]>();
  private logger: Logger;
  private localFileTypes: FileType[] = [];
  private localCommitteeMembers: CommitteeMember[] = [];
  private referenceData: object = {};

  constructor(private committeeConfig: CommitteeConfigService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(CommitteeReferenceDataService, NgxLoggerLevel.OFF);
    this.queryData();
  }

  queryData(): void {
    this.committeeConfig.getConfig().then(referenceData => {
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
      this.messageSource.next(this.localCommitteeMembers);
    });
  }

  events(): Observable<CommitteeMember[]> {
    return this.messageSource.asObservable();
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
