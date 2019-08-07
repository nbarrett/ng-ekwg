import { Pipe, PipeTransform } from "@angular/core";
import { FullNamePipe } from "./full-name.pipe";
import { Member } from "../models/member.model";

@Pipe({name: "fullNameWithAlias"})
export class FullNameWithAliasPipe implements PipeTransform {
  constructor(private fullNamePipe: FullNamePipe) {

  }

  transform(member: Member, defaultValue?: string) {
    const alias = member.nameAlias ? " (" + member.nameAlias + ")" : "";
    return member ? this.fullNamePipe.transform(member, defaultValue) + alias : defaultValue;
  }
}
