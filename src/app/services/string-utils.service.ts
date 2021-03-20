import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import escapeRegExp from "lodash-es/escapeRegExp";
import has from "lodash-es/has";
import isNumber from "lodash-es/isNumber";
import isObject from "lodash-es/isObject";
import map from "lodash-es/map";
import startCase from "lodash-es/startCase";
import { NgxLoggerLevel } from "ngx-logger";
import { AlertMessage } from "../models/alert-target.model";
import { DateUtilsService } from "./date-utils.service";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class StringUtilsService {
  private logger: Logger;

  constructor(private dateUtils: DateUtilsService,
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

  stringify(message): string {
    let returnValue;
    const extractedMessage = this.isAlertMessage(message) ? message.message : message;
    if (extractedMessage instanceof TypeError) {
      returnValue = extractedMessage.toString();
    } else if (extractedMessage instanceof HttpErrorResponse) {
      returnValue = extractedMessage.statusText + " - " + this.stringifyObject(extractedMessage.error);
    } else if (has(extractedMessage, ["error", "message"])) {
      returnValue = extractedMessage.error.message + (extractedMessage.error.error ? " - " + extractedMessage.error.error : "");
    } else if (has(extractedMessage, ["error", "errmsg"])) {
      returnValue = extractedMessage.error.errmsg + (extractedMessage.error.error ? " - " + extractedMessage.error.error : "");
    } else if (isObject(extractedMessage)) {
      returnValue = this.stringifyObject(extractedMessage);
    } else {
      returnValue = extractedMessage;
    }

    this.logger.debug("stringify:message", message, "extractedMessage:", extractedMessage, "returnValue:", returnValue);
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

  stringifyObject(inputValue, defaultValue?: string): string {
    if (typeof inputValue === "object") {
      return map(inputValue, (value, key) => {
        if (isObject(value)) {
          return `${startCase(key)} -> ${this.stringifyObject(value, defaultValue)}`;
        } else {
          return `${startCase(key)}: ${value || defaultValue || "(none)"}`;
        }
      }).join(", ");
    } else {
      return inputValue || defaultValue || "(none)";
    }
  }

  isAlertMessage(message: any): message is AlertMessage {
    return has(message, ["message"]) && has(message, ["title"]);
  }

  stripLineBreaks(str, andTrim: boolean) {
    const replacedValue = str.replace(/(\r\n|\n|\r)/gm, "");
    return andTrim && replacedValue ? replacedValue.trim() : replacedValue;
  }

  left(str, chars) {
    return str.substr(0, chars);
  }

  pluraliseWithCount(count: number, text: string) {
    return `${count} ${count === 1 ? text : text + "s"}`;
  }
}
