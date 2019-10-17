import { Inject, Injectable } from "@angular/core";
import has from "lodash-es/has";
import { NgxLoggerLevel } from "ngx-logger";
import { MeetupConfig } from "../models/meetup-config.model";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { StringUtilsService } from "./string-utils.service";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private logger: Logger;

  constructor(@Inject("ConfigData") private configData, private stringUtilsService: StringUtilsService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ConfigService, NgxLoggerLevel.OFF);
  }

  getConfig(key, defaultOnEmpty?: object): Promise<MeetupConfig> {

    const queryObject = {};
    queryObject[key] = {$exists: true};
    return this.configData.query(queryObject, {limit: 1})
      .then((results) => {
        if (results && results.length > 0) {
          const result = results[0];
          this.logger.debug("getConfig:", key, "defaultOnEmpty:", defaultOnEmpty, "existing result", result);
          return result;
        } else {
          queryObject[key] = {};
          const result = new this.configData(defaultOnEmpty || queryObject);
          this.logger.debug("getConfig:", key, "defaultOnEmpty:", defaultOnEmpty, "new result", result);
          return result;
        }
      }, (response) => {
        throw new Error("Query of " + key + " config failed: " + response);
      });

  }

  saveConfig(key, config, saveCallback?, errorSaveCallback?) {
    return Promise.resolve().then(() => {
      this.logger.debug("saveConfig:", key, "config:", config);
      if (has(config, key)) {
        return config.$saveOrUpdate(saveCallback, saveCallback, errorSaveCallback || saveCallback, errorSaveCallback || saveCallback);
      } else {
        return Promise.reject("Attempt to save " + this.stringUtilsService.stringify(key) + " config when " + this.stringUtilsService.stringify(key) + " parent key not present in data: " + this.stringUtilsService.stringify(config));
      }
    });
  }

}
