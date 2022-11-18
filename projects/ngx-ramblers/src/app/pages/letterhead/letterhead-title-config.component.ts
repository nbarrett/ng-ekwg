import { Component, Input, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../../services/logger-factory.service";
import { TitleLine } from "./letterhead.component";

@Component({
  selector: "app-letterhead-title-config",
  styleUrls: ["./letterhead.component.sass"],
  template: `
    <div class="img-thumbnail ml-2 p-4">
      <div class="row">
        <div class="col-sm-12">
          <h4><div class="custom-control custom-checkbox">
            <input class="custom-control-input"
                   [(ngModel)]="titleLine.include"
                   type="checkbox"
                   id="show-title-{{titleLine.name}}">
            <label class="custom-control-label"
                   for="show-title-{{titleLine.name}}">{{titleLine.name}}</label>
          </div></h4>
          <div class="form-inline">
            <div class="custom-control custom-checkbox">
              <input class="custom-control-input"
                     [(ngModel)]="titleLine.showIcon" type="checkbox" id="show-icon-{{titleLine.name}}">
              <label class="custom-control-label"
                     for="show-icon-{{titleLine.name}}">Prefix with icon: <select [(ngModel)]="titleLine.iconType" class="form-control ml-2">
                <option *ngFor="let iconType of iconTypes" [ngValue]="iconType">{{iconType}}</option>
              </select>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
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
    "ramblers_icon_10_play_rgb",
    "ramblers_icon_11_home_rgb",
    "ramblers_icon_12_cursor_rgb",
    "ramblers_icon_13_mail_rgb",
    "ramblers_icon_14_chat_rgb",
    "ramblers_icon_15_copyright_rgb",
    "ramblers_icon_16_quote_start_rgb",
    "ramblers_icon_17_quote_end_rgb",
    "ramblers_icon_18_location_rgb",
    "ramblers_icon_19_tree_rgb",
    "ramblers_icon_1_search_magnifying_glass_rgb",
    "ramblers_icon_20_gate_rgb",
    "ramblers_icon_21_signpost_rgb",
    "ramblers_icon_22_foot_print_rgb",
    "ramblers_icon_23_hat_rgb",
    "ramblers_icon_24_sun_rgb",
    "ramblers_icon_25_rain_rgb",
    "ramblers_icon_2_arrow_forward_rgb",
    "ramblers_icon_3_arrow_back_rgb",
    "ramblers_icon_4_arrow_up_rgb",
    "ramblers_icon_5_arrow_down_rgb",
    "ramblers_icon_6_menu_rgb",
    "ramblers_icon_7_information_rgb",
    "ramblers_icon_8_tick_rgb",
    "ramblers_icon_9_close_x_rgb",
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

