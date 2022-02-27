import { Injectable } from "@angular/core";
import { PopoverDirective } from "ngx-bootstrap/popover";

@Injectable({
  providedIn: "root"
})

export class ClipboardService {

  public copyToClipboard(item: string, pop: PopoverDirective): void {
    if (item) {
      const listener = (e: ClipboardEvent) => {
        const clipboard = e.clipboardData || window["clipboardData"];
        clipboard.setData("text", item);
        e.preventDefault();
        pop.show();
      };

      document.addEventListener("copy", listener, false);
      document.execCommand("copy");
      document.removeEventListener("copy", listener, false);
    }
  }
}
