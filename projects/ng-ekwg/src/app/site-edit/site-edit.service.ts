import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { NamedEvent, NamedEventType } from "../models/broadcast.model";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";

@Injectable({
  providedIn: "root"
})

export class SiteEditService {
  private subject: Subject<NamedEvent<boolean>>;
  private logger: Logger;
  public events: Observable<NamedEvent<boolean>>;

  constructor(private loggerFactory: LoggerFactory) {
    this.subject = new Subject();
    this.events = this.subject.asObservable();
    this.logger = loggerFactory.createLogger(SiteEditService, NgxLoggerLevel.OFF);
  }

  active() {
    const editSite = localStorage.getItem("editSite");
    const active = editSite === "true";
    this.logger.debug("editSite", editSite, "active:", active);
    return active;
  }

  toggle(state: boolean) {
    const priorState = this.active();
    const newState = JSON.stringify(state);
    localStorage.setItem("editSite", newState);
    this.subject.next(NamedEvent.withData(NamedEventType.EDIT_SITE, state));
    this.logger.debug("toggle:priorState", priorState, "newState", newState);
  }

}

