import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { PageService } from "../services/page.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-navigate",
  templateUrl: "./non-rendering.component.html"
})

export class NonRenderingComponent implements OnInit {
  private logger: Logger;

  constructor(private route: ActivatedRoute, private router: Router, private urlService: UrlService,
              private pageService: PageService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NonRenderingComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("created for route.snapshot.url:", this.route.snapshot.url.map(segment => segment.toString()),
      "area:", this.urlService.area());
  }
}
