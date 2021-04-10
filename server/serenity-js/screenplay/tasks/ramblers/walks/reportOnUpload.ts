import { Ensure, equals } from "@serenity-js/assertions";
import { AnswersQuestions, PerformsActivities, Task, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { CountOfErrors } from "../../../questions/ramblers/countOfErrors";
import { UploadErrors } from "../../../questions/ramblers/reportSummaries";
import { SaveAuditRecord } from "./saveAuditRecord";

export class ReportOn implements Task {

  static uploadErrors = () => new ReportOn();

  performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<void> {
    return actor.answer(UploadErrors.displayed())
      .then(errors => actor.attemptsTo(
        SaveAuditRecord.uploadErrors(errors),
        Ensure.that(CountOfErrors.displayed(errors.length), equals(0))));
  }

  toString() {
    return "#actor reports on upload";
  }

}

