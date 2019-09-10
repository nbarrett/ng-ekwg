import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "valueOrDefault"})
export class ValueOrDefaultPipe implements PipeTransform {

  transform(value, defaultValue?: string) {
    return value || defaultValue || "(none)";
  }

}
