import { AnswersQuestions, Question, UsesAbilities } from "@serenity-js/core";
import { promiseOf } from "@serenity-js/protractor/lib/promiseOf";
import { WalksTargets } from "../../ui/ramblers/walksTargets";

export class UploadError implements Question<Promise<boolean>> {

  static displayed = () => new UploadError();

  toString() {
    return "walk upload error is showing";
  }

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<boolean> {
    return promiseOf(WalksTargets.uploadResultSummary.answeredBy(actor).isPresent());
  }

}
