import { AnswersQuestions, PerformsActivities, Question, UsesAbilities } from "@serenity-js/core";
import { by } from "protractor";
import { WalksTargets } from "../../ui/ramblers/walksTargets";
import { tail } from "../../util/util";

export class UploadError {
  constructor(public rowNumber: number,
              public message: string) {
  }

  toString = () => `row ${this.rowNumber}: ${this.message}`;

}

export class UploadErrors implements Question<Promise<UploadError[]>> {

  static displayed = () => new UploadErrors();

  answeredBy(actor: PerformsActivities & AnswersQuestions & UsesAbilities): Promise<UploadError[]> {
    return WalksTargets.uploadResultTableRows.answeredBy(actor)
      .map(result => result.all(by.css("td")).getAttribute("textContent")
        .then(columns => ({
          rowNumber: columns[0],
          message: columns[1],
        })))
      .then(results => tail(results)) as Promise<UploadError[]>;
  }

  toString = () => `upload errors`;

}
