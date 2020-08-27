import { ApiResponse, Identifiable } from "./api-response.model";
import { FileNameData } from "./aws-object.model";
import { Notification } from "./committee.model";

export interface FilterParameters {
  quickSearch: string;
  selectType: number;
  fieldSort: number;
}

export interface SocialEvent extends Identifiable {
  attachment?: {
    originalFileName?: string;
    title?: string;
  };
  attachmentTitle?: any;
  attendees: Identifiable[];
  briefDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  displayName?: string;
  eventContactMemberId?: string;
  eventDate?: number;
  eventTimeEnd?: string;
  eventTimeStart?: string;
  fileNameData?: FileNameData;
  link?: string;
  linkTitle?: string;
  location?: string;
  longerDescription?: string;
  mailchimp?: any;
  notification?: Notification;
  postcode?: string;
  thumbnail?: string;
}

export interface SocialEventApiResponse extends ApiResponse {
  request: any;
  response?: SocialEvent | SocialEvent[];
}

export interface SocialEventsPermissions {
  detailView?: boolean;
  summaryView?: boolean;
  delete?: boolean;
  edits?: boolean;
  copy?: boolean;
  contentEdits?: boolean;
}
