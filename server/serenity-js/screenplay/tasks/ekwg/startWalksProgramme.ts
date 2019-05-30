import { step } from '@serenity-js/core/lib/recording';
import {PerformsTasks, Task} from 'serenity-js/lib/screenplay';
import {Open} from 'serenity-js/lib/screenplay-protractor';

export class StartWalksProgramme implements Task {

    @step('{0} starts on the walks tab')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Open.browserOn('/#/walks'),
        );
    }

}
