import { Component, Inject, OnInit } from "@angular/core";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";

@Component({
  selector: "app-forgot-password",
  templateUrl: "../shared/non-rendering.component.html"
})

export class ForgotPasswordComponent implements OnInit {
  private logger: Logger;

  constructor(@Inject("AuthenticationModalsService") private authenticationModalsService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ForgotPasswordComponent, NgxLoggerLevel.INFO);
    this.logger.info("constructed");
  }

  ngOnInit() {
    this.authenticationModalsService.showForgotPasswordModal();
  }

}
