import { Ensure, equals, not } from "@serenity-js/assertions";
import { AnswersQuestions, Duration, PerformsActivities, Task } from "@serenity-js/core";
import { Enter, isVisible, isClickable, Wait } from "@serenity-js/protractor";
import { envConfig } from "../../../../../lib/env-config/env-config";
import { WalksAndEventsManagerQuestions } from "../../../questions/ramblers/walksAndEventsManagerQuestions";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { ClickWhenReady } from "../../common/clickWhenReady";

export class Login implements Task {

  static toRamblers() {
    return new Login();
  }

  performAs(actor: PerformsActivities & AnswersQuestions): Promise<void> {
    const username = envConfig.ramblers.gwem.userName;
    const password = envConfig.ramblers.gwem.password;
    return actor.attemptsTo(
      Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.authHeader, isVisible()),
      Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.userName, isClickable()),
      Enter.theValue(username).into(WalksTargets.userName),
      Enter.theValue(password).into(WalksTargets.password),
      ClickWhenReady.on(WalksTargets.loginSubmitButton),
      Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.createDropdown, isVisible()),
      Ensure.that(WalksAndEventsManagerQuestions.CreateButton, equals("Create")),
    );
  }

  toString() {
    return "#actor logs into Walks and Events Manager";
  }
}
