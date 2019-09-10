import { Inject, Pipe, PipeTransform } from "@angular/core";
import { map } from "lodash-es";
import { humanize } from "underscore.string";
import { Member } from "../models/member.model";
import { WalkEvent } from "../models/walk-event.model";
import { AuditDeltaValuePipe } from "./audit-delta-value.pipe";
import { FullNameWithAliasPipe } from "./full-name-with-alias.pipe";
import { FullNamePipe } from "./full-name.pipe";

@Pipe({name: "asChangedItemsTooltip"})
export class ChangedItemsPipe implements PipeTransform {
  constructor(@Inject("MemberService") private memberService,
              private fullNamePipe: FullNamePipe,
              private fullNameWithAliasPipe: FullNameWithAliasPipe,
              private auditDeltaValuePipe: AuditDeltaValuePipe) {
  }

  transform(event: WalkEvent, members: Member[]): string {
    return map(event.data, (value, key) => `${humanize(key)}: ${this.auditDeltaValuePipe.transform(value, key, members)}`)
      .join(", ");
  }
}
