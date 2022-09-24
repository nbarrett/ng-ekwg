import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import last from "lodash-es/last";
import { PageService } from "../services/page.service";
import { StringUtilsService } from "../services/string-utils.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-page-title",
  templateUrl: "./page-title.component.html",
  styleUrls: ["./page-title.component.sass"]

})
export class PageTitleComponent implements OnInit {
  private relativePath: string;

  constructor(
    private urlService: UrlService,
    private stringUtils: StringUtilsService,
    private pageService: PageService,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.relativePath = paramMap.get("relativePath");
    });
  }

  title() {
    const pages = this.pageService.pagesFor(this.urlService.area(), this.relativePath);
    const areaTitle = last(pages)?.title;
    const subTitle = this.stringUtils.asTitle(last(this.urlService.relativeUrlAsPathSegments()));
    return areaTitle === subTitle ? `EKWG - ${areaTitle}` : `EKWG - ${areaTitle} - ${subTitle}`;
  }

}
