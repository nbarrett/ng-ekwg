import { step } from '@serenity-js/core/lib/recording';
import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Click, Enter } from 'serenity-js/lib/serenity-protractor';
import { Presence } from '../../../questions/ramblers/visibility';
import { WalksTargets } from '../../../ui/ramblers/walksTargets';
import { ClickWhenReady } from '../../common/clickWhenReady';
import { Check } from '../../common/conditional';
import { RequestParameterExtractor } from '../common/requestParameterExtractor';
import { WaitFor } from '../common/waitFor';
import { Delete } from './deleteSelectedWalks';
import { ReportOn } from './reportOnUpload';
import { SelectWalks } from './selectWalks';
import { Unpublish } from './unpublish';

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

    @step('{0} prepares to upload file #fileName containing #expectedWalks walks')
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
