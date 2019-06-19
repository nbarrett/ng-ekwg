import { Component } from "@angular/core";
import { NGXLogger } from "ngx-logger";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.component.html"
})
export class LogoutComponent {

  constructor(private logger: NGXLogger) {
    logger.debug(LogoutComponent.name, "constructed");
  }

}
