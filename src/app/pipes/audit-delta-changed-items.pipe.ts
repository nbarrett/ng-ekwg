import { Pipe, PipeTransform } from "@angular/core";
import { humanize } from "underscore.string";
import { ChangedItem } from "../models/changed-item.model";

@Pipe({name: "toAuditDeltaChangedItems"})
export class AuditDeltaChangedItemsPipePipe implements PipeTransform {

  transform(changedItems: ChangedItem[]): string {
    return changedItems.map(item => humanize(item.fieldName)).join(", ");
  }
}
