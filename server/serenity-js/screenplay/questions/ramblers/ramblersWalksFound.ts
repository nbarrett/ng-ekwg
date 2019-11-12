import { AnswersQuestions, Question, UsesAbilities } from "@serenity-js/core";
import { promiseOf } from "@serenity-js/protractor/lib/promiseOf";
import { TargetElement } from "@serenity-js/protractor/lib/screenplay/questions/targets";
import { by } from "protractor";
import { WalksTargets } from "../../ui/ramblers/walksTargets";
import { CheckedValue } from "./checkedValue";

export class RamblersWalkSummary {

  constructor(public rowIndex: number,
              public walkId: number,
              public walkDate: string,
              public title: string,
              public start: string,
              public distanceMiles: string,
              public distanceKm: string,
              public status: string,
              public checkboxTarget: TargetElement,
              public currentlySelected: boolean) {
  }

}

export class RamblersWalkSummaries implements Question<Promise<RamblersWalkSummary[]>> {

  static displayed = () => new RamblersWalkSummaries();

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<RamblersWalkSummary[]> {

    const extractSummaryRow = (result, rowIndex) => {
      return result.all(by.css("[class^='col-']"))
        .map(element => element.getText())
        .then(columns => ({
          rowIndex,
          walkDate: columns[0],
          title: columns[1],
          start: columns[2],
          distanceMiles: columns[3],
          distanceKm: columns[4],
          status: columns[5],
          checkboxTarget: WalksTargets.checkboxSelector(rowIndex, columns[0]),
        }));
    };

    const addWalkId = result => {
      return summaryObject => result.all(by.css("div[style='display: none']")).getAttribute("innerText")
        .then(walkIds => ({...summaryObject, walkId: parseInt(walkIds[0], 10)}));
    };

    const addCheckedStatus = summaryObject => {
      return CheckedValue.of(summaryObject.checkboxTarget).answeredBy(actor)
        .then(selected => ({...summaryObject, currentlySelected: selected}));
    };

    return promiseOf(WalksTargets.walks.answeredBy(actor)
      .map((result, rowIndex) => extractSummaryRow(result, rowIndex)
        .then(addWalkId(result))
        .then(addCheckedStatus))
      .catch(error => {
        console.log("retrying", this.toString(), "due to", error.name);
        return this.answeredBy(actor) as Promise<any>;
      }));
  }

  toString = () => `displayed walks`;

}
