import { PerformsActivities, Task } from "@serenity-js/core";
import { Click} from "@serenity-js/protractor";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { WaitFor } from "../common/waitFor";
import { SelectWalks } from "./selectWalks";

export class Publish {

  static selectedWalks() {
    return new PublishSelectedWalks();
  }

  static walksAwaitingApproval() {
    return new PublishWalksAwaitingApproval();
  }

}

export class PublishSelectedWalks implements Task {

  performAs(actor: PerformsActivities): Promise<void> {
    return actor.attemptsTo(
      Click.on(WalksTargets.publishSelected),
      WaitFor.selectedWalksToReachStatus("Published", "Cancelled"));
  }
  toString() {
    return "#actor publishes selected walks";
  }
}

export class PublishWalksAwaitingApproval implements Task {

  performAs(actor: PerformsActivities): Promise<void> {
    return actor.attemptsTo(
      SelectWalks.withStatus("Awaiting approval"),
      Publish.selectedWalks());
  }

  toString() {
    return "#actor publishes walks awaiting approval";
  }
}
