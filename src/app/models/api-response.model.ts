import { ApiRequest } from "./api-request.model";

export interface ApiResponse {
  request: ApiRequest;
  apiStatusCode: number;
  response: any;
}
