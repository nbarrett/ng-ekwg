import { BrowseTheWeb, Target } from "serenity-js/lib/serenity-protractor";

import { by } from "protractor";
import { Question, UsesAbilities } from "serenity-js/lib/screenplay";
import { expect } from "../../../expect";
import { WalksProgrammeTargets } from "../../ui/ekwg/walksProgrammeTargets";

export class WalkSummary {

    constructor(public action: string,
                public walkDate: string,
                public startTime: string,
                public briefDescription: string,
                public longerDescription: string,
                public distance: string,
                public gridReference: string,
                public postcode: string,
                public contactEmail: string,
                public contactPhone: string) {
    }

}

export class WalkSummaries implements Question<PromiseLike<WalkSummary[]>> {

    static displayed = () => new WalkSummaries();

    answeredBy(actor: UsesAbilities): PromiseLike<WalkSummary[]> {

        return BrowseTheWeb.as(actor).locateAll(
            WalksProgrammeTargets.walks).map(result => result.all(by.tagName("td")).getText().then(function (columns) {
            console.log("columns", columns);
            return ({
                action: columns[0],
                walkDate: columns[1],
                startTime: columns[2],
                briefDescription: columns[3],
                longerDescription: columns[4],
                distance: columns[5],
                gridReference: columns[6],
                postcode: columns[7],
                contactEmail: columns[8],
                contactPhone: columns[9],
            });
        })) as PromiseLike<WalkSummary[]>;
    }

    toString = () => `displayed walks`;
}

export const showsAWalkOn = (expectedDate: string) => showWalksOnAllOf([expectedDate]);
export const showWalksOnAllOf = (expectedDates: string[]) => foundWalks => {
    return foundWalks.then(walks => {
        console.log("walks:", walks);
        const walkDates = walks.map(walk => walk.walkDate);
        console.log("walks dates:", walkDates);
        expect(walkDates).to.include.members(expectedDates);
        // walks.forEach(walk => {
        //     console.log("walk:", walk);
        //     expect(walk.walkDate).to.be.oneOf(expectedDates);
        // });
    });
};
