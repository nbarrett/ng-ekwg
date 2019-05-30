import { Question, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { BrowseTheWeb, Target  } from 'serenity-js/lib/serenity-protractor';

export class Presence implements Question<PromiseLike<boolean>> {

    public static of(target: Target): Presence {
        return new Presence(target);
    }

    answeredBy(actor: UsesAbilities): PromiseLike<boolean> {
        return BrowseTheWeb.as(actor).locate(this.target).isPresent();
    }

    constructor(private target: Target) {
    }
}
