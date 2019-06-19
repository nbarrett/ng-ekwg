import { Component } from "@angular/core";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html"
})
export class LoginComponent {
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LoginComponent);
    this.logger.debug(LoginComponent.name, "constructed");
  }

}
