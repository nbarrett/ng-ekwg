import { ApiResponse } from "./api-response.model";
import { Page } from "./page.model";

export interface ContentText {
  id?: string;
  category?: string;
  name?: string;
  text?: string;
}

export interface ContentTextApiResponse extends ApiResponse {
  request: any;
  response?: ContentText | ContentText[];
}

export interface PageContent {
  id?: string;
  path?: string;
  rows: PageContentRow[]
}

export interface PageContentApiResponse extends ApiResponse {
  request: any;
  response?: PageContent | PageContent[];
}

export enum PageContentType {
  TEXT = "text",
  SLIDES = "slides",
}

export interface PageContentRow {
  type: PageContentType;
  columns: PageContentColumn[];
}

export interface PageContentColumn extends Page {
  columns?: number;
  contentTextId?: string;
  imageSource?: string;
  icon?: string;
}


