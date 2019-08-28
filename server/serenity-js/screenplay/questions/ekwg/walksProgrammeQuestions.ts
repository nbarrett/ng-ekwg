import {Question, SelectedValue, Text, Value} from "serenity-js/lib/screenplay-protractor";
import {WalksProgrammeTargets} from "../../ui/ekwg/walksProgrammeTargets";

export class WalksProgrammeQuestions {
    public static QuickSearch: Question<PromiseLike<string>> = Text.of(WalksProgrammeTargets.quickSearch);
    public static FilterCriteria: Question<PromiseLike<string>> = SelectedValue.of(WalksProgrammeTargets.walksFilterCriteria);
    public static SortAscendingCriteria: Question<PromiseLike<string>> = SelectedValue.of(WalksProgrammeTargets.walksSortAscendingCriteria);
    public static AllWalks: Question<PromiseLike<string[]>> = Text.ofAll(WalksProgrammeTargets.walks);
}
