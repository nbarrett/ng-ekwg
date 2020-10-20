import { ApiResponse } from "./api-response.model";

export enum EventType {
  WALK = "walk",
  SOCIAL = "social"
}

export interface ContentMetadata {
  id: string;
  baseUrl: string;
  contentMetaDataType: string;
  files: ContentMetadataItem[];
}

export interface ContentMetadataItem {
  eventId?: string;
  eventType?: EventType;
  image?: string;
  text?: string;
}

export interface ContentMetadataApiResponse extends ApiResponse {
  request: any;
  response?: ContentMetadata;
}
