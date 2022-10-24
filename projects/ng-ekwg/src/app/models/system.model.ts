import { ApiResponse, Identifiable } from "./api-response.model";
import { Page } from "./page.model";

export interface SystemConfig extends Identifiable {
  shortGroupName?: string;
  longGroupName?: string;
  href?: string;
  pages: Page[];
}

export interface SystemConfigApiResponse extends ApiResponse {
  request: any;
  response?: SystemConfig;
}

