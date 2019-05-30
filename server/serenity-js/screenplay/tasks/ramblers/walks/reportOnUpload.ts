import { step } from '@serenity-js/core/lib/recording';
import { UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Question } from 'serenity-js/lib/screenplay-protractor';
import { Click } from 'serenity-js/lib/serenity-protractor';
import { every } from 'underscore';
import { RamblersWalkSummaries } from '../../../questions/ramblers/ramblersWalksFound';
import { UploadErrors } from '../../../questions/ramblers/reportSummaries';
import { WalksTargets } from '../../../ui/ramblers/walksTargets';
import { WaitFor } from '../common/waitFor';
import { WalkFilters } from './selectWalks';
import { SelectWalks } from './selectWalks';

export class ReportOn implements Task {

    static uploadErrors = () => new ReportOn();

    @step('{0} reports on upload')
    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        return UploadErrors.displayed().answeredBy(actor)
            .then(errors => {
                if (errors.length === 0) {
                    console.log('No errors were found following upload');
                } else {
                    console.log(`Found ${errors.length} errors following upload: ${JSON.stringify(errors)}`);
                }
            });

    };

}
