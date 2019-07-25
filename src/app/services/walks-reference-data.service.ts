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

  walkEditModes = {
    add: {caption: "add", title: "Add new"} as WalkEditMode,
    edit: {caption: "edit", title: "Edit existing", editEnabled: true} as WalkEditMode,
    more: {caption: "more", title: "View"} as WalkEditMode,
    lead: {caption: "lead", title: "Lead this", initialiseWalkLeader: true} as WalkEditMode
  };

  eventTypes: WalkEventType[] = [
    {
      eventType: EventType.AWAITING_LEADER,
      statusChange: true,
      description: "Awaiting walk leader"
    },
    {
      eventType: EventType.AWAITING_WALK_DETAILS,
      mustHaveLeader: true,
      statusChange: true,
      description: "Awaiting walk details from leader",
      notifyLeader: true,
      notifyCoordinator: true
    },
    {
      eventType: EventType.WALK_DETAILS_REQUESTED,
      mustHaveLeader: true,
      description: "Walk details requested from leader",
      notifyLeader: true,
      notifyCoordinator: true
    },
    {
      eventType: EventType.WALK_DETAILS_UPDATED,
      description: "Walk details updated",
      notifyLeader: true,
      notifyCoordinator: true
    },
    {
      eventType: EventType.WALK_DETAILS_COPIED,
      description: "Walk details copied"
    },
    {
      eventType: EventType.AWAITING_APPROVAL,
      mustHaveLeader: true,
      mustPassValidation: true,
      statusChange: true,
      readyToBe: "approved",
      description: "Awaiting confirmation of walk details",
      notifyLeader: true,
      notifyCoordinator: true
    },
    {
      eventType: EventType.APPROVED,
      mustHaveLeader: true,
      mustPassValidation: true,
      showDetails: true,
      statusChange: true,
      readyToBe: "published",
      description: "Approved",
      notifyLeader: true,
      notifyCoordinator: true
    },
    {
      eventType: EventType.DELETED,
      statusChange: true,
      description: "Deleted",
      notifyLeader: true,
      notifyCoordinator: true
    }];

  private;
  logger: Logger;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(WalksReferenceService, NgxLoggerLevel.OFF);
  }

  toEventType(eventType: EventType | string): WalkEventType {
    if (eventType) {
      if (eventType.includes(" ")) {
        eventType = camelCase(eventType.toLowerCase());
      }
      const returnValue = this.eventTypes.find(e => e.eventType === eventType);
      if (!returnValue) {
        throw new Error("Event Type " + returnValue + " does not exist. Must be one of: " +
          this.eventTypes.map(e => e.eventType).join(", "));
      }
      return returnValue;
    }
  }

  walkStatuses() {
    return this.eventTypes.filter((eventType) => eventType.statusChange);
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

