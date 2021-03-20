import { ApiResponse, WithMongoId } from "./api-response.model";

export enum EventType {
  WALK = "walk",
  SOCIAL = "social"
}

export interface ContentMetadata {
  id: string;
  baseUrl: string;
  contentMetaDataType: string;
  files: ContentMetadataItem[];
  imageTags: ImageTag[];
}

export interface S3Metadata {
  key: string;
  lastModified: number;
  size: number;
}

export interface ContentMetadataItem extends WithMongoId {
  eventId?: string;
  dateSource?: string;
  date?: number;
  image?: string;
  text?: string;
  tags?: number[];
}

export interface DuplicateImages {
  [image: string]: ContentMetadataItem[];
}

export interface ContentMetadataApiResponse extends ApiResponse {
  request: any;
  response?: ContentMetadata;
}

export interface ImageTag {
  key?: number;
  sortIndex?: number;
  subject: string;
  excludeFromRecent?: boolean;
}

export const RECENT_PHOTOS: ImageTag = {key: 0, sortIndex: 0, subject: "Recent Photos"};
export const ALL_TAGS: ImageTag = {key: 0, subject: "Anything"};
