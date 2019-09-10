import { Pipe, PipeTransform } from "@angular/core";
import { humanize } from "underscore.string";

@Pipe({name: "humanise"})
export class HumanisePipe implements PipeTransform {

  transform(value: string) {
    return humanize(value);
  }

}
