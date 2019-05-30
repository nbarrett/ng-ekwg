import {
    PerformsTasks,
    Task,
} from 'serenity-js/lib/screenplay';
import { Click, Duration, Enter, Is, UseAngular, Wait } from 'serenity-js/lib/serenity-protractor';
import { Alert } from 'serenity-js/lib/serenity-protractor/screenplay/interactions/alert';
import { WaitForAlert } from 'serenity-js/lib/serenity-protractor/screenplay/interactions/waitForAlert';
import { WalksTargets } from '../../../ui/ramblers/walksTargets';
import { WaitFor } from '../common/waitFor';

export class Unpublish implements Task {

    static selectedWalks() {
        return new Unpublish();
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        console.log('Unpublishing walks');
        return actor.attemptsTo(
            Click.on(WalksTargets.unPublishSelected),
            WaitForAlert.toBePresent(),
            Alert.accept(),
            WaitFor.noSelectedWalksToHaveStatus('Published'));
    }
}
