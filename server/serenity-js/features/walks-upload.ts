import { actorCalled, engage } from "@serenity-js/core";
import { Navigate, UseAngular } from "@serenity-js/protractor";
import { Start } from "../screenplay/tasks/common/start";
import { Login } from "../screenplay/tasks/ramblers/common/login";
import { DeleteWalks } from "../screenplay/tasks/ramblers/walks/deleteWalks";
import { FilterWalks } from "../screenplay/tasks/ramblers/walks/filterWalks";
import { Publish } from "../screenplay/tasks/ramblers/walks/publish";
import { UploadWalks } from "../screenplay/tasks/ramblers/walks/uploadWalks";
import { Actors } from "./config/actors";

describe("Walks and Events Manager", () => {

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
    engage(new Actors());
  });

  it("walk upload", () =>
    actorCalled(process.env["RAMBLERS_USER"] || "Stuart").attemptsTo(
      UseAngular.disableSynchronisation(),
      Start.onWalksAndEventsManager(),
      Login.toRamblers(),
      Navigate.to("http://www.ramblers.org.uk/group-walks-and-events-manager.aspx"),
      FilterWalks.toShowAll(),
      DeleteWalks.requested(),
      UploadWalks.requested(),
      Publish.walksAwaitingApproval()));
});
