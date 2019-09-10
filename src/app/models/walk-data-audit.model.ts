import { EventType } from "../services/walks/walks-reference-data.service";
import { ChangedItem } from "./changed-item.model";

export interface WalkDataAudit {
  eventExists: boolean;
  notificationRequired: boolean;
  changedItems: ChangedItem[];
  dataChanged: boolean;
  eventType: EventType;
  currentData: object;
  previousData: object;
}
