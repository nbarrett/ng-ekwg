import { step } from '@serenity-js/core/lib/recording';
import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Navigate } from '../common/navigate';

export class StartWalksAndEventsManager implements Task {

    @step('{0} starts on the walks and events manager')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Navigate.to('http://www.ramblers.org.uk/group-walks-and-events-manager.aspx'),
        );
    }

}
