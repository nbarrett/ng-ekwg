import { AnswersQuestions, PerformsActivities, Task, UsesAbilities } from "@serenity-js/core";
import { RamblersWalkSummaries } from "../../../questions/ramblers/ramblersWalksFound";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { ClickWhenReady } from "../../common/clickWhenReady";
import { WaitFor } from "../common/waitFor";

export class Delete implements Task {

  static selectedWalks(): Task {
    return new Delete();
  }

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<void> {
    let totalWalkCount;
    let selectedWalkCount;
    return RamblersWalkSummaries.displayed().answeredBy(actor)
      .then(walks => {
        totalWalkCount = walks.length;
        return walks.filter(walk => walk.currentlySelected);
      }).then(walks => {
        selectedWalkCount = walks.length;
        return actor.attemptsTo(
          ClickWhenReady.on(WalksTargets.deleteSelected),
          ClickWhenReady.on(WalksTargets.executeActionButton),
          WaitFor.successAlertToContainMessage("been deleted"));
      });

  }
}
