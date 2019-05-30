import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { See } from 'serenity-js/lib/screenplay';
import { Click, Duration, Enter, Is, Wait } from 'serenity-js/lib/serenity-protractor';
import { expect } from '../../../../expect';
import { Contact } from '../../../questions/ramblers/contactsFound';
import { WalksAndEventsManagerQuestions } from '../../../questions/ramblers/walksAndEventsManagerQuestions';
import { ContactsTargets } from '../../../ui/ramblers/contactsTargets';
import { WalksTargets } from '../../../ui/ramblers/walksTargets';
import { CreateContact } from './createContact';

export class CreateContacts implements Task {

    static usingData(contacts) {
        return new CreateContacts(contacts);
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            ...this.contacts.map(
                contact => CreateContact.usingData(new Contact(contact.firstName, contact.lastName, contact.displayName, contact.email, contact.contactNumber))));
    }

    constructor(public contacts) {
    }

}
