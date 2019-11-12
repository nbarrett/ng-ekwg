import { Interaction } from "@serenity-js/core/lib/screenplay";
import { InteractWithAlerts } from "./InteractWithAlerts";

export class Dismiss {
  static alert = () => Interaction.where(`#actor dismisses the alert popup`,
    actor => InteractWithAlerts.as(actor).dismissAlert(),
  )
}
