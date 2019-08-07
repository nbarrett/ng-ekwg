import { Inject, Pipe, PipeTransform } from "@angular/core";
import { WalkEvent } from "../models/walk-event.model";
import { Member } from "../models/member.model";
import { map } from "lodash-es";
import { humanize } from "underscore.string";
import { FullNamePipe } from "./full-name.pipe";
import { AuditDeltaValuePipe } from "./audit-delta-value.pipe";
import { FullNameWithAliasPipe } from "./full-name-with-alias.pipe";

@Pipe({name: "asChangedItemsTooltip"})
export class ChangedItemsPipe implements PipeTransform {
  constructor(@Inject("MemberService") private memberService,
              private fullNamePipe: FullNamePipe,
              private fullNameWithAliasPipe: FullNameWithAliasPipe,
              private auditDeltaValuePipe: AuditDeltaValuePipe) {
  }

  transform(event: WalkEvent, members: Member[]) {
    return map(event.data, (value, key) => `${humanize(key)}: ${this.auditDeltaValuePipe.transform(value, key, members)}`)
      .join(", ");
  }
}
