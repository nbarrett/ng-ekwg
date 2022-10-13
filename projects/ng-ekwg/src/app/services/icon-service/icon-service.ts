import { Injectable } from "@angular/core";
import * as icons from "@fortawesome/free-solid-svg-icons";
import map from "lodash-es/map";
import { NgxLoggerLevel } from "ngx-logger";
import { KeyValue } from "../enums";
import { Logger, LoggerFactory } from "../logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class IconService {
  private logger: Logger;
  public iconArray: KeyValue[] = [];
  public iconValues: any[] = [];
  public iconKeys: string[] = [];

  constructor(
    loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(IconService, NgxLoggerLevel.DEBUG);
    this.iconArray = map(icons, (value, key) => ({key, value}));
    this.iconValues = this.iconArray.map(item => item.value);
    this.iconKeys = this.iconArray.map(item => item.key);
    this.logger.debug("initialised with icons:", icons, this.iconArray, "values:", this.iconValues, "keys:", this.iconKeys);
  }

  iconForName(iconName: string): any {
    if (iconName) {
      const icon = this.iconArray.find(item => item?.value?.toLowerCase() === iconName?.toLowerCase());
      this.logger.info("for iconName:", iconName, "found:", icon);
      return icon?.key;
    }
  }
}
