import { Inject, Pipe, PipeTransform } from "@angular/core";
import { Member } from "../models/member.model";
import { FullNamePipe } from "./full-name.pipe";
import { FullNameWithAliasPipe } from "./full-name-with-alias.pipe";

@Pipe({name: "memberIdToFullName"})
export class MemberIdToFullNamePipe implements PipeTransform {
  constructor(@Inject("MemberService") private memberService,
              private fullNamePipe: FullNamePipe,
              private fullNameWithAliasPipe: FullNameWithAliasPipe) {
  }

  transform(memberId: string, members: Member[], defaultValue?: string, alias?: boolean) {
    const member = this.memberService.toMember(memberId, members);
    return alias ? this.fullNameWithAliasPipe.transform(member, defaultValue) : this.fullNamePipe.transform(member, defaultValue);
  }

}
