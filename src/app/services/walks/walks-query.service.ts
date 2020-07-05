import { Injectable } from "@angular/core";
import { chain } from "../../functions/chain";
import { Walk } from "../../models/walk.model";
import { DateUtilsService } from "../date-utils.service";
import { WalkEventService } from "./walk-event.service";
import { EventType } from "./walks-reference-data.service";

@Injectable({
  providedIn: "root"
})

export class WalksQueryService {
  constructor(
    private walkEventsService: WalkEventService,
    private dateUtils: DateUtilsService) {
  }

  activeWalk(walk: Walk) {
    return !this.walkEventsService.latestEventWithStatusChangeIs(walk, EventType.DELETED);
  }

  activeWalks(walks: Walk[]) {
    return walks.filter(walk => this.activeWalk(walk));
  }

  nextWalkId(walks: Walk[]): string {
    const today = this.dateUtils.momentNowNoTime().valueOf();
    const nextWalk = chain(walks).sortBy("walkDate").find((walk: Walk) => today).value();
    return nextWalk && nextWalk.$id();
  }

}
