import { ApiResponse } from "./api-response.model";

export interface ContentText {
  id?: string;
  category?: string;
  name: string;
  text: string;
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

export interface PageContentRow {
  columns: PageContentColumn[];
}

export interface PageContentColumn {
  columns?: number;
  contentTextId?: string;
}

export const defaultRow: PageContentRow = {
  columns: [{columns: 12, contentTextId: null}]
};


