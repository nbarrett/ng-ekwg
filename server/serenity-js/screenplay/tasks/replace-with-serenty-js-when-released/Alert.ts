import { Question } from "@serenity-js/core";
import { InteractWithAlerts } from "./InteractWithAlerts";

export class Alert {
  static visibility(): Question<boolean> {
    return Question.about(`the visibility of an alert`, actor => {
        try {
          InteractWithAlerts.as(actor).switchToAlert();
          return true;
        } catch (e) {
          return false;
        }
      },
    );
  }

}
