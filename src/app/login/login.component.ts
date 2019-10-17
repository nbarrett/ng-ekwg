import { Component, Inject, OnInit } from "@angular/core";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { ActivatedRoute, ParamMap } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "../shared/non-rendering.component.html"
})
export class LoginComponent implements OnInit {
  private logger: Logger;

  constructor(@Inject("AuthenticationModalsService") private AuthenticationModalsService,
              public route: ActivatedRoute, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginComponent, NgxLoggerLevel.OFF);
    this.logger.debug("constructed");
  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.AuthenticationModalsService.showLoginDialog();
    });
  }

}
