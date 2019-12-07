import { step } from "@serenity-js/core/lib/recording";
import { PerformsTasks, Task } from "serenity-js/lib/screenplay";
import { Enter } from "serenity-js/lib/serenity-protractor";
import { WalksTargets } from "../../../ui/ramblers/walksTargets";
import { ClickWhenReady } from "../../common/clickWhenReady";
import { RequestParameterExtractor } from "../common/requestParameterExtractor";
import { WaitFor } from "../common/waitFor";
import { ReportOn } from "./reportOnUpload";

export class UploadWalks {

  static fileWithNameAndCount(fileName: string, expectedWalks: number) {
    return new UploadWalksSpecifiedWalks(fileName, expectedWalks);
  }

  static requested() {
    const walkParameters = RequestParameterExtractor.extract();
    return new UploadWalksSpecifiedWalks(walkParameters.fileName, walkParameters.walkCount);
  }

}

export class UploadWalksSpecifiedWalks implements Task {

  constructor(private fileName: string, private expectedWalks: number) {
  }

  @step("{0} prepares to upload file #fileName containing #expectedWalks walks")
  performAs(actor: PerformsTasks): PromiseLike<void> {
    console.log(`Uploading file ${this.fileName} containing ${this.expectedWalks} walk(s)`);
    return actor.attemptsTo(
      ClickWhenReady.on(WalksTargets.accordionUpload),
      ClickWhenReady.on(WalksTargets.fileUploadSelectFile),
      Enter.theValue(this.fileName).into(WalksTargets.fileUploadSelectFile),
      ClickWhenReady.on(WalksTargets.uploadWalksButton),
      WaitFor.errorOrCountOfWalksToBe(this.expectedWalks),
      ReportOn.uploadErrors());
  };

}
