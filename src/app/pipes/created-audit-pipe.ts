import { Pipe, PipeTransform } from "@angular/core";
import { StringUtilsService } from "../services/string-utils.service";

@Pipe({name: "createdAudit"})
export class CreatedAuditPipe implements PipeTransform {

  constructor(private stringUtils: StringUtilsService) {
  }

  transform(resource, members) {
    return this.stringUtils.formatAudit(resource.createdBy, resource.createdDate, members);
  }
}
