import { Inject, Injectable } from "@angular/core";
import { clone, compact, isArray, isNil, last, omitBy, pick } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { ChangedItem } from "../../models/changed-item.model";
import { WalkDataAudit } from "../../models/walk-data-audit.model";
import { WalkEvent } from "../../models/walk-event.model";
import { Walk } from "../../models/walk.model";
import { AuditDeltaChangedItemsPipePipe } from "../../pipes/audit-delta-changed-items.pipe";
import { DateUtilsService } from "../date-utils.service";
import { Logger, LoggerFactory } from "../logger-factory.service";
import { StringUtilsService } from "../string-utils.service";
import { EventType, WalksReferenceService } from "./walks-reference-data.service";

const auditedFields = ["grade", "walkDate", "walkType", "startTime", "briefDescriptionAndStartPoint", "longerDescription",
  "distance", "nearestTown", "gridReference", "meetupEventUrl", "meetupEventTitle", "osMapsRoute", "osMapsTitle", "postcode",
  "walkLeaderMemberId", "contactPhone", "contactEmail", "contactId", "displayName",
  "ramblersWalkId", "ramblersPublish", "meetupPublish", "venue"];

@Injectable({
  providedIn: "root"
})
export class WalkEventService {
  private logger: Logger;

  constructor(
    @Inject("LoggedInMemberService") private loggedInMemberService,
    private dateUtils: DateUtilsService,
    private walksReferenceService: WalksReferenceService,
    private stringUtils: StringUtilsService,
    private auditDeltaChangedItems: AuditDeltaChangedItemsPipePipe,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalkEventService, NgxLoggerLevel.OFF);
  }

  public latestEventWithStatusChange(walk): WalkEvent {
    const eventType = this.eventsLatestFirst(walk).find((event) => {
      const walkEventType = this.walksReferenceService.toWalkEventType(event.eventType);
      return walkEventType && walkEventType.statusChange;
    });
    this.logger.debug("latestEventWithStatusChange:walk", walk._id, "eventType =>", eventType);
    return eventType;
  }

  public walkDataAuditFor(walk: Walk, status: EventType): WalkDataAudit {
    if (walk) {
      const currentData = this.currentDataValues(walk);
      const previousData = this.previousDataValues(walk);
      const changedItems = this.calculateChangedItems(currentData, previousData);
      const eventExists = this.latestEventWithStatusChangeIs(walk, status);
      const dataChanged = changedItems.length > 0;
      return {
        currentData,
        previousData,
        changedItems,
        eventExists,
        dataChanged,
        notificationRequired: dataChanged || !eventExists || this.latestEvent(walk).eventType === EventType.WALK_DETAILS_COPIED,
        eventType: dataChanged && eventExists ? this.walksReferenceService.walkEventTypeMappings.walkDetailsUpdated.eventType : status
      };
    }
  }

  public latestEventWithStatusChangeIs(walk, eventType) {
    if (!walk) {
      return false;
    }
    const walkEvent = this.latestEventWithStatusChange(walk);
    return walkEvent ? walkEvent.eventType === this.walksReferenceService.toEventType(eventType) : false;
  }

  public createEventIfRequired(walk: Walk, status: EventType, reason: string): WalkEvent {
    const walkDataAudit = this.walkDataAuditFor(walk, status);
    this.logger.debug("createEventIfRequired given status:", status, "walkDataAudit:", walkDataAudit);
    if (walkDataAudit.notificationRequired) {
      const event = {
        date: this.dateUtils.nowAsValue(),
        memberId: this.loggedInMemberService.loggedInMember().memberId,
        data: walkDataAudit.currentData,
        eventType: walkDataAudit.eventType
      } as WalkEvent;
      if (reason) {
        event.reason = reason;
      }
      if (walkDataAudit.dataChanged) {
        event.description = "Changed: " + this.auditDeltaChangedItems.transform(walkDataAudit.changedItems);
      }
      this.logger.debug("createEventIfRequired: event created:", event);
      return event;
    } else {
      this.logger.debug("createEventIfRequired: event creation not necessary");
    }
  }

  public writeEventIfRequired(walk: Walk, event: WalkEvent): void {
    if (event) {
      if (!isArray(walk.events)) {
        walk.events = [];
      }
      if (walk.events.includes(event)) {
        this.logger.warn("walk already contains event", event);
      } else {
        this.logger.debug("writing event", event);
        walk.events.push(event);
      }
    } else {
      this.logger.debug("no event to write");
    }
  }

  public latestEvent(walk): WalkEvent {
    return (walk.events && last(walk.events));
  }

  private compactObject(o) {
    return omitBy(o, isNil);
  }

  private currentDataValues(walk) {
    return this.compactObject(pick(walk, auditedFields));
  }

  private previousDataValues(walk: Walk) {
    const event: WalkEvent = this.latestEvent(walk);
    return event && event.data;
  }

  private eventsLatestFirst(walk: Walk) {
    return walk.events && clone(walk.events).reverse() || [];
  }

  private calculateChangedItems(currentData, previousData): ChangedItem[] {
    return compact(auditedFields.map((key) => {
      const currentValue = currentData[key];
      const previousValue = previousData && previousData[key];
      if (this.stringUtils.stringifyObject(previousValue) !== this.stringUtils.stringifyObject(currentValue)) {
        return {
          fieldName: key,
          previousValue,
          currentValue
        };
      }
    }));
  }

}
