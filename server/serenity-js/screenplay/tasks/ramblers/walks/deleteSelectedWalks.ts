import { PerformsTasks, Task, UsesAbilities } from 'serenity-js/lib/screenplay';
import { Click, Duration, Is, Wait } from 'serenity-js/lib/serenity-protractor';
import { Alert } from 'serenity-js/lib/serenity-protractor/screenplay/interactions/alert';
import { WaitForAlert } from 'serenity-js/lib/serenity-protractor/screenplay/interactions/waitForAlert';
import { RamblersWalkSummaries } from '../../../questions/ramblers/ramblersWalksFound';
import { WalksTargets } from '../../../ui/ramblers/walksTargets';
import { WaitFor } from '../common/waitFor';

export class Delete implements Task {

    static selectedWalks(): Task {
        return new Delete();
    }

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        let totalWalkCount;
        let selectedWalkCount;
        return RamblersWalkSummaries.displayed().answeredBy(actor)
            .then(walks => {
                totalWalkCount = walks.length;
                return walks.filter(walk => walk.currentlySelected);
            }).then(walks => {
                selectedWalkCount = walks.length;
                return actor.attemptsTo(
                    Click.on(WalksTargets.deleteSelected),
                    WaitForAlert.toBePresent(),
                    Alert.accept(),
                    WaitFor.errorOrCountOfWalksToBe(totalWalkCount - selectedWalkCount));
            });

    }
}
