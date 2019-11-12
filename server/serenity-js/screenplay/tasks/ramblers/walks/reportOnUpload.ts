import { Ensure, equals } from "@serenity-js/assertions";
import { AnswersQuestions, PerformsActivities, Question, Task, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import * as moment from "moment-timezone";
import * as path from "path";
import * as ramblersUploadAudit from "../../../../../lib/mongo/models/ramblers-upload-audit";
import * as mongooseClient from "../../../../../lib/mongo/mongoose-client";
import { UploadErrors } from "../../../questions/ramblers/reportSummaries";
import { RequestParameterExtractor } from "../common/requestParameterExtractor";

export class ReportOn implements Task {

  static uploadErrors = () => new ReportOn();

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<void> {
    return actor.answer(UploadErrors.displayed())
      .then(errors => {
        const fileName = path.basename(RequestParameterExtractor.extract().fileName);
        if (errors.length === 0) {
          mongooseClient.create(ramblersUploadAudit, {
            auditTime: moment().tz("Europe/London").valueOf(),
            fileName,
            type: "step",
            status: "success",
            message: "No errors were found following upload",
          });
        } else {
          mongooseClient.create(ramblersUploadAudit, {
            auditTime: moment().tz("Europe/London").valueOf(),
            fileName,
            type: "step",
            status: "error",
            message: `Found ${errors.length} errors following upload`,
            errorResponse: errors,
          });
        }
        return actor.attemptsTo(Ensure.that(CountOfErrors.displayed(errors.length), equals(0)));
      });
  }

  toString() {
    return "#actor reports on upload";
  }

}

class CountOfErrors implements Question<number> {
  constructor(private count: number) {
  }

  static displayed(count): Question<number> {
    return new CountOfErrors(count);
  }

  answeredBy(actor: UsesAbilities): number {
    return this.count;
  }

  toString() {
    return "the count of upload errors";
  }

}
