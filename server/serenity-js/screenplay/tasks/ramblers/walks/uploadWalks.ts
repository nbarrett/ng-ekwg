import { PerformsActivities, Task } from "@serenity-js/core";
import { Enter } from "@serenity-js/protractor";
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

  performAs(actor: PerformsActivities): Promise<void> {
    console.log(`Uploading file ${this.fileName} containing ${this.expectedWalks} walk(s)`);
    return actor.attemptsTo(
      ClickWhenReady.on(WalksTargets.accordionUpload),
      Enter.theValue(this.fileName).into(WalksTargets.chooseFilesButton),
      ClickWhenReady.on(WalksTargets.uploadWalksButton),
      WaitFor.errorOrCountOfWalksToBe(this.expectedWalks),
      ReportOn.uploadErrors());
  }

  toString() {
    return `#actor uploads file ${this.fileName} containing ${this.expectedWalks} walks`;
  }

}
