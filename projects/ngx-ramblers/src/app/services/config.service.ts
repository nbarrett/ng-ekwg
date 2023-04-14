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
    this.logger = loggerFactory.createLogger("ConfigService", NgxLoggerLevel.INFO);
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

  async query<T>(criteria?: DataQueryOptions): Promise<T> {
    this.logger.info("query:criteria", JSON.stringify(criteria));
    const params = this.commonDataService.toHttpParams(criteria);
    this.logger.info("query:params", params);
    const apiResponse = await this.http.get<ApiResponse>(this.BASE_URL, {params}).toPromise();
    this.logger.info("query - received", apiResponse);
    return apiResponse.response;
  }

  getConfig<T>(key: string, defaultOnEmpty?: object): Promise<T> {
    const criteria: any = {};
    criteria[key] = {$exists: true};
    return this.query<T>({criteria})
      .then((result) => {
        if (result) {
          this.logger.info("getConfig:", key, "existing result", result);
          return result;
        } else {
          criteria[key] = {};
          const result = defaultOnEmpty || criteria;
          this.logger.info("getConfig:", key, "defaultOnEmpty:", defaultOnEmpty, "new result", result);
          return result;
        }
      }).catch(error => {
        this.logger.error(`Query of ${key} config failed:`, error);
        return Promise.reject(`Query of ${key} config failed: ${error}`);
      });
  }

  saveConfig<T>(key, config: T) {
    this.logger.debug("saveConfig:", key, "config:", config);
    if (has(config, key)) {
      return this.createOrUpdate(config);
    } else {
      return Promise.reject(`Attempt to save ${this.stringUtilsService.stringify(key)} config when ${this.stringUtilsService.stringify(key)} parent key not present in data: ${this.stringUtilsService.stringify(config)}`);
    }
  }

}
