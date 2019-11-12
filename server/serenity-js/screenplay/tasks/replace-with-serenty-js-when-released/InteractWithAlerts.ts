import { Ability, UsesAbilities } from "@serenity-js/core";
import { promiseOf } from "@serenity-js/protractor/lib/promiseOf";
import { ProtractorBrowser } from "protractor";
import { Alert } from "selenium-webdriver";

export class InteractWithAlerts implements Ability {

  static using(browser: ProtractorBrowser): InteractWithAlerts {
    return new InteractWithAlerts(browser);
  }

  static as(actor: UsesAbilities): InteractWithAlerts {
    return actor.abilityTo(InteractWithAlerts);
  }

  constructor(private readonly browser: ProtractorBrowser) {
  }

  /**
   * @desc
   *  Switch the browser to an alert if there is one.
   *
   * @returns {Promise<Alert>}
   */
  switchToAlert(): Promise<Alert> {
    return promiseOf(this.browser.switchTo().alert());
  }

  /**
   * @desc
   *  Accept an active alert.
   *
   * @returns {Promise<void>}
   */
  acceptAlert(): Promise<void> {
    return promiseOf(this.browser.switchTo().alert().accept());
  }

  /**
   * @desc
   *  Dismiss an active alert.
   *
   * @returns {Promise<void>}
   */
  dismissAlert(): Promise<void> {
    return promiseOf(this.browser.switchTo().alert().dismiss());
  }

}
