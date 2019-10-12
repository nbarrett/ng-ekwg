import { step } from "@serenity-js/core/lib/recording";
import { PerformsTasks, Task } from "serenity-js/lib/screenplay";
import { Presence } from "../../../questions/ramblers/visibility";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { Check} from "../../common/conditional";
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

    static withIds(...walkIds: number[]) {
        return new DeleteUnpublishedOrWalksWithIds(walkIds);
    }

}

export class DeleteAllWalks implements Task {

    @step("{0} deletes all walks")
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Check.whetherPromiseTrue(Presence.of(WalksTargets.selectAll))
                .andIfSo(SelectWalks.all(),
                    Unpublish.selectedWalks(),
                    Delete.selectedWalks())
                .otherwise(Log.message("there are no walks to unpublish or delete")));
    };

}

export class DeleteUnpublishedOrWalksWithIds implements Task {

    private suffix: string;

    constructor(private walkIds: number[]) {
        this.suffix = walkIds.length > 0 ? `and those with ids ${this.walkIds}` : ``;
    };

    @step("{0} deletes unpublished walks #suffix")
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Check.whetherPromiseTrue(Presence.of(WalksTargets.clearAll))
                .andIfSo(SelectWalks.notPublishedOrWithIds(this.walkIds),
                    Unpublish.selectedWalks(),
                    Delete.selectedWalks())
                .otherwise(Log.message(`it's not possible to delete walks ${this.walkIds}`)));
    };

}
