import { Injectable } from "@angular/core";


@Injectable({
  providedIn: "root"
})

export class PageService {

  constructor() {
  }

  pages = () => [
    {href: "", title: "Home"},
    {href: "walks", title: "Walks"},
    {href: "social", title: "Social"},
    {href: "join-us", title: "Join Us"},
    {href: "contact-us", title: "Contact Us"},
    {href: "committee", title: "Committee"},
    {href: "admin", title: "Admin"},
    {href: "how-to", title: "How-to"}];

  pageForArea(area: string) {
    return this.pages().find(page => page.href === area);
  }

}
