import { step } from "@serenity-js/core/lib/recording";
import { PerformsTasks, Task } from "serenity-js/lib/screenplay";
import { Click } from "serenity-js/lib/serenity-protractor";
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

  @step("{0} publishes selected walks")
  performAs(actor: PerformsTasks): PromiseLike<void> {
    return actor.attemptsTo(
      Click.on(WalksTargets.publishSelected),
      WaitFor.selectedWalksToReachStatus("Published"));
  }
}

export class PublishWalksAwaitingApproval implements Task {

  @step("{0} publishes walks awaiting approval")
  performAs(actor: PerformsTasks): PromiseLike<void> {
    return actor.attemptsTo(
      SelectWalks.withStatus("Awaiting approval"),
      Publish.selectedWalks());
  }
}
