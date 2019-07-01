import { Component, OnInit } from "@angular/core";
import { downgradeComponent, downgradeInjectable, getAngularJSGlobal, UpgradeModule } from "@angular/upgrade/static";
import { SiteEditService } from "./site-edit/site-edit.service";
import { DateUtilsService } from "./services/date-utils.service";
import { ActivatedRoute } from "@angular/router";
import { Logger, LoggerFactory } from "./services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { UrlService } from "./services/url.service";
import { PageService } from "./services/page.service";
import { MarkdownEditorComponent } from "./markdown-editor/markdown-editor.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})

export class AppComponent implements OnInit {
  private logger: Logger;

  constructor(private upgrade: UpgradeModule,
              private route: ActivatedRoute, loggerFactory: LoggerFactory,
              private urlService: UrlService,
              private pageService: PageService) {
    this.logger = loggerFactory.createLogger(AppComponent, NgxLoggerLevel.INFO);

  }

  ngOnInit() {
    const legacy = getAngularJSGlobal().module("ekwgApp")
      .directive("markdownEditor", downgradeComponent({component: MarkdownEditorComponent}))
      .factory("SiteEditService", downgradeInjectable(SiteEditService))
      .factory("DateUtils", downgradeInjectable(DateUtilsService));
    this.upgrade.bootstrap(document.body, [legacy.name], {strictDi: true});
    this.isLegacyRoute();
  }

  isLegacyRoute() {
    const route = this.route.snapshot.url.join("");
    const isLegacy = !this.pageService.pageForArea(this.urlService.area()).upgraded;
    this.logger.info("area", this.urlService.area(), "isLegacy", isLegacy);
    return isLegacy;
  }

}
