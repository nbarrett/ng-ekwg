import { Injectable } from "@angular/core";
import { last } from "lodash-es";
import { Page } from "../models/page.model";
import { StringUtilsService } from "./string-utils.service";
import { UrlService } from "./url.service";

export const HOME: Page = {href: "", title: "Home"};

@Injectable({
  providedIn: "root"
})

export class PageService {

  constructor(private stringUtils: StringUtilsService,
              private urlService: UrlService) {
  }

  public pages: Page[] = [
    HOME,
    {href: "walks", title: "Walks"},
    {href: "social", title: "Social"},
    {href: "join-us", title: "Join Us"},
    {href: "contact-us", title: "Contact Us"},
    {href: "committee", title: "Committee"},
    {href: "admin", title: "Admin"},
    {href: "how-to", title: "How-to"}];

  pageForArea(area: string): Page {
    area = area.replace("/", "");
    return this.pages.find(page => page.href === area) || HOME;
  }

  pagesFor(area: string, relativePath: string): Page[] {
    return this.basePagesForArea(area).concat(this.relativePages(area, this.urlService.toPathSegments(relativePath)));
  }

  private basePagesForArea(area: string): Page[] {
    return this.pages
      .filter(page => page === HOME || page.title.toLowerCase() === area.toLowerCase());
  }

  private relativePages(area: string, pathSegments: string[]): Page[] {
    return pathSegments
      .filter(item => item !== last(pathSegments))
      .map((path, index) => ({title: this.stringUtils.asTitle(path), href: this.pathSegmentsUpTo(area, pathSegments, index)}));
  }

  private pathSegmentsUpTo(area: string, pathSegments: string[], upToIndex: number): string {
    return `${area}/${pathSegments.filter((item, index) => index <= upToIndex).join("/")}`;
  }

}
