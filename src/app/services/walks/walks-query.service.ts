import { Injectable } from "@angular/core";
import { chain } from "../../functions/chain";
import { EventType, Walk } from "../../models/walk.model";
import { DateUtilsService } from "../date-utils.service";
import { WalkEventService } from "./walk-event.service";

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

  deletedWalk(walk: Walk) {
    return this.walkEventsService.latestEventWithStatusChangeIs(walk, EventType.DELETED);
  }

  activeWalks(walks: Walk[]) {
    return walks.filter(walk => this.activeWalk(walk));
  }

  deletedWalks(walks: Walk[]) {
    return walks.filter(walk => this.deletedWalk(walk));
  }

  nextWalkId(walks: Walk[]): string {
    const today = this.dateUtils.momentNowNoTime().valueOf();
    const nextWalk: Walk = chain(walks).sortBy("walkDate").find((walk: Walk) => walk.walkDate === today).value();
    return nextWalk && nextWalk.id;
  }

}
