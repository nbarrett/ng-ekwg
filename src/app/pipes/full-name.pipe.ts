import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: "fullName"})
export class FullNamePipe implements PipeTransform {
  transform(member, defaultValue?: string) {
    return member === undefined ? defaultValue || "(deleted member)" : (member.firstName + " " + member.lastName).trim();
  }
}
