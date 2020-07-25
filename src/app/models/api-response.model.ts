import { ApiRequest } from "./api-request.model";

export interface ApiResponse {
  request: ApiRequest;
  action: ApiAction;
  response?: any;
  message?: string;
  error?: any;
  apiStatusCode?: number;
}

export interface Identifiable {
  id?: string;
}

export enum ApiAction {
  UPDATE = "update",
  CREATE = "create",
  DELETE = "delete",
  QUERY = "delete"
}
