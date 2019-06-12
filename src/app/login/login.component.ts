import { Component } from "@angular/core";
import { NGXLogger } from "ngx-logger";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html"
})
export class LoginComponent {

  constructor(private logger: NGXLogger) {
    logger.info(this, "constructed");
  }

}
