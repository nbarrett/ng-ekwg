import { Pipe, PipeTransform } from "@angular/core";
import { DateUtilsService } from "./services/date-utils.service";

@Pipe({name: "displayDate"})
export class DisplayDate implements PipeTransform {
  constructor(private dateUtils: DateUtilsService) {
  }

  transform(dateValue: any) {
    return this.dateUtils.displayDate(dateValue);
  }

}

@Pipe({name: "displayDay"})
export class DisplayDay implements PipeTransform {
  constructor(private dateUtils: DateUtilsService) {
  }

  transform(dateValue: any) {
    return this.dateUtils.displayDay(dateValue);
  }

}

@Pipe({name: "displayDateAndTime"})
export class DisplayDateAndTime implements PipeTransform {
  constructor(private dateUtils: DateUtilsService) {
  }

  transform(dateValue: any) {
    return this.dateUtils.displayDateAndTime(dateValue);
  }

}
