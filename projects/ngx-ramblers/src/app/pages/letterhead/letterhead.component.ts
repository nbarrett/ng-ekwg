import { Component, OnInit } from "@angular/core";
import range from "lodash-es/range";
import { NgxLoggerLevel } from "ngx-logger";
import { LogoFileData, SystemConfigResponse } from "../../models/system.model";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { SystemConfigService } from "../../services/system/system-config.service";

@Component({
  selector: "app-letterhead",
  styleUrls: ["./letterhead.component.sass"],
  template: `
    <app-page>
      <div class="row">
        <div class="col-sm-12">
          <h1 class="mb-2 ml-2 mt-3">Configure letterheads</h1>
          <div class="row">
            <div class="col-sm-6">
              <app-letterhead-title-config [titleLine]="line1"></app-letterhead-title-config>
            </div>
            <div class="col-sm-6">
              <app-letterhead-title-config [titleLine]="line2"></app-letterhead-title-config>
            </div>
            <div class="col-sm-12">
              <app-letterhead-logo-config (logoChange)="selectLogo($event)"
                                          (logoWidthChange)="selectLogoWidth($event)"
                                          (fontSizeChange)="selectFontSize($event)"
              ></app-letterhead-logo-config>
            </div>
          </div>
        </div>
        <div class="col-sm-12">
          <header>
            <div class="row d-flex align-items-center text-center">
              <div [class]="columnsLogo()">
                <app-letterhead-logo [logo]="logo"></app-letterhead-logo>
              </div>
              <div [class]="columnsHeading()">
                <app-letterhead-title-output [titleLine]="line1" [fontSize]="fontSize"></app-letterhead-title-output>
                <app-letterhead-title-output [titleLine]="line2" [fontSize]="fontSize"></app-letterhead-title-output>
              </div>
              <div class="col-sm-2">
              </div>
            </div>
          </header>
        </div>
      </div>
    </app-page>`
})

export class LetterheadComponent implements OnInit {
  private logger: Logger;
  public showIcon = true;
  private config: SystemConfigResponse;
  public logo: LogoFileData;
  public logoWidth: number;
  public fontSize: number;
  public line1: TitleLine;

  public line2: TitleLine = {
    name: "Second Line",
    include: true,
    showIcon: true,
    iconType: "ramblers_icon_19_tree_rgb",
    part1: {part: 1, text: "Walk", class: "white"},
    part2: {part: 2, text: "Leader", class: "green"},
    part3: {part: 3, text: "Notification", class: "white"},
  };

  columnsLogo(): string {
    return "col-sm-" + this.logoWidth;
  }

  columnsHeading(): string {
    return `col-sm-${12 - this.logoWidth}`;
  }

  constructor(private systemConfigService: SystemConfigService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LetterheadComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.systemConfigService.events()
      .subscribe((config: SystemConfigResponse) => {
        this.config = config;
        this.logger.info("retrieved config", config);
        const groupWords: string[] = this.config.system.group.longName.split(" ");
        this.line1 = {
          name: "First Line",
          include: true,
          showIcon: false,
          iconType: "ramblers_icon_11_home_rgb",
          part1: {part: 1, text: this.wordsFor(0, 1, groupWords), class: "white"},
          part2: {part: 2, text: this.wordsFor(1, 1, groupWords), class: "green"},
          part3: {part: 3, text: this.wordsFor(2, null, groupWords), class: "white"},
        };
      });
    this.logoWidth = 6;
  }

  private wordsFor(indexFrom: number, indexTo: number, words: string[]) {
    const toIndex = indexTo ? indexFrom + indexTo : words.length;
    const indexRange = range(indexFrom, toIndex);
    const returnValue = words.length < 1 ? "Some Text" : indexRange.map(index => words[index]).join(" ");
    this.logger.info("wordsFor:indexFrom", indexFrom, "indexTo:", indexTo, "indexRange:", indexRange, "words:", words, "returnValue:", returnValue);
    return returnValue;
  }

  selectLogo(logoFileData: LogoFileData) {
    this.logo = logoFileData;
  }

  selectLogoWidth(logoFileData: number) {
    this.logoWidth = logoFileData;
  }

  selectFontSize(fontSize: number) {
    this.fontSize = fontSize;
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
