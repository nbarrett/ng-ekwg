import { FileSystem } from "@serenity-js/core/lib/io/file_system";
import { PerformsTasks, Task, UsesAbilities } from "serenity-js/lib/screenplay";

export class SummariseContacts implements Task {

  static toFile(results: Array<object>) {
    return new SummariseContacts(results);
  }

  performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
    console.log("Saving", this.results.length, "contacts");
    new FileSystem("./").store("all-contacts.json", JSON.stringify(this.results));
    return Promise.resolve();
  }

  constructor(private results: Array<object>) {
  }

}
