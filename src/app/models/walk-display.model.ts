import { WalkEditMode } from "./walk-edit-mode.model";
import { WalkEventType } from "./walk-event-type.model";
import { Walk } from "./walk.model";

export interface WalkDisplay {
  walk: Walk;
  latestEventType: WalkEventType;
  walkEditMode: WalkEditMode;
  walkLink: string;
  ramblersLink: string;
}

