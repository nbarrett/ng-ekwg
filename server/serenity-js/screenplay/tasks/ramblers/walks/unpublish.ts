import { Ensure, equals, isTrue } from "@serenity-js/assertions";
import { Task } from "@serenity-js/core";
import { Accept, Click, ModalDialog, Wait } from "@serenity-js/protractor";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { WaitFor } from "../common/waitFor";

export class Unpublish {

  static selectedWalks(): Task {
    return Task.where("#actor unpublishes selected walks",
      Click.on(WalksTargets.unPublishSelected),
      Ensure.that(ModalDialog.hasPoppedUp(), isTrue()),
      Accept.the(ModalDialog.window()),
      WaitFor.noSelectedWalksToHaveStatus("Published"));
  }
}
