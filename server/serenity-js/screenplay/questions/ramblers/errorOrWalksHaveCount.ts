import { UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { Question } from "serenity-js/lib/screenplay-protractor";
import { Text, WebElement } from "serenity-js/lib/serenity-protractor";
import { WalksTargets } from "../../ui/ramblers/walksTargets";
import { UploadError } from "./errorDisplayed";
import { RamblersWalkSummaries } from "./ramblersWalksFound";
import { WalksHaveCount } from "./walksHaveCount";

export class ErrorOrWalksHaveCount implements Question<PromiseLike<boolean>> {

    static matching = (count: number) => new ErrorOrWalksHaveCount(count);

    constructor(private count: number) {
    }

    toString = () => `error or walk listing count to be ${this.count}`;

    answeredBy(actor: UsesAbilities): PromiseLike<boolean> {
        return UploadError.displayed().answeredBy(actor).then(displayed => {
            return displayed || WalksHaveCount.matching(this.count).answeredBy(actor);
        });
    }
}
