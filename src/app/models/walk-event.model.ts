import { EventType } from "../services/walks-reference-data.service";

export interface WalkEvent {
  data: object;
  eventType: EventType;
  date: number;
  memberId: string;
  notes: string;
}

