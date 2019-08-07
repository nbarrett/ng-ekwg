import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "./logger-factory.service";
import * as moment from "moment-timezone";

@Injectable({
  providedIn: "root"
})

export class DateUtilsService {
  private logger: Logger;

  constructor(private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(DateUtilsService, NgxLoggerLevel.INFO);
  }

  public formats = {
    displayDateAndTime: "ddd DD-MMM-YYYY, h:mm:ss a",
    displayDateTh: "MMMM Do YYYY",
    displayDate: "ddd DD-MMM-YYYY",
    displayDay: "dddd MMMM D, YYYY",
    ddmmyyyyWithSlashes: "DD/MM/YYYY",
    yyyymmdd: "YYYYMMDD"
  };

  isDate(value) {
    return value && this.asMoment(value).isValid();
  }

  asDate(value): Date {
    const date = value && this.asMoment(value).toDate();
    this.logger.info("asDate:value is", value, "date is", date);
    return date;
  }

  asMoment(dateValue?: any, inputFormat?: string) {
    return moment(dateValue, inputFormat).tz("Europe/London");
  }

  momentNow() {
    return this.asMoment();
  }

  asString(dateValue, inputFormat, outputFormat) {
    const returnValue = dateValue ? this.asMoment(dateValue, inputFormat).format(outputFormat) : undefined;
    this.logger.debug("asString: dateValue ->", dateValue, "inputFormat ->", inputFormat,
      "outputFormat ->", outputFormat, "returnValue ->", returnValue);
    return returnValue;
  }

  asValue(dateValue: any, inputFormat?: string) {
    return this.asMoment(dateValue, inputFormat).valueOf();
  }

  nowAsValue() {
    return this.asMoment(undefined, undefined).valueOf();
  }

  mailchimpDate(dateValue) {
    return this.asString(dateValue, undefined, this.formats.ddmmyyyyWithSlashes);
  }

  displayDateAndTime(dateValue) {
    return this.asString(dateValue, undefined, this.formats.displayDateAndTime);
  }

  displayDate(dateValue) {
    return this.asString(dateValue, undefined, this.formats.displayDate);
  }

  displayDay(dateValue) {
    return this.asString(dateValue, undefined, this.formats.displayDay);
  }

  asValueNoTime(dateValue?: any, inputFormat?: string) {
    const returnValue = this.asMoment(dateValue, inputFormat).startOf("day").valueOf();
    this.logger.debug("asValueNoTime: dateValue ->", dateValue, "returnValue ->", returnValue, "->", this.displayDateAndTime(returnValue));
    return returnValue;
  }

  currentMemberBulkLoadDisplayDate() {
    return this.asString(this.momentNowNoTime().startOf("month"), undefined, this.formats.yyyymmdd);
  }

  momentNowNoTime() {
    return this.asMoment().startOf("day");
  }

  convertDateFieldInObject(object, field) {
    const inputValue = object[field];
    object[field] = this.convertDateField(inputValue);
    return object;
  }

  convertDateField(inputValue) {
    if (inputValue) {
      const dateValue = this.asValueNoTime(inputValue);
      if (dateValue !== inputValue) {
        this.logger.debug("Converting date from", inputValue, "(" + this.displayDateAndTime(inputValue) + ") to",
          dateValue, "(" + this.displayDateAndTime(dateValue) + ")");
        return dateValue;
      } else {
        this.logger.debug(inputValue, inputValue, "is already in correct format");
        return inputValue;
      }
    } else {
      this.logger.debug(inputValue, "is not a date - no conversion");
      return inputValue;
    }
  }

}
