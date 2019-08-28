import { FileSystem } from "@serenity-js/core/lib/io/file_system";
import { Interaction, UsesAbilities } from "@serenity-js/core/lib/screenplay";
import { by, protractor } from "protractor";
import { PerformsTasks, Task } from "serenity-js/lib/screenplay";

export class SaveBrowserSource implements Interaction {

    static toFile(relativePathToFile: any) {
        return new SaveBrowserSource(relativePathToFile);
    }

    constructor(public relativePathToFile: any) {
    };

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return protractor.browser.getPageSource()
            .then((htmlSource: string) => {
                new FileSystem("./").store(this.relativePathToFile, htmlSource);
            });
    }

}
