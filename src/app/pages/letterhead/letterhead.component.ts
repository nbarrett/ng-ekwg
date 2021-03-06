import { Component, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";

@Component({
  selector: "app-letterhead",
  styleUrls: ["./letterhead.component.sass"],
  template: `
    <div class="row">
      <div class="col-sm-4">
          <h1 class="mb-12 ml-12 mt-12">Configure letterhead</h1>
          <app-letterhead-title-config [titleLine]="line1"></app-letterhead-title-config>
          <app-letterhead-title-config [titleLine]="line2"></app-letterhead-title-config>
      </div>
      <div class="col-sm-8">
        <header class="narrow narrow-margin">
          <div class="header-inner">
            <div class="row">
              <div class="col-sm-2">
                <app-main-logo></app-main-logo>
              </div>
              <div class="col-sm-8">
                <div class="centred" [ngClass]="{'second-line': line2.include}">
                  <app-letterhead-title-output [titleLine]="line1"></app-letterhead-title-output>
                  <app-letterhead-title-output [titleLine]="line2"></app-letterhead-title-output>
                </div>
              </div>
              <div class="col-sm-2">
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>`
})

export class LetterheadComponent implements OnInit {
  private logger: Logger;
  public showIcon = true;

  public line1: TitleLine = {
    name: "First Line",
    include: true,
    showIcon: false,
    iconType: "members",
    part1: {part: 1, text: "East Kent", class: "white"},
    part2: {part: 2, text: "Walking", class: "green"},
    part3: {part: 3, text: "Group", class: "white"},
  };

  public line2: TitleLine = {
    name: "Second Line",
    include: true,
    showIcon: true,
    iconType: "members",
    part1: {part: 1, text: "Walk", class: "white"},
    part2: {part: 2, text: "Leader", class: "green"},
    part3: {part: 3, text: "Notification", class: "white"},
  };

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LetterheadComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
  }

}

export interface TitleLine {
  name: string;
  include: boolean;
  showIcon: boolean;
  iconType?: string;
  part1: TitlePart;
  part2: TitlePart;
  part3: TitlePart;
}

export interface TitlePart {
  part: number;
  text: string;
  class: string;
}
