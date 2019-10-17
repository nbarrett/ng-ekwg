import { Injectable } from "@angular/core";
import escapeRegExp from "lodash-es/escapeRegExp";
import isNumber from "lodash-es/isNumber";
import isObject from "lodash-es/isObject";
import map from "lodash-es/map";
import { NgxLoggerLevel } from "ngx-logger";
import { humanize } from "underscore.string";
import { AlertMessage } from "../models/alert-target.model";
import { MemberIdToFullNamePipe } from "../pipes/member-id-to-full-name.pipe";
import { DateUtilsService } from "./date-utils.service";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class StringUtilsService {
  private logger: Logger;

  constructor(private memberIdToFullNamePipe: MemberIdToFullNamePipe,
              private dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(StringUtilsService, NgxLoggerLevel.OFF);
  }

  replaceAll(find: any, replace: any, str: any): string | number {
    let replacedValue;
    let initialValue = "" + str;
    while (true) {
      replacedValue = initialValue.replace(new RegExp(escapeRegExp("" + find), "g"), replace);
      if (replacedValue !== initialValue) {
        initialValue = replacedValue;
      } else {
        break;
      }
    }
    return isNumber(str) ? +replacedValue : replacedValue;
  }

  stringify(message: AlertMessage | string): string {
    const extractedMessage = this.isAlertMessage(message) ? message.message : message;
    const returnValue = extractedMessage instanceof TypeError ? extractedMessage.toString() : isObject(extractedMessage) ? JSON.stringify(extractedMessage) : extractedMessage;
    this.logger.debug("stringify:message", message, "returnValue:", returnValue);
    return returnValue;
  }

  censor(censor) {
    let i = 0;

    return (key, value) => {
      if (i !== 0 && typeof (censor) === "object" && typeof (value) === "object" && censor === value) {
        return "[Circular]";
      }

      if (i >= 29) {// seems to be a hard maximum of 30 serialized objects?
        return "[Unknown]";
      }

      ++i; // so we know we aren"t using the original object anymore

      return value;
    };
  }

  stringifyObject(inputValue): string {
    if (typeof inputValue === "object") {
      return map(inputValue, (value, key) => {
        if (isObject(value)) {
          return `${humanize(key)} -> ${this.stringifyObject(value)}`;
        } else {
          return `${humanize(key)}: ${value}`;
        }
      }).join(", ");
    } else {
      return inputValue;
    }
  }

  isAlertMessage(message: AlertMessage | string): message is AlertMessage {
    return message && (message as AlertMessage).message !== undefined;
  }

  stripLineBreaks(str, andTrim) {
    const replacedValue = str.replace(/(\r\n|\n|\r)/gm, "");
    return andTrim && replacedValue ? replacedValue.trim() : replacedValue;
  }

  left(str, chars) {
    return str.substr(0, chars);
  }

  formatAudit(who, when, members) {
    const by = who ? "by " + this.memberIdToFullNamePipe.transform(who, members) : "";
    return (who || when) ? by + (who && when ? " on " : "") + this.dateUtils.displayDateAndTime(when) : "(not audited)";
  }

}
