import { Component } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-walk-information",
  templateUrl: "./walk-information.component.html"
})
export class WalkInformationComponent {
  private logger: Logger;

  constructor(
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkInformationComponent, NgxLoggerLevel.OFF);
  }

}
