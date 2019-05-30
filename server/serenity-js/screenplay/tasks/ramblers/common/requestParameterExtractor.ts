import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { Open } from 'serenity-js/lib/screenplay-protractor';
import { Log } from '../../common/log';
import { Navigate } from '../../common/navigate';

const ramblersDeleteWalks = 'RAMBLERS_DELETE_WALKS';
const ramblersWalkCount = 'RAMBLERS_WALKCOUNT';
const ramblersFileName = 'RAMBLERS_FILENAME';

export class ExtractTask implements Task {

    performAs(actor: PerformsTasks): PromiseLike<void> {
        const extractedParameters = RequestParameterExtractor.extract();
        console.log('extractedParameters', extractedParameters);
        return actor.attemptsTo(
            Log.message(`parameters supplied were ${JSON.stringify(extractedParameters)}`),
        );
    }

}

export class RequestParameterExtractor {

    static extract() {
        const walkDeletionsString = process.env[ramblersDeleteWalks];
        const walkDeletions = walkDeletionsString.length > 1 ? walkDeletionsString.split(',').map(walkId => Number(walkId)) : [] as number[];
        const fileName = process.env[ramblersFileName] as string;
        const walkCount = Number(process.env[ramblersWalkCount]) as number;
        return {
            walkDeletions,
            fileName,
            walkCount,
        };
    }

    static extractTask = () => new ExtractTask();
}
