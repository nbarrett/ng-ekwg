import { Check } from "@serenity-js/assertions";
import { PerformsActivities, Task } from "@serenity-js/core";
import { isVisible } from "@serenity-js/protractor";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { Log } from "../../common/log";
import { RequestParameterExtractor } from "../common/requestParameterExtractor";
import { Delete } from "./deleteSelectedWalks";
import { SelectWalks } from "./selectWalks";
import { Unpublish } from "./unpublish";

export class DeleteWalks {

  static all(): Task {
    return new DeleteAllWalks();
  }

  static requested(): Task {
    return new DeleteUnpublishedOrWalksWithIds(RequestParameterExtractor.extract().walkDeletions);
  }

  static withIds(...walkIds: string[]) {
    return new DeleteUnpublishedOrWalksWithIds(walkIds);
  }

}

export class DeleteAllWalks implements Task {

  performAs(actor: PerformsActivities): Promise<void> {
    return actor.attemptsTo(
      Check.whether(WalksTargets.selectAll, isVisible())
        .andIfSo(SelectWalks.all(),
          Unpublish.selectedWalks(),
          Delete.selectedWalks())
        .otherwise(Log.message("there are no walks to unpublish or delete")));
  }

  toString() {
    return "#actor deletes all walks";
  }

}

export class DeleteUnpublishedOrWalksWithIds implements Task {

  private suffix: string;

  constructor(private walkIds: string[]) {
    this.suffix = walkIds.length > 0 ? `and those with ids ${this.walkIds}` : ``;
  }

  performAs(actor: PerformsActivities): Promise<void> {
    return actor.attemptsTo(
      Check.whether(WalksTargets.walkListviewTable, isVisible())
        .andIfSo(SelectWalks.notPublishedOrWithIds(this.walkIds),
          Unpublish.selectedWalks(),
          Delete.selectedWalks())
        .otherwise(Log.message(`it's not possible to delete walks ${this.walkIds}`)));
  }

  toString() {
    return `#actor deletes unpublished walks ${this.suffix}`;
  }

}
