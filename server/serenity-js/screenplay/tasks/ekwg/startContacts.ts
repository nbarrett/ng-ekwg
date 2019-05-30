import {PerformsTasks, Task} from 'serenity-js/lib/screenplay';
import { Navigate } from '../common/navigate';

export class StartContacts implements Task {

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Navigate.to('http://www.ramblers.org.uk/group-walks-and-events-manager.aspx?tab=Contacts'),
        );
    }

}
