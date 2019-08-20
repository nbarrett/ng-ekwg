import { camelCase } from "lodash-es";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { NgxLoggerLevel } from "ngx-logger";
import { Injectable } from "@angular/core";
import { WalkEditMode } from "../models/walk-edit-mode.model";
import { WalkEventType } from "../models/walk-event-type.model";

@Injectable({
  providedIn: "root"
})

export class WalksReferenceService {

  private logger: Logger;

  walkEditModes = {
    add: {caption: "add", title: "Add new"} as WalkEditMode,
    edit: {caption: "edit", title: "Edit existing", editEnabled: true} as WalkEditMode,
    more: {caption: "more", title: "View"} as WalkEditMode,
    lead: {caption: "lead", title: "Lead this", initialiseWalkLeader: true} as WalkEditMode
  };

  eventTypes = {
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

  private eventTypesArray: WalkEventType[] = [
    this.eventTypes.awaitingLeader,
    this.eventTypes.awaitingWalkDetails,
    this.eventTypes.walkDetailsRequested,
    this.eventTypes.walkDetailsUpdated,
    this.eventTypes.walkDetailsCopied,
    this.eventTypes.awaitingApproval,
    this.eventTypes.approved,
    this.eventTypes.deleted
  ];

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalksReferenceService, NgxLoggerLevel.OFF);
  }

  toEventType(eventType: EventType | string): WalkEventType {
    if (eventType) {
      if (typeof eventType === "string") {
        if (eventType.includes(" ")) {
          eventType = camelCase(eventType.toLowerCase());
        }
      }
      const returnValue = this.eventTypesArray.find(e => e.eventType === eventType);
      if (!returnValue) {
        throw new Error("Event Type " + returnValue + " does not exist, given eventType " + eventType + ". Must be one of: " +
          this.eventTypesArray.map(e => e.eventType).join(", "));
      }
      return returnValue;
    }
  }

  walkStatuses(): WalkEventType[] {
    return this.eventTypesArray.filter((eventType) => eventType.statusChange);
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
}
