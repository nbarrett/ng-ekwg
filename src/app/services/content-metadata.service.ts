import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import last from "lodash-es/last";
import { NgxLoggerLevel } from "ngx-logger";
import { DataQueryOptions } from "../models/api-request.model";
import { ContentMetadata, ContentMetadataApiResponse } from "../models/content-metadata.model";
import { CommonDataService } from "./common-data-service";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class ContentMetadataService {
  private S3_BASE_URL = "api/aws/s3";
  private BASE_URL = "api/database/content-metadata";
  private logger: Logger;

  constructor(private http: HttpClient,
              private commonDataService: CommonDataService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ContentMetadataService, NgxLoggerLevel.DEBUG);
  }

  baseUrl(metaDataPathSegment) {
    return `${this.S3_BASE_URL}/${metaDataPathSegment}`;
  }

  createNewMetaData(withDefaults) {
    if (withDefaults) {
      return {image: "(select file)", text: "(Enter title here)"};
    } else {
      return {};
    }
  }

  transform(contentMetaData: ContentMetadataApiResponse, contentMetaDataType: string): ContentMetadata {
    const files = contentMetaData.response.files.map(file => ({
      image: `${this.S3_BASE_URL}/${contentMetaDataType}/${last(file.image.split("/"))}`,
      text: file.text
    }));
    return {...contentMetaData.response, files};
  }

  async create(contentMetaData: ContentMetadata): Promise<ContentMetadata> {
    this.logger.debug("creating", contentMetaData);
    const apiResponse = await this.http.post<ContentMetadataApiResponse>(this.BASE_URL, contentMetaData).toPromise();
    this.logger.debug("created", contentMetaData, "- received", apiResponse);
    return apiResponse.response;
  }

  async update(contentMetaData: ContentMetadata): Promise<ContentMetadata> {
    this.logger.debug("updating", contentMetaData);
    const apiResponse = await this.http.put<ContentMetadataApiResponse>(this.BASE_URL + "/" + contentMetaData.id, contentMetaData).toPromise();
    this.logger.debug("updated", contentMetaData, "- received", apiResponse);
    return apiResponse.response;
  }

  async createOrUpdate(contentMetaData: ContentMetadata): Promise<ContentMetadata> {
    if (contentMetaData.id) {
      return this.update(contentMetaData);
    } else {
      return this.create(contentMetaData);
    }
  }

  async items(contentMetaDataType: string): Promise<ContentMetadata> {
    const options: DataQueryOptions = {criteria: {contentMetaDataType}};
    const params = this.commonDataService.toHttpParams(options);
    this.logger.debug("items:criteria:params", params.toString());
    const apiResponse = await this.http.get<ContentMetadataApiResponse>(this.BASE_URL, {params}).toPromise();
    const response = this.transform(apiResponse, contentMetaDataType);
    this.logger.debug("items:returning", response);
    return response;
  }
}
