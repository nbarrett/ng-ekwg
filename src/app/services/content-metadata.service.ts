import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import last from "lodash-es/last";
import { NgxLoggerLevel } from "ngx-logger";
import { DataQueryOptions } from "../models/api-request.model";
import { ContentMetadata, ContentMetadataApiResponse, ContentMetadataItem, S3Metadata } from "../models/content-metadata.model";
import { CommonDataService } from "./common-data-service";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})

export class ContentMetadataService {
  private S3_BASE_URL = "api/aws/s3";
  private S3_METADATA_URL = "/api/aws/metadata/list-objects";
  private BASE_URL = "api/database/content-metadata";
  private logger: Logger;

  constructor(private http: HttpClient,
              private commonDataService: CommonDataService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ContentMetadataService, NgxLoggerLevel.OFF);
  }

  baseUrl(metaDataPathSegment: string) {
    return `${this.S3_BASE_URL}/${metaDataPathSegment}`;
  }

  createNewMetaData(withDefaults): ContentMetadataItem {
    if (withDefaults) {
      return {image: "(select file)", text: "(Enter title here)"};
    } else {
      return {};
    }
  }

  transformFiles(contentMetaData: ContentMetadataApiResponse, contentMetaDataType: string): ContentMetadata {
    return {
      ...contentMetaData.response, files: contentMetaData.response.files.map(file => ({
        ...file, image: `${this.S3_BASE_URL}/${contentMetaDataType}/${last(file.image.split("/"))}`
      }))
    };
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
    const apiResponse: ContentMetadataApiResponse = await this.http.get<ContentMetadataApiResponse>(this.BASE_URL, {params}).toPromise();
    const response = this.transformFiles(apiResponse, contentMetaDataType);
    this.logger.debug("items:transformed apiResponse", response);
    return response;
  }

  async listMetaData(prefix: string): Promise<S3Metadata[]> {
    const apiResponse = await this.http.get<S3Metadata[]>(this.S3_METADATA_URL + "/" + prefix).toPromise();
    this.logger.debug("listMetaData:prefix", prefix, "returning", apiResponse.length, "S3Metadata items");
    return apiResponse;
  }
}
