import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Member, RamblersMember } from "../../models/member.model";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { StringUtilsService } from "../string-utils.service";

@Injectable({
  providedIn: "root"
})
export class MemberNamingService {
  private logger: Logger;

  constructor(private stringUtils: StringUtilsService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberNamingService, NgxLoggerLevel.OFF);
  }

  createUserName(member: RamblersMember | Member) {
    return member.firstName && member.lastName ? this.stringUtils.replaceAll(" ", "", (member.firstName + "." + member.lastName).toLowerCase()) : "";
  }

  createDisplayName(member) {
    return ((member.firstName || "").trim() + " " + (member.lastName || "").trim().substring(0, 1).toUpperCase()).trim();
  }

  createUniqueUserName(member: RamblersMember | Member, members: Member[]) {
    return this.createUniqueValueFrom(this.createUserName(member), "userName", members);
  }

  createUniqueDisplayName(member, members) {
    return this.createUniqueValueFrom(this.createDisplayName(member), "displayName", members);
  }

  createUniqueValueFrom(value, field, members) {
    let attempts = 0;
    while (true) {
      const createdName = value + (attempts === 0 ? "" : attempts);
      if (!this.memberFieldExists(field, createdName, members)) {
        return createdName;
      } else {
        attempts++;
      }
    }
  }

  memberFieldExists(field, value, members) {
    const member = members.find(member => member[field] === value);
    const returnValue = member && member[field];
    this.logger.debug("field", field, "matching", value, member, "->", returnValue);
    return returnValue;
  }
}
