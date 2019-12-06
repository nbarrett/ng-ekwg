import { Task } from "serenity-js/lib/screenplay";
import { Duration, Is, Wait } from "serenity-js/lib/serenity-protractor";
import { ErrorOrWalksHaveCount } from "../../../questions/ramblers/errorOrWalksHaveCount";
import { SelectedWalksHaveCount } from "../../../questions/ramblers/selectedWalksHaveCount";
import { SelectedWalksWithStatus } from "../../../questions/ramblers/selectedWalksHaveStatus";
import { WalksWithStatus } from "../../../questions/ramblers/walksHaveStatus";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { WaitForQuestion } from "./waitForQuestion";

const TIMEOUT_IN_SECONDS = 60;

export class WaitFor {

  static ramblersToFinishProcessing(): Task {
    return Task.where(`#actor starts waits for processing to complete`,
      Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(WalksTargets.progressIndicator, Is.invisible())),
      Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(WalksTargets.loaderIndicator, Is.invisible());
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
