import { PerformsTasks, Task } from 'serenity-js/lib/screenplay';
import { See } from 'serenity-js/lib/screenplay';
import { Click, Duration, Enter, Is, Wait } from 'serenity-js/lib/serenity-protractor';
import { expect } from '../../../../expect';
import { Contact } from '../../../questions/ramblers/contactsFound';
import { WalksAndEventsManagerQuestions } from '../../../questions/ramblers/walksAndEventsManagerQuestions';
import { ContactsTargets } from '../../../ui/ramblers/contactsTargets';
import { WalksTargets } from '../../../ui/ramblers/walksTargets';
import { SaveBrowserSource } from '../../common/saveBrowserSource';
const equals = expected => actual => expect(actual).to.eventually.eql(expected);

export class CreateContact implements Task {

    static usingData(contactData: Contact) {
        return new CreateContact(contactData);
    }

    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            Enter.theValue(this.contactData.firstName).into(ContactsTargets.firstName),
            Enter.theValue(this.contactData.lastName).into(ContactsTargets.lastName),
            Enter.theValue(this.contactData.displayName).into(ContactsTargets.displayName),
            Enter.theValue(this.contactData.email).into(ContactsTargets.email),
            Enter.theValue(this.contactData.contactNumber).into(ContactsTargets.contactNumber),
            Click.on(ContactsTargets.save),
            SaveBrowserSource.toFile(this.contactData.firstName + this.contactData.lastName + '-post-save.html'),
            Wait.upTo(Duration.ofSeconds(20)).until(ContactsTargets.addAnotherContact, Is.visible()),
            Click.on(ContactsTargets.addAnotherContact),
        );
    }

    constructor(public contactData: Contact) {
    }

}
