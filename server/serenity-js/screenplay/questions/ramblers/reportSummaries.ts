import { PerformsTasks, Question, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { by } from "protractor";
import { BrowseTheWeb } from "serenity-js/lib/serenity-protractor";
import { SaveBrowserSource } from "../../tasks/common/saveBrowserSource";
import { WalksTargets } from "../../ui/ramblers/walksTargets";

export class UploadError {
  constructor(public rowNumber: number,
              public message: string) {
  }

  toString = () => `row ${this.rowNumber}: ${this.message}`;

}

export class UploadErrors implements Question<PromiseLike<UploadError[]>> {

  static displayed = () => new UploadErrors();

  answeredBy(actor: PerformsTasks & UsesAbilities): PromiseLike<UploadError[]> {

    const extractUploadError = result => {
      return result.all(by.css("td")).getAttribute("textContent")
        .then(columns => ({
          rowNumber: columns[0],
          message: columns[1],
        }));
    };

    return actor.attemptsTo(
      SaveBrowserSource.toFile("upload-errors-source.html"))
      .then(_ => {
          return BrowseTheWeb.as(actor).locateAll(
            WalksTargets.uploadResultTableRows)
            .map((result, rowIndex) => extractUploadError(result)).then(results => {
              const [head, ...tail] = results;
              return tail;
            }) as PromiseLike<UploadError[]>;
        },
      );
  }

  toString = () => `upload errors`;

}
