import { step } from "@serenity-js/core/lib/recording";
import { PerformsTasks, Task } from "serenity-js/lib/screenplay";
import { Duration, Is, Wait } from "serenity-js/lib/serenity-protractor";
import { ErrorOrWalksHaveCount } from "../../../questions/ramblers/errorOrWalksHaveCount";
import { SelectedWalksHaveCount } from "../../../questions/ramblers/selectedWalksHaveCount";
import { SelectedWalksWithStatus } from "../../../questions/ramblers/selectedWalksHaveStatus";
import { WalksWithStatus } from "../../../questions/ramblers/walksHaveStatus";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { WaitForQuestion } from "./waitForQuestion";

const TIMEOUT_IN_SECONDS = 60;

export class WaitFor {

    static ramblersToFinishProcessing() {
        return new RamblersToFinishProcessing();
    }

    static selectedWalksToReachStatus(status: string) {
        return WaitForQuestion.toBeAnsweredTrue(WalksWithStatus.matching(status), Duration.ofSeconds(TIMEOUT_IN_SECONDS));
    }

    static noSelectedWalksToHaveStatus(status: string) {
        return WaitForQuestion.toBeAnsweredTrue(SelectedWalksWithStatus.notMatching(status), Duration.ofSeconds(TIMEOUT_IN_SECONDS));
    }

    static errorOrCountOfWalksToBe(walkCount: number) {
        return WaitForQuestion.toBeAnsweredTrue(ErrorOrWalksHaveCount.matching(walkCount), Duration.ofSeconds(TIMEOUT_IN_SECONDS));
    }

    static countOfSelectedWalksToBe(walkCount: number) {
        return WaitForQuestion.toBeAnsweredTrue(SelectedWalksHaveCount.matching(walkCount), Duration.ofSeconds(TIMEOUT_IN_SECONDS));
    }
}
export class RamblersToFinishProcessing implements Task {

    @step("{0} waits for progress indicator to disappear")
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(WalksTargets.progressIndicator, Is.invisible()));
    }
}
