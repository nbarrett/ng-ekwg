import { AnswersQuestions, PerformsActivities, Task, UsesAbilities } from "@serenity-js/core";
import { Click } from "@serenity-js/protractor";
import { RamblersWalkSummaries, RamblersWalkSummary } from "../../../questions/ramblers/ramblersWalksFound";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { SelectCheckbox } from "../../common/selectCheckbox";
import { WaitFor } from "../common/waitFor";

export const WalkFilters = {
  withStatus: (walk: RamblersWalkSummary, ...statuses: string[]) => statuses.includes(walk.status),
  withIds: (walk: RamblersWalkSummary, ...walkIds: number[]) => walkIds.includes(walk.walkId),
  currentlySelected: (walk: RamblersWalkSummary) => walk.currentlySelected,
};

export class SelectWalks {

  static notPublishedOrWithIds(walkIds: number[]) {
    return new SelectWalksNotPublishedCancelledOrWithIds(walkIds);
  }

  static withIds(...walkIds: number[]) {
    return new SelectWalksWithIds(walkIds);
  }

  static withStatus(...statuses: string[]) {
    return new SelectWalksWithStatus(statuses);
  }

  static all() {
    return new SelectAllWalks();
  }

  static none() {
    return new DeselectAllWalks();
  }
}

export class SelectAllWalks implements Task {

  performAs(actor: PerformsActivities): Promise<void> {
    return actor.attemptsTo(
      Click.on(WalksTargets.selectAll),
      WaitFor.ramblersToFinishProcessing());
  }

  toString() {
    return "#actor selects all walks";
  }

}

export class DeselectAllWalks implements Task {

  performAs(actor: PerformsActivities): Promise<void> {
    return actor.attemptsTo(
      Click.on(WalksTargets.clearAll),
      WaitFor.countOfSelectedWalksToBe(0));
  }

  toString() {
    return "#actor deselects all walks";
  }

}

export class SelectWalksWithStatus implements Task {

  constructor(private statuses: string[]) {
  }

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<any> {
    console.log(`selecting walks of status "${this.statuses}"`);
    return RamblersWalkSummaries.displayed().answeredBy(actor)
      .then(walks => actor.attemptsTo(
        SelectWalks.none(),
        ...walks
          .filter(walk => WalkFilters.withStatus(walk, ...this.statuses))
          .map(walk => SelectCheckbox.checked().from(walk.checkboxTarget)),
        WaitFor.ramblersToFinishProcessing()));
  }

  toString() {
    return `#actor selects walks with status ${this.statuses}`;
  }

}

export class SelectWalksNotPublishedCancelledOrWithIds implements Task {

  constructor(private walkIds: number[]) {
  }

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<any> {
    return RamblersWalkSummaries.displayed().answeredBy(actor)
      .then(walks => actor.attemptsTo(
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

export class SelectWalksWithIds implements Task {

  constructor(private walkIds: number[]) {
  }

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<any> {
    return RamblersWalkSummaries.displayed().answeredBy(actor)
      .then(walks => actor.attemptsTo(
        SelectWalks.none(),
        ...walks
          .filter(walk => WalkFilters.withIds(walk, ...this.walkIds))
          .map(walk => SelectCheckbox.checked().from(walk.checkboxTarget)),
        WaitFor.ramblersToFinishProcessing()));
  }

  toString() {
    return `#actor selects walks with ids: ${this.walkIds}`;
  }

}
