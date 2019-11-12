import { Interaction, UsesAbilities } from "@serenity-js/core";
import { BrowseTheWeb } from "@serenity-js/protractor";

export class ResizeBrowserWindow {
  static toMaximum = (): Interaction => new MaximiseBrowserWindow();
  static to = (width: number, height: number): Interaction => new SetBrowserWindowSize(width, height);
}

class MaximiseBrowserWindow implements Interaction {
  performAs(actor: UsesAbilities): Promise<void> {
    return BrowseTheWeb.as(actor).manage().window().maximize() as Promise<void>;
  }

  toString = () => `#actor maximises the browser window`;
}

class SetBrowserWindowSize implements Interaction {
  constructor(private width: number, private height: number) {
  }

  performAs(actor: UsesAbilities): Promise<void> {
    return BrowseTheWeb.as(actor).manage().window().setSize(this.width, this.height) as Promise<void>;
  }

  toString = () => `#acto sets the size of the browser window to ${this.width} x ${this.height}`;
}
