import { step } from "@serenity-js/core/lib/recording";
import { PerformsTasks, Task, UsesAbilities } from "serenity-js/lib/screenplay";
import { Click, Duration, Is, Target, Wait } from "serenity-js/lib/serenity-protractor";
import { WalksTargets } from "../../ui/ramblers/walksTargets";
import { WaitFor } from "../ramblers/common/waitFor";
import { Hide } from "./hide";

export class ClickWhenReady implements Task {

    static on(target: Target) {
        return new ClickWhenReady(target);
    }

    constructor(private target: Target) {
    }

    @step("{0} clicks on #target when ready")
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return actor.attemptsTo(
            WaitFor.ramblersToFinishProcessing(),
            Hide.target(WalksTargets.chatWindow),
            Wait.upTo(Duration.ofSeconds(10)).until(this.target, Is.visible()),
            Click.on(this.target));
    }
}
