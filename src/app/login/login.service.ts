import { Injectable } from "@angular/core";
import { NGXLogger } from "ngx-logger";

@Injectable({
  providedIn: "root"
})

export class LoginService {

  constructor(private logger: NGXLogger) {
    logger.info(this, "constructed");
  }

  memberLoggedIn() {
    return false;
  }
}
