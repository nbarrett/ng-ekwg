import { Component, OnInit } from "@angular/core";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-navigate",
  templateUrl: "./non-rendering.component.html"
})

export class NonRenderingComponent implements OnInit {
  private logger: Logger;

  constructor(private route: ActivatedRoute, private router: Router, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(NonRenderingComponent, NgxLoggerLevel.INFO);
  }

  ngOnInit(): void {
    this.logger.info("created for path", this.route.snapshot.url.join(""));
  }
}
