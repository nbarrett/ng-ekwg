import { AnswersQuestions, PerformsActivities, Task, UsesAbilities } from "@serenity-js/core";
import { Click } from "@serenity-js/protractor";
import { RamblersWalkSummaries, RamblersWalkSummary } from "../../../questions/ramblers/ramblersWalksFound";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { SelectCheckbox } from "../../common/selectCheckbox";
import { WaitFor } from "../common/waitFor";

export const WalkFilters = {
  withStatus: (walk: RamblersWalkSummary, status: string) => walk.status === status,
  withIds: (walk: RamblersWalkSummary, walkIds: number[]) => walkIds.includes(walk.walkId),
  currentlySelected: (walk: RamblersWalkSummary) => walk.currentlySelected,
};

export class SelectWalks {

  static notPublishedOrWithIds(walkIds: number[]) {
    return new SelectWalksNotPublishedOrWithIds(walkIds);
  }

  static withIds(...walkIds: number[]) {
    return new SelectWalksWithIds(walkIds);
  }

  static withStatus(status: string) {
    return new SelectWalksWithStatus(status);
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

  constructor(private status: string) {
  }

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<any> {
    console.log(`selecting walks of status "${this.status}"`);
    return RamblersWalkSummaries.displayed().answeredBy(actor)
      .then(walks => actor.attemptsTo(
        SelectWalks.none(),
        ...walks
          .filter(walk => WalkFilters.withStatus(walk, this.status))
          .map(walk => SelectCheckbox.checked().from(walk.checkboxTarget)),
        WaitFor.ramblersToFinishProcessing()));
  }

  toString() {
    return `#actor selects walks with status ${this.status}`;
  }

}

export class SelectWalksNotPublishedOrWithIds implements Task {

  constructor(private walkIds: number[]) {
  }

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<any> {
    return RamblersWalkSummaries.displayed().answeredBy(actor)
      .then(walks => actor.attemptsTo(
        SelectWalks.none(),
        ...walks
          .filter(walk => !WalkFilters.withStatus(walk, "Published") || WalkFilters.withIds(walk, this.walkIds))
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
          .filter(walk => WalkFilters.withIds(walk, this.walkIds))
          .map(walk => SelectCheckbox.checked().from(walk.checkboxTarget)),
        WaitFor.ramblersToFinishProcessing()));
  }

  toString() {
    return `#actor selects walks with ids: ${this.walkIds}`;
  }

}
