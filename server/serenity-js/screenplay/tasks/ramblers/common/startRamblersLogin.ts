import {PerformsTasks, Task} from "serenity-js/lib/screenplay";
import { Navigate } from "../../common/navigate";

export class StartRamblersLogin implements Task {

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Navigate.to("https://www.ramblers.org.uk/login.aspx"),
        );
    }

}
