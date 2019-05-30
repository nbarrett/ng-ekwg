import {Question, Text} from 'serenity-js/lib/screenplay-protractor';
import { WebElement } from 'serenity-js/lib/serenity-protractor';
import {WalksTargets} from '../../ui/ramblers/walksTargets';

export class WalksAndEventsManagerQuestions {
    public static LoginStatus: Question<PromiseLike<string>> = Text.of(WalksTargets.loginStatus);
}
