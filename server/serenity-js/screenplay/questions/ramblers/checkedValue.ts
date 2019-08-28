import { Question, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { BrowseTheWeb, Target } from "serenity-js/lib/serenity-protractor";

export class CheckedValue implements Question<PromiseLike<boolean>> {
    static of = (target: Target) => new CheckedValue(target);

    answeredBy(actor: UsesAbilities): PromiseLike<boolean> {
        return BrowseTheWeb.as(actor).locate(this.target).isSelected();
    }

    constructor(private target: Target) {
    }

    toString = () => `the checked value of ${ this.target }`;
}
