import { AnswersQuestions, Question, UsesAbilities } from "@serenity-js/core";
import { BrowseTheWeb, Target } from "@serenity-js/protractor";
import { promiseOf } from "@serenity-js/protractor/lib/promiseOf";
import { by, ElementFinder } from "protractor";

export class SelectedValue implements Question<Promise<string>> {
  static of = (target: Question<ElementFinder> | ElementFinder) => new SelectedValue(target);

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
    BrowseTheWeb.as(actor).locate(this.target);
    return promiseOf(this.target.answeredBy(actor).$("option:checked").getText());
  }

  constructor(private target: Question<ElementFinder> | ElementFinder) {
  }

  toString = () => `the selected value of ${this.target}`;
}

export class SelectedValues implements Question<Promise<string[]>> {
  static of(target: Question<ElementFinder> | ElementFinder) {
    return new SelectedValues(target);
  }

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
    return promiseOf(this.target.answeredBy(actor).$$("option")
      .filter(option => option.isSelected())
      .map(values => values.getText()));
  }

  constructor(private target: Question<ElementFinder> | ElementFinder) {
  }

  toString = () => `the selected values of ${this.target}`;
}
