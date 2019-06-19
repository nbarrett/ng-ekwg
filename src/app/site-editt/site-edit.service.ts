import { EventEmitter, Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class SiteEditService {
  public events: EventEmitter<GlobalEvent>;
  private logger: Logger;

  constructor(private cookieService: CookieService, private loggerFactory: LoggerFactory) {
    this.events = new EventEmitter();
    this.logger = loggerFactory.createLogger(SiteEditService);
  }

  active() {
    const editSite = this.cookieService.get("editSite");
    const active = editSite === "true";
    this.logger.debug("editSite", editSite, "active:", active);
    return active;
  }

  toggle() {
    const priorState = this.active();
    const newState = String(!priorState);
    this.events.emit(new GlobalEvent("editSite", newState));
    this.logger.info("toggle:priorState", priorState, "newState", newState);
    this.cookieService.set("editSite", newState);
  }

}

export class GlobalEvent {
  constructor(public key: string, public data: any) {
  }
}
