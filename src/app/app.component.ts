import { Component, OnInit } from "@angular/core";
import { downgradeInjectable, getAngularJSGlobal, UpgradeModule } from "@angular/upgrade/static";
import { SiteEditService } from "./site-edit/site-edit.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {

  constructor(private upgrade: UpgradeModule) {
  }

  ngOnInit() {
    getAngularJSGlobal().module("ekwgApp")
      .factory("SiteEditService", downgradeInjectable(SiteEditService));
    this.upgrade.bootstrap(document.body, ["ekwgApp"], {strictDi: true});
  }
}
