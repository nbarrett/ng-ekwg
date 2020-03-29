import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import has from "lodash-es/has";
import { NgxLoggerLevel } from "ngx-logger";
import { DataQueryOptions } from "../models/api-request.model";
import { ApiResponse } from "../models/api-response.model";
import { CommonDataService } from "./common-data-service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { StringUtilsService } from "./string-utils.service";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private BASE_URL = "/api/database/config";
  private logger: Logger;

  constructor(private http: HttpClient,
              private commonDataService: CommonDataService,
              private stringUtilsService: StringUtilsService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ConfigService, NgxLoggerLevel.INFO);
  }

  async create(config: any): Promise<any> {
    this.logger.debug("creating", config);
    const apiResponse = await this.http.post<{ response: any }>(this.BASE_URL, config).toPromise();
    this.logger.debug("created", config, "received:", apiResponse);
    return apiResponse.response;
  }

  async update(config: any): Promise<any> {
    this.logger.debug("updating", config);
    const apiResponse = await this.http.put<{ response: any }>(this.BASE_URL + "/" + config.id, config).toPromise();
    this.logger.debug("updated", config, "received:", apiResponse);
    return apiResponse.response;
  }

  async createOrUpdate(config: any): Promise<any> {
    if (config.id) {
      return this.update(config);
    } else {
      return this.create(config);
    }
  }

  async query(criteria?: DataQueryOptions): Promise<any[]> {
    this.logger.debug("query:criteria", JSON.stringify(criteria));
    const params = this.commonDataService.toHttpParams(criteria);
    this.logger.debug("query:params", params);
    const apiResponse = await this.http.get<ApiResponse>(this.BASE_URL, {params}).toPromise();
    this.logger.debug("query - received", apiResponse);
    return apiResponse.response;
  }

  getConfig(key, defaultOnEmpty?: object): Promise<any> {
    const criteria: any = {};
    criteria[key] = {$exists: true};
    return this.query({criteria})
      .then((result) => {
        if (result) {
          this.logger.debug("getConfig:", key, "defaultOnEmpty:", defaultOnEmpty, "existing result", result);
          return result;
        } else {
          criteria[key] = {};
          const result = defaultOnEmpty || criteria;
          this.logger.debug("getConfig:", key, "defaultOnEmpty:", defaultOnEmpty, "new result", result);
          return result;
        }
      }, (response) => {
        return Promise.reject("Query of " + key + " config failed: " + response);
      });

  }

  saveConfig(key, config: any) {
    this.logger.debug("saveConfig:", key, "config:", config);
    if (has(config, key)) {
      return this.createOrUpdate(config);
    } else {
      return Promise.reject(`Attempt to save ${this.stringUtilsService.stringify(key)} config when ${this.stringUtilsService.stringify(key)} parent key not present in data: ${this.stringUtilsService.stringify(config)}`);
    }
  }

}
