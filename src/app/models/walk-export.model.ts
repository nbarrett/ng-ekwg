import { Walk } from "./walk.model";

export interface WalkExport {
  walk: Walk;
  validationMessages: [];
  publishedOnRamblers: boolean;
  selected: boolean;
}
