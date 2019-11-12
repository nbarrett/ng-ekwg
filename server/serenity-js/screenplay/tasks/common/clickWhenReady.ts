import { Duration } from "@serenity-js/core";
import { PerformsActivities, Question, Task } from "@serenity-js/core/lib/screenplay";
import { Click, isVisible, Wait } from "@serenity-js/protractor";
import { ElementFinder } from "protractor";
import { WalksTargets } from "../../ui/ramblers/walksTargets";
import { WaitFor } from "../ramblers/common/waitFor";
import { Hide } from "./hide";

export class ClickWhenReady implements Task {

  static on(target: Question<ElementFinder> | ElementFinder) {
    return new ClickWhenReady(target);
  }

  constructor(private target: Question<ElementFinder> | ElementFinder) {
  }

  performAs(actor: PerformsActivities): Promise<void> {
    return actor.attemptsTo(
      WaitFor.ramblersToFinishProcessing(),
      Hide.target(WalksTargets.chatWindow),
      Wait.upTo(Duration.ofSeconds(10)).until(this.target, isVisible()),
      Click.on(this.target));
  }

  toString() {
    return `#actor clicks on ${this.target} when ready`;
  }
}
