import { Injectable } from "@angular/core";
import { WalkEventService } from "./walk-event.service";
import { EventType } from "./walks-reference-data.service";
import { chain } from "../../functions/chain";
import { Walk } from "../../models/walk.model";
import { DateUtilsService } from "../date-utils.service";

@Injectable({
  providedIn: "root"
})

export class WalksQueryService {
  constructor(
    private walkEventsService: WalkEventService,
    private dateUtils: DateUtilsService) {
  }

  activeWalks(walks: Walk[]) {
    return walks.filter(walk => !this.walkEventsService.latestEventWithStatusChangeIs(walk, EventType.DELETED));
  }

  nextWalkId(walks: Walk[]): string {
    const today = this.dateUtils.momentNowNoTime().valueOf();
    const nextWalk = chain(walks).sortBy("walkDate").find((walk: Walk) => today).value();
    return nextWalk && nextWalk.$id();
  }

}
