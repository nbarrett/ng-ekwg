import { Component, OnInit } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {

  constructor(private upgrade: UpgradeModule) {
  }

  ngOnInit() {
    this.upgrade.bootstrap(document.body, ["ekwgApp"], {strictDi: true});
  }
}
