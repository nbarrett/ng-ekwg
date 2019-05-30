import { PerformsTasks, Task, UsesAbilities } from 'serenity-js/lib/screenplay';
import { Click } from 'serenity-js/lib/serenity-protractor';
import { contains } from 'underscore';
import { ContactListing } from '../../../questions/ramblers/contactsFound';
import { ContactsTargets } from '../../../ui/ramblers/contactsTargets';

export class ListContacts implements Task {

    static andAppendTo(results: Array<object>) {
        return new ListContacts(results);
    }

    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
        console.log('now attempting to list contacts');
        return ContactListing.displayed().answeredBy(actor).then(contacts => {
            const mapped = contacts.map(contact => {
                const {displayName, contactId} = contact;
                this.results.push({displayName, contactId});
                return {displayName, contactId};
            });
            console.log('found', this.results.length, 'contacts so far');
        });
    }

    constructor(private results: Array<object>) {
    }

}
