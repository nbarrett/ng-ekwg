import { Ensure, equals, not } from "@serenity-js/assertions";
import { AnswersQuestions, Duration, PerformsActivities, Task } from "@serenity-js/core";
import { Click, Enter, isVisible, Wait } from "@serenity-js/protractor";
import * as config from "../../../../../lib/config/config";
import { WalksAndEventsManagerQuestions } from "../../../questions/ramblers/walksAndEventsManagerQuestions";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { Hide } from "../../common/hide";

export class Login implements Task {

  static toRamblers() {
    return new Login();
  }

  performAs(actor: PerformsActivities & AnswersQuestions): Promise<void> {
    const username = config.ramblers.gwem.userName;
    const password = config.ramblers.gwem.password;
    return actor.attemptsTo(
      Ensure.that(WalksAndEventsManagerQuestions.LoginStatus, equals("Login")),
      Hide.target(WalksTargets.chatWindow),
      Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.chatWindow, not(isVisible())),
      Enter.theValue(username).into(WalksTargets.userName),
      Enter.theValue(password).into(WalksTargets.password),
      Click.on(WalksTargets.loginButton),
      Ensure.that(WalksAndEventsManagerQuestions.LoginStatus, equals("Logout")),
    );
  }

  toString() {
    return "#actor logs into Ramblers";
  }
}
