import { Question } from "@serenity-js/core";
import { Text } from "@serenity-js/protractor";
import { WalksTargets } from "../../ui/ramblers/walksTargets";

export class WalksAndEventsManagerQuestions {
  public static LoginStatus: Question<Promise<string>> = Text.of(WalksTargets.loginStatus);
}
