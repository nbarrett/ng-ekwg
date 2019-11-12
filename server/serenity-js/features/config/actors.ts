import { Actor, Cast, TakeNotes } from "@serenity-js/core";
import { BrowseTheWeb } from "@serenity-js/protractor";
import { protractor } from "protractor";
import { InteractWithAlerts } from "../../screenplay/tasks/replace-with-serenty-js-when-released/InteractWithAlerts";

export class Actors implements Cast {
  prepare(actor: Actor): Actor {
    return actor.whoCan(
      BrowseTheWeb.using(protractor.browser),
      InteractWithAlerts.using(protractor.browser),
      TakeNotes.usingAnEmptyNotepad());
  }
}
