import { Interaction, Question, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { BrowseTheWeb, Duration } from "serenity-js/lib/serenity-protractor";

export class WaitForQuestion implements Interaction {

  static toBeAnsweredTrue = (question: Question<PromiseLike<boolean>>, timeout: Duration) => new WaitForQuestion(question, timeout);

  performAs(actor: UsesAbilities): PromiseLike<void> {
    return BrowseTheWeb.as(actor).wait(() =>
        this.question.answeredBy(actor).then(result => {
          // console.log(`${ this.question } -> ${result}`);
          return result;
        }, (error: Error) => {
          if (error.name === "StaleElementReferenceError") {
            // console.log(`[WaitForQuestion] handling error: ${error.name}`);
            return false;
          } else if (error.name === "NoSuchElementError") {
            // console.log(`[WaitForQuestion] handling error: ${error.name}`);
            return false;
          } else {
            throw error;
          }
        }),
      this.timeout.toMillis(),
      `${this.question} failed to return true answer within ${this.timeout} timeout`,
    );
  }

  toString = () => `{0} waits for ${this.question}`;

  constructor(private question: Question<PromiseLike<boolean>>, private timeout: Duration) {
  }

}
