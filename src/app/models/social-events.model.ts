import { ApiResponse } from "./api-response.model";

export interface SocialEvent {
  notification: any; /// really?
  id?: string;
  eventDate: number;
  eventTimeStart?: string;
  postcode?: string;
  briefDescription?: string;
  longerDescription?: string;
  displayName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface SocialEventApiResponse extends ApiResponse {
  request: any;
  response?: SocialEvent | SocialEvent[];
}
