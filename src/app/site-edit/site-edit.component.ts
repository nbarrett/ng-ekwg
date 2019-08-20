import { Component } from "@angular/core";
import { SiteEditService } from "./site-edit.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { GlobalEvent } from "../services/broadcast-service";

@Component({
  selector: "app-site-edit",
  templateUrl: "./site-edit.component.html",
  styleUrls: ["./site-edit.component.sass"]
})

export class SiteEditComponent {
  private userEdits;
  private logger: Logger;
  private changeEvent: Event;

  constructor(private siteEditService: SiteEditService, private loggerFactory: LoggerFactory) {
    this.userEdits = {preview: true, saveInProgress: false, revertInProgress: false};
    siteEditService.events.subscribe(item => this.onItemEvent(item));
    this.logger = loggerFactory.createLogger(SiteEditComponent, NgxLoggerLevel.OFF);
  }

  active() {
    return this.siteEditService.active();
  }

  caption() {
    return this.siteEditService.active() ? "editing site" : "edit site";
  }

  private onItemEvent(event: GlobalEvent) {
    this.logger.debug("event occurred", event);
  }

  onChange($event: boolean) {
    this.logger.debug("onChange", $event);
    this.siteEditService.toggle($event);
  }

  toggle() {
    this.onChange(!this.active());
  }

}
