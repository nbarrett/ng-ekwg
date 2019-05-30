import { step } from '@serenity-js/core/lib/recording';
import { Activity, Interaction, PerformsTasks, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { by, ElementFinder, protractor } from 'protractor';
import { BrowseTheWeb, Click, Target } from 'serenity-js/lib/serenity-protractor';
import { CheckedValue } from '../../questions/ramblers/checkedValue';

export class SelectCheckbox {
    static checkedValue(value: boolean) {
        return {from: (target: Target): Activity => new SelectCheckboxValue(value, target)};
    }

    static checked() {
        return {from: (target: Target): Activity => new SelectCheckboxValue(true, target)};
    }

    static unchecked() {
        return {from: (target: Target): Activity => new SelectCheckboxValue(false, target)};
    }
}

class SelectCheckboxValue implements Activity {
    @step('{0} selects #value value from #target')
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return CheckedValue.of(this.target).answeredBy(actor).then(checked => {
            if (checked !== this.value) {
                // console.log(`checked value of ${this.target} is ${checked} -> checking`);
                return actor.attemptsTo(Click.on(this.target));
            } else {
                // console.log(`checked value of ${this.target} already ${this.value} -> no action`);
                return Promise.resolve();
            }
        }, error => {
            console.log(`${error} occurred in ${this} - retrying`);
            return actor.attemptsTo(SelectCheckbox.checkedValue(this.value).from(this.target));
        });
    }

    constructor(private value: boolean, private target: Target) {
    }

    toString = () => `#actor selects ${this.value} value from ${this.target}`;
}
