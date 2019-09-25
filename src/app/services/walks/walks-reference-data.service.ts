import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { WalkAccessMode } from "../../models/walk-edit-mode.model";
import { WalkEventType } from "../../models/walk-event-type.model";
import { Logger, LoggerFactory } from "../logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class WalksReferenceService {

  static walkAccessModes = {
    view: {caption: "view", title: "View"} as WalkAccessMode,
    add: {caption: "add", title: "Add new"} as WalkAccessMode,
    edit: {caption: "edit", title: "Edit existing", walkWritable: true} as WalkAccessMode,
    lead: {caption: "lead", title: "Lead this", initialiseWalkLeader: true, walkWritable: true} as WalkAccessMode
  };

  private logger: Logger;

  walkEventTypeMappings = {
    awaitingLeader: {
      eventType: EventType.AWAITING_LEADER,
      statusChange: true,
      description: "Awaiting walk leader"
    } as WalkEventType,
    awaitingWalkDetails: {
      eventType: EventType.AWAITING_WALK_DETAILS,
      mustHaveLeader: true,
      statusChange: true,
      description: "Awaiting walk details from leader",
      notifyLeader: true,
      notifyCoordinator: true
    } as WalkEventType
    , walkDetailsRequested: {
      eventType: EventType.WALK_DETAILS_REQUESTED,
      mustHaveLeader: true,
      description: "Walk details requested from leader",
      notifyLeader: true,
      notifyCoordinator: true
    } as WalkEventType,
    walkDetailsUpdated: {
      eventType: EventType.WALK_DETAILS_UPDATED,
      description: "Walk details updated",
      notifyLeader: true,
      notifyCoordinator: true
    } as WalkEventType,
    walkDetailsCopied: {
      eventType: EventType.WALK_DETAILS_COPIED,
      description: "Walk details copied"
    },
    awaitingApproval: {
      eventType: EventType.AWAITING_APPROVAL,
      mustHaveLeader: true,
      mustPassValidation: true,
      statusChange: true,
      readyToBe: "approved",
      description: "Awaiting confirmation of walk details",
      notifyLeader: true,
      notifyCoordinator: true
    } as WalkEventType,
    approved: {
      eventType: EventType.APPROVED,
      mustHaveLeader: true,
      mustPassValidation: true,
      showDetails: true,
      statusChange: true,
      readyToBe: "published",
      description: "Approved",
      notifyLeader: true,
      notifyCoordinator: true
    } as WalkEventType,
    deleted: {
      eventType: EventType.DELETED,
      statusChange: true,
      description: "Deleted",
      notifyLeader: true,
      notifyCoordinator: true
    } as WalkEventType
  };

  private walkEventTypesArray: WalkEventType[] = [
    this.walkEventTypeMappings.awaitingLeader,
    this.walkEventTypeMappings.awaitingWalkDetails,
    this.walkEventTypeMappings.walkDetailsRequested,
    this.walkEventTypeMappings.walkDetailsUpdated,
    this.walkEventTypeMappings.walkDetailsCopied,
    this.walkEventTypeMappings.awaitingApproval,
    this.walkEventTypeMappings.approved,
    this.walkEventTypeMappings.deleted
  ];

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalksReferenceService, NgxLoggerLevel.OFF);
  }

  toWalkEventType(eventType: EventType | string): WalkEventType {
    if (eventType) {
      const returnValue = this.walkEventTypesArray.find(walkEventType => (walkEventType.eventType === eventType) || (walkEventType.description === eventType));
      if (!returnValue) {
        throw new Error("WalkEventType could not be resolved from eventType " + eventType + ". Must be one of: " +
          this.walkEventTypesArray.map(walkEventType => walkEventType.eventType).join(", "));
      }
      return returnValue;
    }
  }

  private isEventType(eventType: EventType | string): eventType is EventType {
    return (eventType as EventType) !== undefined;
  }

  toEventType(eventType: EventType | string): EventType {
    if (typeof eventType === "string") {
      return this.toWalkEventType(eventType).eventType;
    } else {
      return eventType;
    }
  }

  walkStatuses(): WalkEventType[] {
    return this.walkEventTypesArray.filter((eventType) => eventType.statusChange);
  }

  walkEventTypes(): WalkEventType[] {
    return this.walkEventTypesArray;
  }
}

export enum EventType {
  AWAITING_LEADER = "awaitingLeader",
  AWAITING_WALK_DETAILS = "awaitingWalkDetails",
  WALK_DETAILS_REQUESTED = "walkDetailsRequested",
  WALK_DETAILS_UPDATED = "walkDetailsUpdated",
  WALK_DETAILS_COPIED = "walkDetailsCopied",
  AWAITING_APPROVAL = "awaitingApproval",
  APPROVED = "approved",
  DELETED = "deleted",
  UNKNOWN = "unknown"
}
