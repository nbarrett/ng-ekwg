import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Footer } from "../models/system.model";
import { DateUtilsService } from "../services/date-utils.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { SystemConfigService } from "../services/system/system-config.service";

@Component({
  selector: "app-new-brand-footer",
  templateUrl: "./footer.html",
  styleUrls: ["./footer.sass"]
})
export class FooterComponent implements OnInit {
  private logger: Logger;
  public year: string;
  public footer: Footer;

  constructor(private dateUtils: DateUtilsService,
              private systemConfigService: SystemConfigService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(FooterComponent, NgxLoggerLevel.INFO);
    this.logger.debug("constructed");
  }

  ngOnInit() {
    this.year = this.dateUtils.asString(this.dateUtils.momentNow().valueOf(), undefined, "YYYY");
    this.systemConfigService.events().subscribe(item => this.footer = item.system.footer);
  }

}
