import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { ContentText } from "../models/content-text.model";
import { Logger, LoggerFactory } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class ContentTextService {
  private logger: Logger;
  private BASE_URL = "/api/database/content-text";

  constructor(private http: HttpClient, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ContentTextService, NgxLoggerLevel.INFO);
  }

  async all(): Promise<ContentText[]> {
    const apiResponse = await this.http.get<{ response: ContentText[] }>(this.BASE_URL).toPromise();
    this.logger.debug("all - received", apiResponse);
    return apiResponse.response;
  }

  async findByName(name): Promise<ContentText> {
    const apiResponse = await this.http.get<{ response: ContentText }>(this.BASE_URL + "/name/" + name).toPromise();
    this.logger.debug("forName", name, "- received", apiResponse);
    return apiResponse.response;
  }

  async filterByCategory(category): Promise<ContentText[]> {
    const apiResponse = await this.http.get<{ response: ContentText[] }>(this.BASE_URL + "/category/" + category).toPromise();
    this.logger.debug("forName", category, "- received", apiResponse);
    return apiResponse.response;
  }

  async create(contentText: ContentText): Promise<ContentText> {
    this.logger.debug("creating", contentText);
    const apiResponse = await this.http.post<{ response: ContentText }>(this.BASE_URL, contentText).toPromise();
    this.logger.debug("created", contentText, "- received", apiResponse);
    return apiResponse.response;
  }

  async update(contentText: ContentText): Promise<ContentText> {
    this.logger.debug("updating", contentText);
    const apiResponse = await this.http.put<{ response: ContentText }>(this.BASE_URL + "/" + contentText.id, contentText).toPromise();
    this.logger.debug("updated", contentText, "- received", apiResponse);
    return apiResponse.response;
  }

  async createOrUpdate(contentText: ContentText): Promise<ContentText> {
    if (contentText.id) {
      return this.update(contentText);
    } else {
      return this.create(contentText);
    }
  }

  async delete(contentText: ContentText): Promise<ContentText> {
    const apiResponse = await this.http.delete<{ response: ContentText }>(this.BASE_URL + "/" + contentText.id).toPromise();
    this.logger.debug("delete", contentText, "- received", apiResponse);
    return apiResponse.response;
  }

}
