import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Observer } from "rxjs";
import { filter, share } from "rxjs/operators";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class BroadcastService {
  observable: Observable<GlobalEvent>;
  observer: Observer<GlobalEvent>;
  private logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(BroadcastService, NgxLoggerLevel.INFO);
    const temp = Observable.create((observer: Observer<GlobalEvent>) => {
      this.observer = observer;
    });
    this.observable = temp.pipe(share());
  }

  broadcast(event: GlobalEvent | string): void {
    if (this.observer) {
      this.logger.debug("broadcast:", event, "observer", this.observer);
      if (event instanceof GlobalEvent) {
        this.observer.next(event);
      } else {
        this.observer.next(new GlobalEvent(event));
      }
    } else {
      this.logger.warn("broadcast:", event, "occurred before observer created");
    }
  }

  on(eventName, callback) {
    this.observable.pipe(
      filter((event: GlobalEvent) => event.key === eventName)
    ).subscribe(callback);
  }
}

export class GlobalEvent {
  constructor(public key: string, public data?: any) {
  }

  static named(key: any): GlobalEvent {
    return new GlobalEvent(key);
  }

}
