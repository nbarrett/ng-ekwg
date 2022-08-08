import { Component, Input, OnInit } from "@angular/core";
import { kebabCase } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { TitleLine, TitlePart } from "./letterhead.component";

@Component({
  selector: "app-letterhead-title-part-config",
  styleUrls: ["./letterhead.component.sass"],
  template: `
    <div class="form-inline">
      <label class="mr-12" for="{{idPrefix}}-include">Part {{titlePart.part}}:</label>
      <input id="{{idPrefix}}-include" type="text" [(ngModel)]="titlePart.text" class="form-control">
      <div class="custom-control custom-radio custom-control-inline map-radio-label">
        <input id="{{idPrefix}}-green" type="radio"
               [(ngModel)]="titlePart.class"
               name="{{idPrefix}}colour"
               value="green"/>
        <label for="{{idPrefix}}-green">Green</label>
        <input id="{{idPrefix}}-white" type="radio"
               [(ngModel)]="titlePart.class"
               name="{{idPrefix}}colour"
               value="white"/>
        <label for="{{idPrefix}}-white">White</label>
        <input id="{{idPrefix}}-none" type="radio"
               [(ngModel)]="titlePart.class"
               name="{{idPrefix}}colour"
               value="none"/>
        <label for="{{idPrefix}}-none">None</label>
      </div>
    </div>`
})

export class LetterheadTitlePartConfigComponent implements OnInit {
  private logger: Logger;

  @Input()
  public titlePart: TitlePart;

  @Input()
  public titleLine: TitleLine;
  public idPrefix: string;

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(LetterheadTitlePartConfigComponent, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.logger.debug("ngOnInit");
    this.idPrefix = kebabCase(this.titleLine.name) + "-" + this.titlePart.part;
  }

}

