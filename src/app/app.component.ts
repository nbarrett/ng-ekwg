import { Component, OnInit } from "@angular/core";
import { downgradeInjectable, getAngularJSGlobal, UpgradeModule } from "@angular/upgrade/static";
import { SiteEditService } from "./site-edit/site-edit.service";
import { DateUtilsService } from "./services/date-utils.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {

  constructor(private upgrade: UpgradeModule) {
  }

  ngOnInit() {
    getAngularJSGlobal().module("ekwgApp")
      .factory("SiteEditService", downgradeInjectable(SiteEditService))
      .factory("DateUtils", downgradeInjectable(DateUtilsService));
    this.upgrade.bootstrap(document.body, ["ekwgApp"], {strictDi: true});
  }
}
