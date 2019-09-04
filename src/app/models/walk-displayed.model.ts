import { WalkEditMode } from "./walk-edit-mode.model";
import { WalkEventType } from "./walk-event-type.model";
import { Walk } from "./walk.model";

export interface DisplayedWalk {
  walk: Walk;
  walkEditMode: WalkEditMode;
  latestEventType?: WalkEventType;
  walkLink?: string;
  ramblersLink?: string;
}

