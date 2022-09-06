import { Component } from "@angular/core";
import { UrlService } from "../services/url.service";
import { PageService } from "../services/page.service";


@Component({
  selector: "app-page-title",
  templateUrl: "./page-title.component.html",
  styleUrls: ["./page-title.component.sass"]

})
export class PageTitleComponent {

  constructor(private urlService: UrlService, private pageService: PageService) {
  }

  title() {
    return `EKWG - ${this.pageService.pageForArea(this.urlService.area())?.title}`;
  }

}
