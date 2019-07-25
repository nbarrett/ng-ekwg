import { Observable, Observer } from "rxjs";
import { filter } from "rxjs/operators";

export class BroadcasterService {
  observable: Observable<GlobalEvent>;
  observer: Observer<GlobalEvent>;

  constructor() {
    this.observable = Observable.create((observer: Observer<GlobalEvent>) => {
      this.observer = observer;
    }).share();
  }

  broadcast(event: GlobalEvent | string) {
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
