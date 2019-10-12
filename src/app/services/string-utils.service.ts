import { Injectable } from "@angular/core";
import escapeRegExp from "lodash-es/escapeRegExp";
import isNumber from "lodash-es/isNumber";
import isObject from "lodash-es/isObject";
import map from "lodash-es/map";
import { humanize } from "underscore.string";
import { AlertMessage } from "../models/alert-target.model";
import { MemberIdToFullNamePipe } from "../pipes/member-id-to-full-name.pipe";
import { DateUtilsService } from "./date-utils.service";

@Injectable({
  providedIn: "root"
})
export class StringUtilsService {

  constructor(private memberIdToFullNamePipe: MemberIdToFullNamePipe,
              private dateUtils: DateUtilsService) {
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
    return isObject(extractedMessage) ? JSON.stringify(extractedMessage) : extractedMessage;
  }

  stringifyObject(value): string {
    if (typeof value === "object") {
      return map(value, (value, key) => `${humanize(key)}: ${value}`).join(", ");
    } else {
      return value;
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
