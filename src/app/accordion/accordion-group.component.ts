import { Component, Input, OnInit } from "@angular/core";
import kebabCase from "lodash-es/kebabCase";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Component({
  selector: "app-accordion-group",
  templateUrl: "./accordion-group.component.html",
  styleUrls: ["./accordion-group.component.sass"]
})
export class AccordionGroupComponent implements OnInit {

  @Input() icon: string;
  @Input() groupTitle: string;
  @Input() initiallyOpen: string;

  public open: boolean;
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AccordionGroupComponent, NgxLoggerLevel.OFF);
  }

  toggle(expanded: boolean) {
    this.logger.debug(this.groupTitle, "toggle ->", expanded);
    this.open = expanded;
    localStorage.setItem(this.storageKey(), expanded.toString());
  }

  ngOnInit(): void {
    const toggledState: boolean = localStorage.getItem(this.storageKey()) === "true";
    this.open = toggledState || this.initiallyOpen === "true";
    this.logger.debug(this.groupTitle, "open -> ", toggledState);
  }

  private storageKey() {
    return "accordion-group-state-" + kebabCase(this.groupTitle);
  }
}

