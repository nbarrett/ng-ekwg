import { Component } from "@angular/core";
import { NGXLogger } from "ngx-logger";
import { GlobalEvent, SiteEditService } from "./site-edit.service";

@Component({
  selector: "app-site-edit",
  templateUrl: "./site-edit.component.html"
})
export class SiteEditComponent {
  private userEdits;

  constructor(private siteEditService: SiteEditService, private logger: NGXLogger) {
    this.userEdits = {preview: true, saveInProgress: false, revertInProgress: false};
    siteEditService.events.subscribe(item => this.onItemEvent(item));
  }

  toggleEditSite() {
    this.siteEditService.toggle();
  }

  editSiteActive() {
    return this.siteEditService.active() ? "active" : "no acive";
  }

  editSiteCaption() {
    return this.siteEditService.active() ? "editing site" : "edit site";
  }

  private onItemEvent(event: GlobalEvent) {
    this.logger.info("event occurred", event);
  }
}
