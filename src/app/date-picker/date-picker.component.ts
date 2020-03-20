import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DateValue } from "../models/date.model";
import { DateUtilsService } from "../services/date-utils.service";

@Component({
  selector: "app-date-picker",
  templateUrl: "./date-picker.component.html",
  styleUrls: ["./date-picker.component.sass"]
})
export class DatePickerComponent implements OnInit {

  @Input() dateValue: DateValue;
  @Input() size: string;
  @Output() dateChange: EventEmitter<DateValue> = new EventEmitter();

  constructor(private dateUtils: DateUtilsService) {
  }

  ngOnInit() {
  }

  onModelChange(date: Date) {
    this.dateChange.next(this.dateUtils.asDateValue(date));
  }
}
