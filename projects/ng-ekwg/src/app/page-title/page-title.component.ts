import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import last from "lodash-es/last";
import { Organisation } from "../models/system.model";
import { PageService } from "../services/page.service";
import { StringUtilsService } from "../services/string-utils.service";
import { SystemConfigService } from "../services/system/system-config.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-page-title",
  templateUrl: "./page-title.component.html",
  styleUrls: ["./page-title.component.sass"]

})
export class PageTitleComponent implements OnInit {
  private relativePath: string;
  private group: Organisation;

  constructor(
    private urlService: UrlService,
    private stringUtils: StringUtilsService,
    private pageService: PageService,
    private systemConfigService: SystemConfigService,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.relativePath = paramMap.get("relativePath");
    });
    this.systemConfigService.events().subscribe(item => this.group = item.system.group);
  }

  title() {
    const pages = this.pageService.pagesFor(this.urlService.area(), this.relativePath);
    const areaTitle = last(pages)?.title;
    const subTitle = this.stringUtils.asTitle(last(this.urlService.relativeUrlAsPathSegments()));
    return areaTitle === subTitle ? `${this?.group?.shortName} - ${areaTitle}` : `${this?.group?.shortName} - ${areaTitle} - ${subTitle}`;
  }

}
