import { serenity } from "serenity-js";
import { See } from "serenity-js/lib/screenplay";
import { expect } from "../expect";
import { Public } from "../screenplay/public";
import { showsAWalkOn, showWalksOnAllOf, WalkSummaries } from "../screenplay/questions/ekwg/walksFound";
import { WalksProgrammeQuestions } from "../screenplay/questions/ekwg/walksProgrammeQuestions";
import { Start } from "../screenplay/tasks/common/start";
import { FilterWalks } from "../screenplay/tasks/ekwg/filterWalks";
const equals = expected => actual => expect(actual).to.eventually.eql(expected);
const includes = expected => actual => expect(actual).to.eventually.include(expected);
const includesMembers = expected => actual => expect(actual).to.eventually.have.members(expected);
const includesMember = expected => actual => expect(actual).to.eventually.have.members([expected]);

describe("Navigating to Walks Page", () => {

    const stage = serenity.callToStageFor(new Public());
    const actor = stage.theActorCalled("nonLoggedIn");

    describe("Walks Page", () => {
        describe("Walks filter select", () => {
            it("displays walks from today onwards by default", () => actor.attemptsTo(
                Start.onWalksProgramme(),
                See.if(WalksProgrammeQuestions.FilterCriteria, equals("Walks Today Onwards")),
            )).timeout(10000);
            it("displays walks in ascending order by default", () => actor.attemptsTo(
                Start.onWalksProgramme(),
                See.if(WalksProgrammeQuestions.SortAscendingCriteria, equals("Sort (date ascending)")),
                See.if(WalkSummaries.displayed(), showWalksOnAllOf(["Sun 11-Jun-2017",
                    "Sun 18-Jun-2017",
                    "Sun 25-Jun-2017",
                    "Sun 02-Jul-2017",
                    "Sun 09-Jul-2017",
                    "Sun 16-Jul-2017",
                    "Sun 23-Jul-2017",
                    "Sun 30-Jul-2017",
                    "Sun 06-Aug-2017",
                    "Sun 13-Aug-2017",
                    "Sun 20-Aug-2017",
                    "Sun 27-Aug-2017",
                    "Sun 03-Sep-2017",
                    "Sun 10-Sep-2017",
                    "Sun 17-Sep-2017",
                    "Sun 24-Sep-2017",
                    "Sun 01-Oct-2017",
                ])),
            )).timeout(30000);
            it("displays all walks");
            it("displays walks with no leader");
            it("displays walks with no details");
        });

        describe("Walks filter quick search", () => {
            it("allows filtering by matching word", () => actor.attemptsTo(
                Start.onWalksProgramme(),
                FilterWalks.toShowOnly("nick"),
            )).timeout(5000);
        });
    });

});
