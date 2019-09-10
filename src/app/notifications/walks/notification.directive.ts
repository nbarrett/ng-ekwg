import { Directive, Type, ViewContainerRef } from "@angular/core";
import { WalkNotification } from "../../models/walk-notification.model";
import { WalkNotificationDetailsComponent } from "./templates/common/walk-notification-details.component";

@Directive({
  selector: "[app-notification-template]",
})
export class NotificationDirective {
  constructor(public viewContainerRef: ViewContainerRef) {
  }
}

export class ComponentAndData {
  constructor(public component: Type<WalkNotificationDetailsComponent>, public data: WalkNotification) {
  }
}

