import { Component, Input, OnInit } from "@angular/core";
import kebabCase from "lodash-es/kebabCase";
import { CookieService } from "ngx-cookie-service";
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

  constructor(private cookieService: CookieService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AccordionGroupComponent, NgxLoggerLevel.OFF);
  }

  toggle(expanded: boolean) {
    this.logger.debug(this.groupTitle, "toggle ->", expanded);
    this.open = expanded;
    this.cookieService.set(this.cookieName(), expanded.toString());
  }

  ngOnInit(): void {
    const toggledState: boolean = this.cookieService.get(this.cookieName()) === "true";
    this.open = toggledState || this.initiallyOpen === "true";
    this.logger.debug(this.groupTitle, "open -> ", toggledState);
  }

  private cookieName() {
    return "accordion-group-state-" + kebabCase(this.groupTitle);
  }
}

