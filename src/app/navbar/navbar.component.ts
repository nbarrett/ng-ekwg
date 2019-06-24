import { Component } from "@angular/core";
import { UrlService } from "../services/url.service";
import { NGXLogger } from "ngx-logger";


@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavBarComponent {

  public pages = [
    {href: "", title: "Home"},
    {href: "walks", title: "Walks"},
    {href: "social", title: "Social"},
    {href: "join-us", title: "Join Us"},
    {href: "contact-us", title: "Contact Us"},
    {href: "committee", title: "Committee"},
    {href: "admin", title: "Admin"},
    {href: "how-to", title: "How-to"}];

  constructor(private urlService: UrlService, private logger: NGXLogger) {
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

}
