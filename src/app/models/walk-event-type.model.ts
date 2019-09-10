import { EventType } from "../services/walks/walks-reference-data.service";

export interface WalkEventType {
  eventType: EventType;
  mustHaveLeader?: boolean;
  mustPassValidation?: boolean;
  showDetails?: boolean;
  readyToBe?: string;
  statusChange?: boolean;
  description: string;
  notifyLeader?: boolean;
  notifyCoordinator?: boolean;
}

export interface WalkEventNotificationMapping {
  eventType: EventType;
  notifyLeader?: object;
  notifyCoordinator?: object;
}
