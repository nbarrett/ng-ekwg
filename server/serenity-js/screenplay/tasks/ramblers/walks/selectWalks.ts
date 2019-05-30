import { step } from '@serenity-js/core/lib/recording';
import { PerformsTasks, Task, UsesAbilities } from 'serenity-js/lib/screenplay';
import { Click } from 'serenity-js/lib/serenity-protractor';
import { contains } from 'underscore';
import { RamblersWalkSummaries, RamblersWalkSummary } from '../../../questions/ramblers/ramblersWalksFound';
import { WalksTargets } from '../../../ui/ramblers/walksTargets';
import { SelectCheckbox } from '../../common/selectCheckbox';
import { WaitFor } from '../common/waitFor';

export const WalkFilters = {
    withStatus: (walk: RamblersWalkSummary, status: string) => walk.status === status,
    withIds: (walk: RamblersWalkSummary, walkIds: number[]) => contains(walkIds, walk.walkId),
    currentlySelected: (walk: RamblersWalkSummary) => walk.currentlySelected,
};

export class SelectWalks {

    static notPublishedOrWithIds(walkIds: number[]) {
        return new SelectWalksNotPublishedOrWithIds(walkIds);
    }

    static withIds(...walkIds: number[]) {
        return new SelectWalksWithIds(walkIds);
    }

    static withStatus(status: string) {
        return new SelectWalksWithStatus(status);
    }

    static all() {
        return new SelectAllWalks();
    }

    static none() {
        return new DeselectAllWalks();
    }
}

export class SelectAllWalks implements Task {

    @step('{0} selects all walks')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Click.on(WalksTargets.selectAll),
            WaitFor.ramblersToFinishProcessing());
    }

}

export class DeselectAllWalks implements Task {

    @step('{0} deselects all walks')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Click.on(WalksTargets.clearAll),
            WaitFor.countOfSelectedWalksToBe(0));
    }

}

export class SelectWalksWithStatus implements Task {

    constructor(private status: string) {
    }

    @step('{0} selects walks with status #status')
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        console.log(`selecting walks of status '${this.status}'`);
        return RamblersWalkSummaries.displayed().answeredBy(actor)
            .then(walks => actor.attemptsTo(
                SelectWalks.none(),
                ...walks
                    .filter(walk => WalkFilters.withStatus(walk, this.status))
                    .map(walk => SelectCheckbox.checked().from(walk.checkboxTarget)),
                WaitFor.ramblersToFinishProcessing()));
    }

}

export class SelectWalksNotPublishedOrWithIds implements Task {

    constructor(private walkIds: number[]) {
    }

    @step('{0} selects walks not published or with ids: #walkIds')
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return RamblersWalkSummaries.displayed().answeredBy(actor)
            .then(walks => actor.attemptsTo(
                SelectWalks.none(),
                ...walks
                    .filter(walk => !WalkFilters.withStatus(walk, 'Published') || WalkFilters.withIds(walk, this.walkIds))
                    .map(walk => SelectCheckbox.checked().from(walk.checkboxTarget)),
                WaitFor.ramblersToFinishProcessing()));
    }

}

export class SelectWalksWithIds implements Task {

    constructor(private walkIds: number[]) {
    }

    @step('{0} selects walks with ids: #walkIds')
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return RamblersWalkSummaries.displayed().answeredBy(actor)
            .then(walks => actor.attemptsTo(
                SelectWalks.none(),
                ...walks
                    .filter(walk => WalkFilters.withIds(walk, this.walkIds))
                    .map(walk => SelectCheckbox.checked().from(walk.checkboxTarget)),
                WaitFor.ramblersToFinishProcessing()));
    }

}
