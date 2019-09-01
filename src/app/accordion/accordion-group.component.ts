import { Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Component({
  selector: "app-accordion-group",
  templateUrl: "./accordion-group.component.html",
  styleUrls: ["./accordion-group.component.sass"]
})
export class AccordionGroupComponent implements OnInit {

  @Input() title: string;
  @Input() initiallyOpen: string;

  public open: boolean;
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AccordionGroupComponent, NgxLoggerLevel.OFF);
  }

  toggle($event: any) {
    this.logger.debug(this.title, "$event ->", $event);
  }

  ngOnInit(): void {
    this.open = false;
    if (this.initiallyOpen === "true") {
      this.logger.debug(this.title, "initiallyOpen -> ", this.initiallyOpen);
      this.open = true;
    }
  }
}

