import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { DateUtilsService } from "../services/date-utils.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Component({
  selector: "app-footer",
  templateUrl: "./legacy-footer.component.html",
  styleUrls: ["./legacy-footer.component.sass"]

})
export class LegacyFooterComponent implements OnInit {
  private logger: Logger;
  public year: string;

  constructor(private dateUtils: DateUtilsService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LegacyFooterComponent, NgxLoggerLevel.OFF);
    this.logger.debug("constructed");
  }

  ngOnInit() {
    this.year = this.dateUtils.asString(this.dateUtils.momentNow().valueOf(), undefined, "YYYY");

  }

}
