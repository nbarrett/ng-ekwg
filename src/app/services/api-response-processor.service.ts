import { Injectable } from "@angular/core";
import { cloneDeep } from "lodash-es";
import isArray from "lodash-es/isArray";
import { ApiAction, ApiResponse, Identifiable } from "../models/api-response.model";
import { Logger } from "./logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class ApiResponseProcessor {

  processResponse<T extends Identifiable>(logger: Logger, existingItems: T[], apiResponse: ApiResponse): T[] {
    let tempItems: T[] = cloneDeep(existingItems);
    const responseItems: T[] = isArray(apiResponse.response) ? apiResponse.response : [apiResponse.response];
    logger.info("Received", responseItems.length, "item", apiResponse.action, "notification(s)");
    if (apiResponse.action === ApiAction.QUERY) {
      tempItems = responseItems;
    } else {
      responseItems.forEach(notifiedItem => {
        const existingItem: T = existingItems.find(member => member.id === notifiedItem.id);
        if (existingItem) {
          if (apiResponse.action === ApiAction.DELETE) {
            logger.info("deleting", notifiedItem);
            tempItems = tempItems.filter(member => member.id !== notifiedItem.id);
          } else {
            const index = tempItems.indexOf(tempItems.find(item => item.id === existingItem.id));
            logger.info("replacing", notifiedItem, "at index position", index );
            tempItems[index] = notifiedItem;
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
