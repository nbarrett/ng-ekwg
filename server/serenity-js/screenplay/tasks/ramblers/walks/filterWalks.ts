import { step } from "@serenity-js/core/lib/recording";
import { PerformsTasks, Task } from "serenity-js/lib/screenplay";
import { Presence } from "../../../questions/ramblers/visibility";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { ClickWhenReady } from "../../common/clickWhenReady";
import { Check } from "../../common/conditional";
import { Hide } from "../../common/hide";
import { Log } from "../../common/log";
import { WaitFor } from "../common/waitFor";

export class FilterWalks {

  static toShowAll() {
    return new FilterWalksToShowAll();
  }

}

export class FilterWalksToShowAll implements Task {

  @step("{0} filters walks to show all")
  performAs(actor: PerformsTasks): PromiseLike<void> {
    return actor.attemptsTo(
      Check.whetherPromiseTrue(Presence.of(WalksTargets.clearAll))
        .andIfSo(
          Hide.target(WalksTargets.chatWindow),
          ClickWhenReady.on(WalksTargets.itemsPerPagePopup),
          ClickWhenReady.on(WalksTargets.showAllWalks),
          WaitFor.ramblersToFinishProcessing())
        .otherwise(Log.message("No filtering required as no walks shown")));
  };

}
