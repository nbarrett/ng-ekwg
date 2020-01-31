import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { StringUtilsService } from "./string-utils.service";

@Injectable({
  providedIn: "root"
})
export class MemberNamingService {
  private logger: Logger;

  constructor(private stringUtils: StringUtilsService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MemberNamingService, NgxLoggerLevel.OFF);
  }

  createUserName(member) {
    return this.stringUtils.replaceAll(" ", "", (member.firstName + "." + member.lastName).toLowerCase());
  }

  createDisplayName(member) {
    return member.firstName.trim() + " " + member.lastName.trim().substring(0, 1).toUpperCase();
  }

  createUniqueUserName(member, members) {
    return this.createUniqueValueFrom(this.createUserName, "userName", member, members);
  }

  createUniqueDisplayName(member, members) {
    return this.createUniqueValueFrom(this.createDisplayName, "displayName", member, members);
  }

  createUniqueValueFrom(nameFunction, field, member, members) {
    let attempts = 0;
    let suffix = 0;
    while (true) {
      const createdName = nameFunction(member) + suffix;
      if (!this.memberFieldExists(field, createdName, members)) {
        return createdName;
      } else {
        attempts++;
        suffix = attempts;
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
