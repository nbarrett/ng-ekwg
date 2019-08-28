import { step } from "@serenity-js/core/lib/recording";
import { PerformsTasks, See, Task } from "serenity-js/lib/screenplay";
import { Click, Duration, Enter, Is, Wait } from "serenity-js/lib/serenity-protractor";
import * as config from "../../../../../lib/config/config";
import { expect } from "../../../../expect";
import { WalksAndEventsManagerQuestions } from "../../../questions/ramblers/walksAndEventsManagerQuestions";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { Hide } from "../../common/hide";

const equals = expected => actual => expect(actual).to.eventually.eql(expected);

export class Login implements Task {

  static toRamblers() {
    return new Login();
  }

  @step("{0} logs into Ramblers")
  performAs(actor: PerformsTasks): PromiseLike<void> {
    const username = config.ramblers.gwem.userName;
    const password = config.ramblers.gwem.password;
    return actor.attemptsTo(
      See.if(WalksAndEventsManagerQuestions.LoginStatus, equals("Login")),
      Hide.target(WalksTargets.chatWindow),
      Wait.upTo(Duration.ofSeconds(10)).until(WalksTargets.chatWindow, Is.invisible()),
      Enter.theValue(username).into(WalksTargets.userName),
      Enter.theValue(password).into(WalksTargets.password),
      Click.on(WalksTargets.loginButton),
      See.if(WalksAndEventsManagerQuestions.LoginStatus, equals("Logout")),
    );
  }
}
