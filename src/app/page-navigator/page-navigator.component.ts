import { Component } from "@angular/core";
import { UrlService } from "../services/url.service";
import { NGXLogger } from "ngx-logger";
import { PageService } from "../services/page.service";


@Component({
  selector: "app-page-navigator",
  templateUrl: "./page-navigator.component.html",
  styleUrls: ["./page-navigator.component.sass"]

})
export class PageNavigatorComponent {

  constructor(private pageService: PageService, private urlService: UrlService, private logger: NGXLogger) {
  }

  isOnPage(page: string) {
    if (page === "") {
      return this.urlService.relativeUrlFirstSegment() === "/";
    } else {
      const relativeUrlFirstSegment = this.urlService.relativeUrlFirstSegment();
      const isOnPage = relativeUrlFirstSegment.endsWith(page);
      this.logger.debug("isOnPage", page, "->", isOnPage, "relativeUrlFirstSegment", relativeUrlFirstSegment);
      return isOnPage;
    }
  }

  pages() {
    return this.pageService.pages;
  }
}
