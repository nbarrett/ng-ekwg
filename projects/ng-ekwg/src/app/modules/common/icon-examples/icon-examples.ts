import { Component, OnInit } from "@angular/core";
import * as icons from "@fortawesome/free-solid-svg-icons";
import map from "lodash-es/map";
import { NgxLoggerLevel } from "ngx-logger";
import { ClipboardService } from "../../../services/clipboard.service";
import { Logger, LoggerFactory } from "../../../services/logger-factory.service";

interface IconName {
  key: any;
  value: any;
}

@Component({
  selector: "app-icon-examples",
  templateUrl: "./icon-examples.html",
  styleUrls: ["./icon-examples.sass"],
})

export class IconExamplesComponent implements OnInit {

  private logger: Logger;
  public iconArray: IconName[] = [];
  public filteredIcons: IconName[] = [];
  iconValues: string[];
  filter: string;

  constructor(
    private clipboardService: ClipboardService,
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(IconExamplesComponent, NgxLoggerLevel.DEBUG);
  }

  ngOnInit() {
    this.logger.debug("initialised with icons:");
    this.iconArray = map(icons, (key, value) => ({key, value}));
    this.logger.debug("initialised with icons:", this.iconArray);
    this.iconValues = this.iconArray.map(item => item.value);
    this.filteredIcons = [];
  }

  modelChanged(data: string) {
    this.logger.debug("modelChanged:", data);
    this.filteredIcons = this.iconArray.filter(item => item?.value?.toLowerCase().includes(data?.toLowerCase()));
  }

  change($event: Event) {
    this.logger.debug("changed:", $event);
  }
}
