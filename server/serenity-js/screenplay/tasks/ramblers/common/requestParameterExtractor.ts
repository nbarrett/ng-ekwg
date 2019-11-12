import { PerformsActivities, Task } from "@serenity-js/core";
import { Log } from "../../common/log";

const ramblersDeleteWalks = "RAMBLERS_DELETE_WALKS";
const ramblersWalkCount = "RAMBLERS_WALKCOUNT";
const ramblersFileName = "RAMBLERS_FILENAME";

export class ExtractTask implements Task {

  performAs(actor: PerformsActivities): Promise<void> {
    const extractedParameters = RequestParameterExtractor.extract();
    console.log("extractedParameters", extractedParameters);
    return actor.attemptsTo(
      Log.message(`parameters supplied were ${JSON.stringify(extractedParameters)}`),
    );
  }

}

export class RequestParameterExtractor {

  static extract() {
    const walkDeletionsString = process.env[ramblersDeleteWalks] || "";
    const walkDeletions = walkDeletionsString.length > 1 ? walkDeletionsString.split(",").map(walkId => Number(walkId)) : [] as number[];
    const fileName = process.env[ramblersFileName] as string;
    const walkCount = Number(process.env[ramblersWalkCount]) as number;
    return {
      walkDeletions,
      fileName,
      walkCount,
    };
  }

  static extractTask = () => new ExtractTask();
}
