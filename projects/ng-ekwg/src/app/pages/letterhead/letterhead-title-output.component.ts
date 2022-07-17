import { Component, Input } from "@angular/core";
import { TitleLine } from "./letterhead.component";

@Component({
  selector: "app-letterhead-title-output",
  styleUrls: ["./letterhead.component.sass"],
  template: `<p *ngIf="titleLine.include" class="title"><img class="text-icon" [ngClass]="{'none': !titleLine.showIcon}"
                     src="/images/ramblers/icon-{{titleLine.iconType}}.png"/>
    <span class="ml-2 {{titleLine.part1.class}}">{{titleLine.part1.text}}</span>
    <span class="ml-2 {{titleLine.part2.class}}">{{titleLine.part2.text}}</span>
    <span class="ml-2 {{titleLine.part3.class}}">{{titleLine.part3.text}}</span></p>
  `
})

export class LetterheadTitleOutputComponent {
  @Input()
  public titleLine: TitleLine;
}


