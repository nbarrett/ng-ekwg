import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Observer } from "rxjs";
import { filter, share } from "rxjs/operators";
import { NamedEvent } from "../models/broadcast.model";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class BroadcastService {
  observable: Observable<NamedEvent>;
  observer: Observer<NamedEvent>;
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(BroadcastService, NgxLoggerLevel.OFF);
    const temp = new Observable(((observer: Observer<NamedEvent>) => {
      this.observer = observer;
    }));
    this.observable = temp.pipe(share());
  }

  broadcast(event: NamedEvent | string): void {
    if (this.observer) {
      this.logger.debug("broadcast:", event);
      if (event instanceof NamedEvent) {
        this.observer.next(event);
      } else {
        this.observer.next(new NamedEvent(event));
      }
    }
  }

  on(eventName, callback) {
    this.observable.pipe(
      filter((event: NamedEvent) => {
        const found = event.name === eventName;
        if (found) {
          this.logger.debug("filtering for event", event, eventName, "found:", found);
        }
        return found;
      })
    ).subscribe(callback);
  }
}


