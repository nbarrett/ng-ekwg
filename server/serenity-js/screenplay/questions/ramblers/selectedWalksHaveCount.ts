import { UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { Question } from 'serenity-js/lib/screenplay-protractor';
import { every } from 'underscore';
import { WalkFilters } from '../../tasks/ramblers/walks/selectWalks';
import { RamblersWalkSummaries } from './ramblersWalksFound';

export class SelectedWalksHaveCount implements Question<PromiseLike<boolean>> {

    static matching = (walkCount: number) => new SelectedWalksHaveCount(walkCount);

    constructor(private walkCount: number) {
    }

    toString = () => `selected walk count to be ${this.walkCount}`;

    answeredBy(actor: UsesAbilities): PromiseLike<boolean> {
        return RamblersWalkSummaries.displayed().answeredBy(actor)
            .then(walks => walks.filter(walk => WalkFilters.currentlySelected(walk)))
            .then(walks => {
                // console.log(`waiting for ${this} - current count ${walks.length}`);
                return walks.length === this.walkCount;
            });
    };

}
