import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Observer } from "rxjs";
import { filter, share } from "rxjs/operators";
import { Logger, LoggerFactory } from "./logger-factory.service";

export enum NamedEventType {
  EDIT_STATE = "editSite",
  MARKDOWN_CONTENT_CHANGED = "markdownContentChanged",
  MARKDOWN_CONTENT_DELETED = "markdownContentDeleted",
  MARKDOWN_CONTENT_SAVED = "markdownContentSaved",
  MEETUP_DEFAULT_CONTENT_CHANGED = "meetupContentChanged",
  MEMBER_LOGIN_COMPLETE = "memberLoginComplete",
  WALK_SAVED = "walkSaved",
  WALK_SLOTS_CREATED = "walkSlotsCreated"
}

export class NamedEvent {
  static named(name: any): NamedEvent {
    return new NamedEvent(name);
  }

  constructor(public name: any, public data?: any) {
  }

  static withData(key: NamedEventType, value: any) {
    return new NamedEvent(key, value);
  }
}

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
      this.logger.debug("broadcast:", event, "observer", this.observer);
      if (event instanceof NamedEvent) {
        this.observer.next(event);
      } else {
        this.observer.next(new NamedEvent(event));
      }
    }
  }

  on(eventName, callback) {
    this.observable.pipe(
      filter((event: NamedEvent) => event.name === eventName)
    ).subscribe(callback);
  }
}


