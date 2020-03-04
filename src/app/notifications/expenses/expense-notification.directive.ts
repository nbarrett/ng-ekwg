import { Directive, Type, ViewContainerRef } from "@angular/core";
import { ExpenseClaim } from "../../models/expense.model";
import { WalkNotification } from "../../models/walk-notification.model";
import { WalkNotificationDetailsComponent } from "./templates/common/walk-notification-details.component";

@Directive({
  selector: "[app-expense-notification-template]",
})
export class ExpenseNotificationDirective {
  constructor(public viewContainerRef: ViewContainerRef) {
  }
}

export class ComponentAndData {
  constructor(public component: Type<WalkNotificationDetailsComponent>, public data: ExpenseClaim) {
  }
}

