import { Ensure, equals, not } from "@serenity-js/assertions";
import { AnswersQuestions, Duration, PerformsActivities, Task } from "@serenity-js/core";
import { Click, Enter, isVisible, Wait } from "@serenity-js/protractor";
import { envConfig } from "../../../../../lib/env-config/env-config";
import { WalksAndEventsManagerQuestions } from "../../../questions/ramblers/walksAndEventsManagerQuestions";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { ClickWhenReady } from "../../common/clickWhenReady";
import { Hide } from "../../common/hide";

export class Login implements Task {

  static toRamblers() {
    return new Login();
  }

  performAs(actor: PerformsActivities & AnswersQuestions): Promise<void> {
    const username = envConfig.ramblers.gwem.userName;
    const password = envConfig.ramblers.gwem.password;
    return actor.attemptsTo(
      Ensure.that(WalksAndEventsManagerQuestions.LoginStatus, equals("Login")),
      Hide.target(WalksTargets.chatWindow),
      Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.chatWindow, not(isVisible())),
      ClickWhenReady.on(WalksTargets.loginStartButton),
      ClickWhenReady.on(WalksTargets.loginTab),
      Enter.theValue(username).into(WalksTargets.userName),
      Enter.theValue(password).into(WalksTargets.password),
      Click.on(WalksTargets.loginSubmitButton),
      Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.loginStatus, isVisible()),
      Ensure.that(WalksAndEventsManagerQuestions.LoginStatus, equals("Logout")),
    );
  }

  toString() {
    return "#actor logs into Ramblers";
  }
}
