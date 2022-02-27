import { Injectable } from "@angular/core";
import { Page } from "../models/page.model";

export const HOME: Page = {href: "", title: "Home"};

@Injectable({
  providedIn: "root"
})

export class PageService {

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

  }
