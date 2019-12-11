import { Inject, Pipe, PipeTransform } from "@angular/core";
import { MemberLoginService } from "../services/member-login.service";
import { FullNamePipe } from "./full-name.pipe";
import { Member } from "../models/member.model";

@Pipe({name: "fullNameWithAliasOrMe"})
export class FullNameWithAliasOrMePipe implements PipeTransform {
  constructor(
    private memberLoginService: MemberLoginService,
    private fullNamePipe: FullNamePipe) {
  }

  transform(member: Member, defaultValue?: string) {
    return member ? (this.memberLoginService.loggedInMember().memberId === member.$id() ? "Me" :
      `${this.fullNamePipe.transform(member, defaultValue)}${member.nameAlias ? " (" + member.nameAlias + ")" : ""}`) : defaultValue;
  }
}
