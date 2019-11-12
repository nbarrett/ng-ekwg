import { equals } from "@serenity-js/assertions";
import { Task } from "@serenity-js/core";
import { Click, Wait } from "@serenity-js/protractor";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { Accept } from "../../replace-with-serenty-js-when-released/Accept";
import { Alert } from "../../replace-with-serenty-js-when-released/Alert";
import { WaitFor } from "../common/waitFor";

export class Unpublish {

  static selectedWalks(): Task {
    return Task.where("#actor unpublishes selected walks",
      Click.on(WalksTargets.unPublishSelected),
      Wait.until(Alert.visibility(), equals(true)),
      Accept.alert(),
      WaitFor.noSelectedWalksToHaveStatus("Published"));
  }
}
