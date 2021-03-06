import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { kebabCase } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { DateValue } from "../models/date.model";
import { DateUtilsService } from "../services/date-utils.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

let id = 0;

@Component({
  selector: "app-date-picker",
  templateUrl: "./date-picker.component.html",
  styleUrls: ["./date-picker.component.sass"]
})
export class DatePickerComponent implements OnInit, OnChanges {

  dateValue: DateValue;
  @Input() value: DateValue | number;
  @Input() size: string;
  @Input() label: string;
  @Output() dateChange: EventEmitter<DateValue> = new EventEmitter();
  public id: string;
  private logger: Logger;

  constructor(
    private dateUtils: DateUtilsService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(DatePickerComponent, NgxLoggerLevel.OFF);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.debug("changes were", changes);
    this.setValue(changes.value.currentValue);
  }

  ngOnInit() {
    this.id = `${kebabCase(this.label || "date-picker")}-${id++}`;
    this.logger.debug("ngOnInit", typeof this.value, this.value);
    this.setValue(this.value);
  }

  private setValue(value: DateValue | number) {
    if (typeof value === "number") {
      this.dateValue = this.dateUtils.asDateValue(this.value);
    } else {
      this.dateValue = value;
    }
  }

  onModelChange(date: Date) {
    this.dateChange.next(this.dateUtils.asDateValue(date));
  }
}
