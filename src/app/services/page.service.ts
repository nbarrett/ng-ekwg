import { Injectable } from "@angular/core";
import { Page } from "../models/page.model";
import { UrlService } from "./url.service";

export const HOME: Page = {href: "", title: "Home"};

@Injectable({
  providedIn: "root"
})

export class PageService {
  constructor(private urlService: UrlService) {
  }

  public pages: Page[] = [
    HOME,
    {href: "walks", title: "Walks", migrated: true},
    {href: "social", title: "Social"},
    {href: "join-us", title: "Join Us", migrated: true},
    {href: "contact-us", title: "Contact Us"},
    {href: "committee", title: "Committee"},
    {href: "admin", title: "Admin", migrated: true},
    {href: "how-to", title: "How-to"}];

  pageForArea(area: string): Page {
    area = area.replace("/", "");
    return this.pages.find(page => page.href === area) || HOME;
  }

  isValidArea(): boolean {
    const area = this.urlService.area();
    return !!this.pages.find(page => page.href === area);
  }

  currentPageHasBeenMigrated() {
    return this.pageForArea(this.urlService.area()).migrated;
  }

}
