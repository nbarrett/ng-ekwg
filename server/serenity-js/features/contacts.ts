import { serenity } from "serenity-js";
import { See } from "serenity-js/lib/screenplay";
import { Click, Duration, Enter, Is, UseAngular, Wait } from "serenity-js/lib/serenity-protractor";
import { expect } from "../expect";
import { Public } from "../screenplay/public";
import { Contact } from "../screenplay/questions/ramblers/contactsFound";
import { WalksAndEventsManagerQuestions } from "../screenplay/questions/ramblers/walksAndEventsManagerQuestions";
import { Navigate } from "../screenplay/tasks/common/navigate";
import { Start } from "../screenplay/tasks/common/start";
import { Login } from "../screenplay/tasks/ramblers/common/login";
import { WaitFor } from "../screenplay/tasks/ramblers/common/waitFor";
import { RamblersToFinishProcessing } from "../screenplay/tasks/ramblers/common/waitFor";
import { CreateContact } from "../screenplay/tasks/ramblers/contacts/createContact";
import { CreateContacts } from "../screenplay/tasks/ramblers/contacts/createContacts";
import { ListContacts } from "../screenplay/tasks/ramblers/contacts/listContacts";
import { SummariseContacts } from "../screenplay/tasks/ramblers/contacts/summariseContacts";
import { Delete } from "../screenplay/tasks/ramblers/walks/deleteSelectedWalks";
import { Publish } from "../screenplay/tasks/ramblers/walks/publish";
import { SelectWalks } from "../screenplay/tasks/ramblers/walks/selectWalks";
import { Unpublish } from "../screenplay/tasks/ramblers/walks/unpublish";
import { ContactsTargets } from "../screenplay/ui/ramblers/contactsTargets";
import { WalksTargets } from "../screenplay/ui/ramblers/walksTargets";
const equals = expected => actual => expect(actual).to.eventually.eql(expected);

describe("Ramblers contacts", function () {
    this.timeout(900 * 1000);
    const stage = serenity.callToStageFor(new Public());
    const actor = stage.theActorCalled("nick");

    beforeEach(() =>
        actor.attemptsTo(
            UseAngular.disableSynchronisation(),
            Start.onContacts(),
            Login.toRamblers()));

    describe("Contacts listing", () => {
        const allContacts = [];
        it("allows scraping of all content", () => actor.attemptsTo(
            ListContacts.andAppendTo(allContacts),
            Click.on(ContactsTargets.page2),
            WaitFor.ramblersToFinishProcessing(),
            ListContacts.andAppendTo(allContacts),
            Click.on(ContactsTargets.page3),
            WaitFor.ramblersToFinishProcessing(),
            ListContacts.andAppendTo(allContacts),
            SummariseContacts.toFile(allContacts),
        ));

    });

    describe("Contacts individual creation", () => {
        it("allows creation of a single contact", () => actor.attemptsTo(
            CreateContact.usingData(new Contact("Caroline", "Courtney", "Caroline C", "courtneycaroline@hotmail.com", "07425 140196")),
        ));

    });

    describe("Contacts bulk creation", () => {
        it("allows creation of a single contact", () => actor.attemptsTo(
            Click.on(ContactsTargets.addContact),
            CreateContacts.usingData([
                {firstName: "Desiree", lastName: "Nel", displayName: "Des N", email: "desireenel@hotmail.com", contactNumber: "07741485170"},
            ]),
        ));

    });
});
