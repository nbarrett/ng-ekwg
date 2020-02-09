import { Pipe, PipeTransform } from "@angular/core";
import { StringUtilsService } from "../services/string-utils.service";

@Pipe({name: "updatedAudit"})
export class UpdatedAuditPipe implements PipeTransform {

  constructor(private stringUtils: StringUtilsService) {
  }

  transform(resource, members) {
    return this.stringUtils.formatAudit(resource.updatedBy, resource.updatedDate, members);
  }
}
