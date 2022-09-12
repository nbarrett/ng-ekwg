import { Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

@Component({
  selector: "app-svg",
  templateUrl: "./svg.html",
  styleUrls: ["./svg.sass"]
})
export class SvgComponent implements OnInit {
  @Input() icon: string;
  @Input() width: number;

  private logger: Logger;
  href: any;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(SvgComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit(): void {
    this.href = "/assets/images/new-brand/svg-icons.svg#" + this.icon;
    this.logger.info("created with href:", this.href);
  }
}
