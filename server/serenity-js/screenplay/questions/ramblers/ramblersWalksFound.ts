import { AnswersQuestions, Question, UsesAbilities } from "@serenity-js/core";
import { promiseOf } from "@serenity-js/protractor/lib/promiseOf";
import { TargetElement } from "@serenity-js/protractor/lib/screenplay/questions/targets";
import { ElementFinder } from "protractor";
import { WalksTargets } from "../../ui/ramblers/walksTargets";
import { CheckedValue } from "./checkedValue";

export class RamblersWalkSummary {

  constructor(public rowIndex: number,
              public walkId: string,
              public walkDate: string,
              public title: string,
              public start: string,
              public status: string,
              public checkboxTarget: TargetElement,
              public currentlySelected: boolean) {
  }

}

export class RamblersWalkSummaries implements Question<Promise<RamblersWalkSummary[]>> {

  static displayed = () => new RamblersWalkSummaries();

  answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<RamblersWalkSummary[]> {

    const extractSummaryRow = (tableRow: ElementFinder, rowIndex: number) => {
      return WalksTargets.columnsForRow(tableRow)
        .map((element: ElementFinder) => element.getText())
        .then((columns: string[]) => ({
          rowIndex,
          checkboxTarget: WalksTargets.checkboxSelector(rowIndex, columns[2]),
          title: columns[1],
          walkDate: columns[2],
          status: columns[3],
        }));
    };

    const addWalkId = result => {
      return summaryObject => WalksTargets.hrefForRow(result).getAttribute("href")
        .then(walkId => ({...summaryObject, walkId}));
    };

    const addCheckedStatus = summaryObject => {
      return CheckedValue.of(summaryObject.checkboxTarget).answeredBy(actor)
        .then(selected => ({...summaryObject, currentlySelected: selected}));
    };

    return promiseOf(WalksTargets.walkListviewTableRows.answeredBy(actor)
      .map((result: ElementFinder, rowIndex: number) => extractSummaryRow(result, rowIndex)
        .then(addWalkId(result))
        .then(addCheckedStatus))
      .catch(error => {
        console.log("retrying", this.toString(), "due to", error.name);
        return this.answeredBy(actor) as Promise<any>;
      }));
  }

  toString = () => `displayed walks`;

}
