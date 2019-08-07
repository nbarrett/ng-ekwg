import { Inject, Pipe, PipeTransform } from "@angular/core";
import { FullNamePipe } from "./full-name.pipe";
import { Member } from "../models/member.model";

@Pipe({name: "fullNameWithAliasOrMe"})
export class FullNameWithAliasOrMePipe implements PipeTransform {
  constructor(
    @Inject("LoggedInMemberService") private loggedInMemberService,
    private fullNamePipe: FullNamePipe) {
  }

  transform(member: Member, defaultValue?: string) {
    return member ? (this.loggedInMemberService.loggedInMember().memberId === member.$id() ? "Me" :
      `${this.fullNamePipe.transform(member, defaultValue)}${member.nameAlias ? " (" + member.nameAlias + ")" : ""}`) : defaultValue;
  }
}
