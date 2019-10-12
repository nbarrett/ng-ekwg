import { Injectable } from "@angular/core";
import isNaN from "lodash-es/isNaN";
import { NgxLoggerLevel } from "ngx-logger";
import { chain } from "../functions/chain";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class NumberUtilsService {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NumberUtilsService, NgxLoggerLevel.OFF);
  }

  sumValues(items: any[], fieldName) {
    if (!items) {
      return 0;
    }
    return chain(items).map(fieldName).reduce((memo, num) => {
      return memo + this.asNumber(num);
    }, 0).value();
  }

  generateUid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r: number = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  asNumber(numberString?: any, decimalPlaces?: number): number {
    if (!numberString) {
      return 0;
    }
    const isNumber: boolean = typeof numberString === "number";
    if (isNumber && !decimalPlaces) {
      return numberString;
    }
    const numberValue: string = isNumber ? numberString : parseFloat(numberString.replace(/[^\d\.\-]/g, ""));
    if (isNaN(numberValue)) {
      return 0;
    }
    const returnValue: number = decimalPlaces ? +parseFloat(numberValue).toFixed(decimalPlaces) : parseFloat(numberValue);
    this.logger.debug("asNumber:", numberString, decimalPlaces, "->", returnValue);
    return returnValue;
  }

}
