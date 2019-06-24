import { Component } from "@angular/core";
import { GlobalEvent, SiteEditService } from "./site-edit.service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

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
    this.logger = loggerFactory.createLogger(SiteEditComponent);
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

  onChange($event: boolean) {
    this.logger.info("onChange", $event);
    this.siteEditService.toggle($event);
  }

  toggle() {
    this.onChange(!this.active());
  }

}
