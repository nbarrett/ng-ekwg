import { serenity } from "serenity-js";
import { UseAngular } from "serenity-js/lib/serenity-protractor";
import { Public } from "../screenplay/public";
import { Start } from "../screenplay/tasks/common/start";
import { Login } from "../screenplay/tasks/ramblers/common/login";
import { DeleteWalks } from "../screenplay/tasks/ramblers/walks/deleteWalks";
import { FilterWalks } from "../screenplay/tasks/ramblers/walks/filterWalks";
import { Publish } from "../screenplay/tasks/ramblers/walks/publish";
import { UploadWalks } from "../screenplay/tasks/ramblers/walks/uploadWalks";

describe("Walks and Events Manager", function () {
    this.timeout(250 * 1000);
    const stage = serenity.callToStageFor(new Public());
    const actor = stage.theActorCalled(process.env["RAMBLERS_USER"] || "Stuart");

    it("walk upload", () => {
        return actor.attemptsTo(
            UseAngular.disableSynchronisation(),
            Start.onWalksAndEventsManager(),
            Login.toRamblers(),
            FilterWalks.toShowAll(),
            DeleteWalks.requested(),
            UploadWalks.requested(),
            Publish.walksAwaitingApproval(),
        );
    });

});
