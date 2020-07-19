import { Injectable } from "@angular/core";
import { cloneDeep } from "lodash-es";
import isArray from "lodash-es/isArray";
import { ApiResponse, Identifiable } from "../models/api-response.model";
import { Logger } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class ApiResponseProcessProcessor {

  processResponse<T extends Identifiable>(logger: Logger, existingItems: T[], apiResponse: ApiResponse): T[] {
    let tempItems: T[] = cloneDeep(existingItems);
    const responseItems: T[] = isArray(apiResponse.response) ? apiResponse.response : [apiResponse.response];
    logger.info("Received", responseItems.length, "item", apiResponse.action, "notification(s)");
    if (apiResponse.action === "query") {
      tempItems = responseItems;
    } else {
      responseItems.forEach(notifiedItem => {
        const existingItem: T = existingItems.find(member => member.id === notifiedItem.id);
        if (existingItem) {
          if (apiResponse.action === "delete") {
            logger.info("deleting", notifiedItem);
            tempItems = tempItems.filter(member => member.id !== notifiedItem.id);
          } else {
            logger.info("replacing", notifiedItem);
            tempItems[(tempItems.indexOf(existingItem))] = notifiedItem;
          }
        } else {
          logger.info("adding", notifiedItem);
          tempItems.push(notifiedItem);
        }
      });
    }
    return tempItems;
  }

}
