import { EventEmitter, Injectable } from "@angular/core";
import { NGXLogger } from "ngx-logger";
import { CookieService } from "ngx-cookie-service";

@Injectable({
  providedIn: "root"
})

export class SiteEditService {
  public events: EventEmitter<GlobalEvent>;

  constructor(private logger: NGXLogger, private cookieService: CookieService) {
  }

  active() {
    const active = Boolean(this.cookieService.get("editSite"));
    this.logger.info("active:", active);
    return active;
  }

  toggle() {
    const priorState = this.active();
    const newState = !priorState;
    this.logger.info("toggle:priorState", priorState, "newState", newState);
    this.cookieService.set("editSite", String(newState));
    this.events.emit(new GlobalEvent("editSite", newState));
  }

}

export class GlobalEvent {
  constructor(public key: string, public data: any) {
  }
}
