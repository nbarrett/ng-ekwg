import { step } from "@serenity-js/core/lib/recording";
import { UsesAbilities } from "@serenity-js/core/lib/screenplay";
import * as moment from "moment-timezone";
import * as path from "path";
import { PerformsTasks, Task } from "serenity-js/lib/screenplay";
import * as localMongo from "../../../../../lib/mongo/localMongo";
import { UploadErrors } from "../../../questions/ramblers/reportSummaries";
import { RequestParameterExtractor } from "../common/requestParameterExtractor";

export class ReportOn implements Task {

  static uploadErrors = () => new ReportOn();

  @step("{0} reports on upload")
  performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
    return UploadErrors.displayed().answeredBy(actor)
      .then(errors => {
        const fileName = path.basename(RequestParameterExtractor.extract().fileName);
        if (errors.length === 0) {
          localMongo.post("ramblersUploadAudit", {
            auditTime: moment().tz("Europe/London").valueOf(),
            fileName,
            type: "step",
            status: "success",
            message: "No errors were found following upload",
          });
        } else {
          localMongo.post("ramblersUploadAudit", {
            auditTime: moment().tz("Europe/London").valueOf(),
            fileName,
            type: "step",
            status: "error",
            message: `Found ${errors.length} errors following upload: ${JSON.stringify(errors)}`,
          });
          throw new Error("Upload failed - see previous audit errors");
        }
      });
  };

}
