import { Component, OnInit } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
  // styleUrls: ["./app.component.sass"]
})
export class AppComponent implements OnInit {
  title = "ng-ekwg";

  constructor(private upgrade: UpgradeModule) {
  }

  ngOnInit() {
    console.log("ngDoBootstrap:", document.body);
    this.upgrade.bootstrap(document.body, ["ekwgApp"], {strictDi: true});
  }
}
