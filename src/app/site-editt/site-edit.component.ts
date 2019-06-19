import { Component } from "@angular/core";
import { GlobalEvent, SiteEditService } from "./site-edit.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Component({
  selector: "app-site-edit",
  templateUrl: "./site-edit.component.html"
})

export class SiteEditComponent {
  private userEdits;
  private logger: Logger;

  constructor(private siteEditService: SiteEditService, private loggerFactory: LoggerFactory) {
    this.userEdits = {preview: true, saveInProgress: false, revertInProgress: false};
    siteEditService.events.subscribe(item => this.onItemEvent(item));
    this.logger = loggerFactory.createLogger(SiteEditComponent);
  }

  toggle() {
    this.siteEditService.toggle();
  }

  active() {
    return this.siteEditService.active();
  }

  caption() {
    return this.siteEditService.active() ? "editing site" : "edit site";
  }

  private onItemEvent(event: GlobalEvent) {
    this.logger.info("event occurred", event);
  }
}
