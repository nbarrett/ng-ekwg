import { ApiResponse, Identifiable } from "./api-response.model";

export interface SocialEvent extends Identifiable {
  notification: any;
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
