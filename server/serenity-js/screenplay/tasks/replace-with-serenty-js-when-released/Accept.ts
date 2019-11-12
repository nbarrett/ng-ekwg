import { Interaction } from "@serenity-js/core";
import { InteractWithAlerts } from "./InteractWithAlerts";

export class Accept {
  static alert = () => Interaction.where(`#actor accepts the alert popup`,
    actor => InteractWithAlerts.as(actor).acceptAlert())
}
