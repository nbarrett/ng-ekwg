import { Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { TitleLine } from "./letterhead.component";

@Component({
  selector: "app-letterhead-title-config",
  styleUrls: ["./letterhead.component.sass"],
  template: `
    <div class="img-thumbnail ml-12">
      <h4>
        <span class="checkbox-group form-inline">
      <label [ngClass]="{'ui-state-active': titleLine.include}"
             for="show-title-{{titleLine.name}}">{{titleLine.name}}<input [(ngModel)]="titleLine.include" type="checkbox" id="show-title-{{titleLine.name}}">
      </label>
      </span>
      </h4>
      <div class="row">
        <div class="col-sm-12">
          <div class="checkbox-group form-inline">
            <label [ngClass]="{'ui-state-active': titleLine.showIcon}"
                   for="show-icon-{{titleLine.name}}">Prefix with <select [(ngModel)]="titleLine.iconType" class="form-control">
              <option *ngFor="let iconType of iconTypes" [ngValue]="iconType">{{iconType}}</option>
            </select> icon <input [(ngModel)]="titleLine.showIcon" type="checkbox" id="show-icon-{{titleLine.name}}">
            </label>
          </div>
          <app-letterhead-title-part-config [titleLine]="titleLine" [titlePart]="titleLine.part1"></app-letterhead-title-part-config>
          <app-letterhead-title-part-config [titleLine]="titleLine" [titlePart]="titleLine.part2"></app-letterhead-title-part-config>
          <app-letterhead-title-part-config [titleLine]="titleLine" [titlePart]="titleLine.part3"></app-letterhead-title-part-config>
        </div>
      </div>
    </div>
  `
})

export class LetterheadTitleConfigComponent implements OnInit {
  private logger: Logger;
  public iconTypes = [
    "getinvolved",
    "gowalking",
    "members",
    "volunteer",
    "supportus",
    "findroute",
  ];
  public iconType: string = this.iconTypes[0];
  @Input()
  public titleLine: TitleLine;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LetterheadTitleConfigComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    if (!this.titleLine.iconType) {
      this.titleLine.iconType = this.iconTypes[0];
    }
  }

}

