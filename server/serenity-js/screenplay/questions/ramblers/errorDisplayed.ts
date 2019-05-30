import { UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { Question } from 'serenity-js/lib/screenplay-protractor';
import { WebElement } from 'serenity-js/lib/serenity-protractor';
import { WalksTargets } from '../../ui/ramblers/walksTargets';

export class UploadError implements Question<PromiseLike<boolean>> {

    static displayed = () => new UploadError();

    toString = () => `walk upload error is showing`;

    answeredBy(actor: UsesAbilities): PromiseLike<boolean> {
        return WebElement.of(WalksTargets.uploadResultSummary).answeredBy(actor).isPresent();
    };

}
