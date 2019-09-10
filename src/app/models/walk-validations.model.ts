import { Walk } from "./walk.model";

export interface WalkValidations {
  walk: Walk;
  validationMessages: string[];
  publishedOnRamblers: boolean;
  selected: boolean;
}

