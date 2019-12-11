import { EventType } from "../services/walks/walks-reference-data.service";
import { WalkDataAudit } from "./walk-data-audit.model";
import { WalkEvent } from "./walk-event.model";
import { Walk } from "./walk.model";

export interface WalkNotification {
  walk: Walk;
  status: EventType;
  event: WalkEvent;
  dataAuditDelta: WalkDataAudit;
  validationMessages: string[];
  reason?: string;
}
