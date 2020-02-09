import { ApiRequest } from "./api-request.model";

export interface ApiResponse {
  request: ApiRequest;
  action: string;
  response?: any;
  message?: string;
  error?: any;
  apiStatusCode?: number;
}
