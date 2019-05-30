import { protractor } from 'protractor';
import { TakeNotes } from 'serenity-js/lib/screenplay';
import { Actor, BrowseTheWeb, Cast } from 'serenity-js/lib/screenplay-protractor';

export class Public implements Cast {
    public actor(name: string): Actor {
        const notepad = {};
        return Actor.named(name)
            .whoCan(BrowseTheWeb.using(protractor.browser))
            .whoCan(TakeNotes.using(notepad));
    }
}
