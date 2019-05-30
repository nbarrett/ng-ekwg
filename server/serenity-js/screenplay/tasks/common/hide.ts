import { step } from '@serenity-js/core/lib/recording';
import { PerformsTasks, Task, UsesAbilities } from 'serenity-js/lib/screenplay';
import { BrowseTheWeb, Target } from 'serenity-js/lib/serenity-protractor';

export class Hide implements Task {

    static target(target: Target): Task {
        return new Hide(target);
    }

    constructor(private target: Target) {
    }

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        let browseTheWeb = BrowseTheWeb.as(actor);
        let element = browseTheWeb.locate(this.target);
        return element.isPresent().then(present => present && browseTheWeb.executeScript("arguments[0].style.visibility='hidden'", element));
    }
}
