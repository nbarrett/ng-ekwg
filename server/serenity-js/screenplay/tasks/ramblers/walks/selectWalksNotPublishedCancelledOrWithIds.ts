import { AnswersQuestions, PerformsActivities, Task, UsesAbilities } from "@serenity-js/core";
import { RamblersWalkSummaries, RamblersWalkSummary } from "../../../questions/ramblers/ramblersWalksFound";
import { SelectCheckbox } from "../../common/selectCheckbox";
import { WaitFor } from "../common/waitFor";
import { SelectWalks, WalkFilters } from "./selectWalks";

export class SelectWalksNotPublishedCancelledOrWithIds implements Task {

  constructor(private walkIds: string[]) {
  }

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<any> {
    return RamblersWalkSummaries.displayed().answeredBy(actor)
      .then((walks: RamblersWalkSummary[]) => actor.attemptsTo(
        SelectWalks.none(),
        ...walks
          .filter(walk => (!WalkFilters.withStatus(walk, "Published", "Cancelled")) || WalkFilters.withIds(walk, ...this.walkIds))
          .map(walk => SelectCheckbox.checked().from(walk.checkboxTarget)),
        WaitFor.ramblersToFinishProcessing()));
  }

  toString() {
    return `#actor selects walks not published or with ids: ${this.walkIds}`;
  }

}
