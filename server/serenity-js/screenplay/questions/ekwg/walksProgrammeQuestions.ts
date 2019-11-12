import { Question } from "@serenity-js/core";
import { Text } from "@serenity-js/protractor/lib/screenplay/questions/text";
import { SelectedValue } from "../../tasks/common/selected_value";
import { WalksProgrammeTargets } from "../../ui/ekwg/walksProgrammeTargets";

export class WalksProgrammeQuestions {
  public static QuickSearch: Question<Promise<string>> = Text.of(WalksProgrammeTargets.quickSearch);
  public static FilterCriteria: Question<Promise<string>> = SelectedValue.of(WalksProgrammeTargets.walksFilterCriteria);
  public static SortAscendingCriteria: Question<Promise<string>> = SelectedValue.of(WalksProgrammeTargets.walksSortAscendingCriteria);
  // public static AllWalks: Question<Promise<string[]>> = Text.ofAll(WalksProgrammeTargets.walks);
}
