import { PerformsTasks, Task } from "serenity-js/lib/screenplay";
import { Contact } from "../../../questions/ramblers/contactsFound";
import { CreateContact } from "./createContact";

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
