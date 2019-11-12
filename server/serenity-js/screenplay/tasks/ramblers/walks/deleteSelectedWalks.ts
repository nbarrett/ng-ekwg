import { equals } from "@serenity-js/assertions";
import { AnswersQuestions, PerformsActivities, Task, UsesAbilities } from "@serenity-js/core";
import { Click, Wait } from "@serenity-js/protractor";
import { RamblersWalkSummaries } from "../../../questions/ramblers/ramblersWalksFound";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { Accept } from "../../replace-with-serenty-js-when-released/Accept";
import { Alert } from "../../replace-with-serenty-js-when-released/Alert";
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
          Click.on(WalksTargets.deleteSelected),
          Wait.until(Alert.visibility(), equals(true)),
          Accept.alert(),
          WaitFor.errorOrCountOfWalksToBe(totalWalkCount - selectedWalkCount));
      });

  }
}
