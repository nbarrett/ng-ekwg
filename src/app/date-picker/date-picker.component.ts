import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { kebabCase } from "lodash-es";
import { DateValue } from "../models/date.model";
import { DateUtilsService } from "../services/date-utils.service";

let id = 0;

@Component({
  selector: "app-date-picker",
  templateUrl: "./date-picker.component.html",
  styleUrls: ["./date-picker.component.sass"]
})
export class DatePickerComponent implements OnInit {

  @Input() dateValue: DateValue;
  @Input() size: string;
  @Input() label: string;
  @Output() dateChange: EventEmitter<DateValue> = new EventEmitter();
  public id: string;

  constructor(
    private dateUtils: DateUtilsService) {
  }

  ngOnInit() {
    this.id = `${kebabCase(this.label || "date-picker")}-${id++}`;
  }

  onModelChange(date: Date) {
    this.dateChange.next(this.dateUtils.asDateValue(date));
  }
}
