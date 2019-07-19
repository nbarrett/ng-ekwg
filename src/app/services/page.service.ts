import { Injectable } from "@angular/core";
import { Page } from "./page.model";


const HOME: Page = {href: "", title: "Home"};

@Injectable({
  providedIn: "root"
})

export class PageService {
  constructor() {
  }

  public pages: Page[] = [
    HOME,
    {href: "walks", title: "Walks"},
    {href: "social", title: "Social"},
    {href: "join-us", title: "Join Us", upgraded: true},
    {href: "contact-us", title: "Contact Us"},
    {href: "committee", title: "Committee"},
    {href: "admin", title: "Admin"},
    {href: "how-to", title: "How-to"}];

  pageForArea(area: string): Page {
    area = area.replace("/", "");
    return this.pages.find(page => page.href === area) || HOME;
  }

}