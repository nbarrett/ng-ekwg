import { Component, OnInit } from "@angular/core";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { SiteEditComponent } from "../site-edit/site-edit.component";
import { NgxLoggerLevel } from "ngx-logger";
import { ActivatedRoute, ParamMap } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
  private logger: Logger;

  constructor(public route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginComponent, NgxLoggerLevel.INFO);
    this.logger.info("constructed");
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.logger.info("route paramMap is", paramMap);
    });
  }

}
