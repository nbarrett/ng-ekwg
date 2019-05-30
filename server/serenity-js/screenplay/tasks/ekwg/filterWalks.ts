import {Click, PerformsTasks, step, Task} from 'serenity-js/lib/screenplay-protractor';
import {Enter} from 'serenity-js/lib/screenplay-protractor';
import {WalksProgrammeTargets} from '../../ui/ekwg/walksProgrammeTargets';

export class FilterWalks implements Task {

    static toShowOnly(itemName: string) {
        return new FilterWalks(itemName);
    }

    @step('{0} filters the walks to show items matching #searchTerm')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Enter.theValue(this.searchTerm)
                .into(WalksProgrammeTargets.quickSearch),
        );
    }

    constructor(private searchTerm: string) {
    }
}
