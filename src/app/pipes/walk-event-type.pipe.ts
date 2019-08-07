import { Pipe, PipeTransform } from "@angular/core";
import { WalksReferenceService } from "../services/walks-reference-data.service";

@Pipe({name: "walkEventType"})
export class WalkEventTypePipe implements PipeTransform {
  constructor(private walksReferenceService: WalksReferenceService) {
  }

  transform(eventTypeString: string, field: string) {
    const eventType = eventTypeString && this.walksReferenceService.toEventType(eventTypeString);
    return eventType && field ? eventType[field] : eventType;
  }

}
