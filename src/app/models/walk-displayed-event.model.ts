import { WalkEventType } from "./walk-event-type.model";

export interface DisplayedEvent {
  member: string;
  date: string;
  eventType: string;
  changedItems: string;
  notes?: string;
}

