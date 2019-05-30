import { serenity } from 'serenity-js';
import { UseAngular } from 'serenity-js/lib/serenity-protractor';
import { Public } from '../screenplay/public';
import { Start } from '../screenplay/tasks/common/start';
import { Login } from '../screenplay/tasks/ramblers/common/login';
import { RequestParameterExtractor } from '../screenplay/tasks/ramblers/common/requestParameterExtractor';
import { WaitFor } from '../screenplay/tasks/ramblers/common/waitFor';
import { DeleteWalks } from '../screenplay/tasks/ramblers/walks/deleteWalks';
import { FilterWalks } from '../screenplay/tasks/ramblers/walks/filterWalks';
import { Publish } from '../screenplay/tasks/ramblers/walks/publish';
import { SelectWalks } from '../screenplay/tasks/ramblers/walks/selectWalks';
import { UploadWalks } from '../screenplay/tasks/ramblers/walks/uploadWalks';

describe('Walks and Events Manager', function () {
    this.timeout(150 * 1000);
    const stage = serenity.callToStageFor(new Public());
    const actor = stage.theActorCalled('nick');

    it('process command parameters', () => {
        return actor.attemptsTo(
            RequestParameterExtractor.extractTask(),
            UseAngular.disableSynchronisation(),
            Start.onWalksAndEventsManager(),
        );
    });

});
