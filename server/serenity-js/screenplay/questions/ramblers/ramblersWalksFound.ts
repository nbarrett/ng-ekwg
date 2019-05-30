import { FileSystem } from '@serenity-js/core/lib/io/file_system';
import { Question, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { by, protractor } from 'protractor';
import { BrowseTheWeb, Target } from 'serenity-js/lib/serenity-protractor';
import { WalksTargets } from '../../ui/ramblers/walksTargets';
import { CheckedValue } from './checkedValue';

export class RamblersWalkSummary {

    constructor(public rowIndex: number,
                public walkId: number,
                public walkDate: string,
                public title: string,
                public start: string,
                public distanceMiles: string,
                public distanceKm: string,
                public status: string,
                public checkboxTarget: Target,
                public currentlySelected: boolean) {
    }

}

export class RamblersWalkSummaries implements Question<PromiseLike<RamblersWalkSummary[]>> {

    static displayed = () => new RamblersWalkSummaries();

    answeredBy(actor: UsesAbilities): PromiseLike<RamblersWalkSummary[]> {

        const extractSummaryRow = (result, rowIndex) => {
            return result.all(by.css('[class^="col-"]')).getText()
                .then(columns => ({
                    rowIndex,
                    walkDate: columns[0],
                    title: columns[1],
                    start: columns[2],
                    distanceMiles: columns[3],
                    distanceKm: columns[4],
                    status: columns[5],
                    checkboxTarget: WalksTargets.checkboxSelector(rowIndex, columns[0]),
                }));
        };

        const addWalkId = result => {
            return summaryObject => result.all(by.css('div[style="display: none"]')).getAttribute('innerText')
                .then(walkIds => Object.assign(summaryObject, {walkId: parseInt(walkIds[0], 10)}));
        };

        const addCheckedStatus = summaryObject => {
            return CheckedValue.of(summaryObject.checkboxTarget).answeredBy(actor)
                .then(selected => Object.assign(summaryObject, {currentlySelected: selected}));
        };

        return BrowseTheWeb.as(actor).locateAll(
            WalksTargets.walks)
            .map((result, rowIndex) => extractSummaryRow(result, rowIndex)
                .then(addWalkId(result))
                .then(addCheckedStatus)).catch(error => {
                if (error.name === 'StaleElementReferenceError') {
                    return RamblersWalkSummaries.displayed().answeredBy(actor);
                } else {
                    throw error;
                }
            }) as PromiseLike<RamblersWalkSummary[]>;

    }

    toString = () => `displayed walks`;

}
