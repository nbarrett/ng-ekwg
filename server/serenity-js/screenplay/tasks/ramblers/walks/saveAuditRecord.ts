import { PerformsActivities, Task, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import * as moment from "moment-timezone";
import * as path from "path";
import { UploadError } from "../../../questions/ramblers/reportSummaries";
import { Log } from "../../common/log";
import { RequestParameterExtractor } from "../common/requestParameterExtractor";

export class SaveAuditRecord implements Task {

  constructor(private errors: UploadError[]) {
  }

  static uploadErrors = (errors: UploadError[]) => new SaveAuditRecord(errors);

  performAs(actor: PerformsActivities & UsesAbilities): Promise<any> {
    if (this.errors.length > 0) {
      actor.attemptsTo(Log.message(`${this.errors.length} error found: ${this.errors.map(item => item.message).join(", ")}`));
    } else {
      return Promise.resolve();
    }
  }

  toString() {
    return "#actor logs errors";
  }

  generateError() {
    const fileName = path.basename(RequestParameterExtractor.extract().fileName);
    const happy = {
      auditTime: moment().tz("Europe/London").valueOf(),
      fileName,
      type: "step",
      status: "success",
      message: "No errors were found following upload",
    };
    const sad = {
      auditTime: moment().tz("Europe/London").valueOf(),
      fileName,
      type: "step",
      status: "error",
      message: `Found ${this.errors.length} errors following upload`,
      errorResponse: this.errors,
    };
    console.log("** GENERATED ERROR MESSAGE **");
    return this.errors.length === 0 ? happy : sad;
  }
}

