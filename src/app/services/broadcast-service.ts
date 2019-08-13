import { Observable, Observer } from "rxjs";
import { filter, share } from "rxjs/operators";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { Injectable } from "@angular/core";

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

  broadcast(event: GlobalEvent | string) {
    this.logger.info("broadcast:", event);
    if (event instanceof GlobalEvent) {
      this.observer.next(event);
    } else {
      this.observer.next(new GlobalEvent(event));
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
}
