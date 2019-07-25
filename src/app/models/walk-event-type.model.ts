import { EventType } from "../services/walks-reference-data.service";

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
