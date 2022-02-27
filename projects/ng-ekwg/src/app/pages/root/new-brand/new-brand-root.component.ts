import { Component } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-new-brand-root",
  templateUrl: "./new-brand-root.html",
  styleUrls: ["./new-brand-root.sass"]
})
export class NewBrandRootComponent {
  private logger: Logger;

  constructor(
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NewBrandRootComponent, NgxLoggerLevel.OFF);
  }

}
