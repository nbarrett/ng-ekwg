import { PerformsTasks, Question, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { by } from "protractor";
import { BrowseTheWeb } from "serenity-js/lib/serenity-protractor";
import { SaveBrowserSource } from "../../tasks/common/saveBrowserSource";
import { ContactsTargets } from "../../ui/ramblers/contactsTargets";

export class Contact {
  constructor(public firstName: string,
              public lastName: string,
              public displayName: string,
              public email: string,
              public contactNumber: string) {
  }

}

export class ContactSummary extends Contact {
  constructor(public rowIndex: number,
              public firstName: string,
              public lastName: string,
              public displayName: string,
              public emailAddress: string,
              public contactNumber: string,
              public contactId: number) {
    super(firstName, lastName, displayName, emailAddress, contactNumber);
    this.rowIndex = rowIndex;
    this.contactId = contactId;
  }

}

export class ContactListing implements Question<PromiseLike<ContactSummary[]>> {

  static displayed = () => new ContactListing();

  answeredBy(actor: PerformsTasks & UsesAbilities): PromiseLike<ContactSummary[]> {

    const extractSummaryRow = (result, rowIndex) => {
      return result.all(by.css("[class^='col - ']")).getText()
        .then(columns => {
          const contactInfo = columns[4].split("\n");
          return ({
            rowIndex,
            firstName: columns[1],
            lastName: columns[2],
            displayName: columns[3],
            emailAddress: contactInfo[0],
            contactNumber: contactInfo[1],
            contactId: columns[5],
            checkboxTarget: ContactsTargets.checkboxSelector(rowIndex),
          });
        });
    };

    return actor.attemptsTo(
      SaveBrowserSource.toFile("html-contact-source.html"))
      .then(_ => {
          return BrowseTheWeb.as(actor).locateAll(
            ContactsTargets.contacts)
            .map((result, rowIndex) => extractSummaryRow(result, rowIndex)).then(results => {
              const [head, ...tail] = results;
              return tail;
            }) as PromiseLike<ContactSummary[]>;
        },
      );

  }

  toString = () => `displayed contacts`;

}
