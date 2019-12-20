import { Component } from "@angular/core";
import { PageService } from "./services/page.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})

export class AppComponent {

  constructor(private pageService: PageService) {
  }

  currentPageHasBeenMigrated() {
    return this.pageService.currentPageHasBeenMigrated();
  }
}
