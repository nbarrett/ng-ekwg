import { equals, not } from "@serenity-js/assertions";
import { Duration, Task } from "@serenity-js/core";
import { isVisible, Wait } from "@serenity-js/protractor";
import { SelectedWalksHaveCount } from "../../../questions/ramblers/selectedWalksHaveCount";
import { SelectedWalksWithStatus } from "../../../questions/ramblers/selectedWalksHaveStatus";
import { WalksHaveCountOrErrorDisplayed } from "../../../questions/ramblers/walksHaveCountOrErrorDisplayed";
import { WalksWithStatus } from "../../../questions/ramblers/walksHaveStatus";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";

const TIMEOUT_IN_SECONDS = 60;

export class WaitFor {

  static ramblersToFinishProcessing() {
    return Task.where(`#actor waits for processing to complete`,
      Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(WalksTargets.progressIndicator, not(isVisible())),
      Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(WalksTargets.loaderIndicator, not(isVisible())));
  }

  static selectedWalksToReachStatus(...statuses: string[]) {
    return Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(WalksWithStatus.matching(...statuses), equals(true));
  }

  static noSelectedWalksToHaveStatus(...statuses: string[]) {
    return Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(SelectedWalksWithStatus.notMatching(...statuses), equals(true));
  }

  static errorOrCountOfWalksToBe(walkCount: number) {
    return Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(WalksHaveCountOrErrorDisplayed.matching(walkCount), equals(true));
  }

  static countOfSelectedWalksToBe(walkCount: number) {
    return Wait.upTo(Duration.ofSeconds(TIMEOUT_IN_SECONDS)).until(SelectedWalksHaveCount.matching(walkCount), equals(true));
  }
}
