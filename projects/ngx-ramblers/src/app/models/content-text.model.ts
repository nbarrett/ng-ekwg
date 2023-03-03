import { ApiResponse } from "./api-response.model";
import { AccessLevel } from "./member-resource.model";
import { Link } from "./page.model";

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

export interface PageContentRow {
  type: PageContentType;
  maxColumns: number;
  showSwiper: boolean;
  columns: PageContentColumn[];
  marginTop?: number;
  marginBottom?: number;
}

export interface PageContentColumn extends Link {
  columns?: number;
  contentTextId?: string;
  imageSource?: string;
  icon?: string;
  accessLevel?: AccessLevel;
  rows?: PageContentRow[]
}

export interface PageContentEditEvent {
  columnIndex: number;
  rowIndex: number;
  path: string;
  image?: string;
  editActive?: boolean;
}

export interface PageContentApiResponse extends ApiResponse {
  request: any;
  response?: PageContent | PageContent[];
}

export enum PageContentType {
  TEXT = "text",
  ACTION_BUTTONS = "action-buttons",
}

export enum ImageType {
  ERROR = "error",
  MISSING = "missing",
  IMAGE = "image",
  ICON = "icon",
}

export enum View {
  EDIT = "edit",
  VIEW = "view"
}

export interface EditorState {
  view: View;
  dataAction: DataAction;
}

export enum DataAction {
  QUERY = "query",
  SAVE = "save",
  REVERT = "revert",
  NONE = "none"
}
