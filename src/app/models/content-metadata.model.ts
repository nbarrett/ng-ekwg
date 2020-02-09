import { ApiResponse } from "./api-response.model";

export interface ContentMetadata {
  id: string;
  baseUrl: string;
  contentMetaDataType: string;
  files: ContentMetadataItem[];
}

export interface ContentMetadataItem {
  image: string;
  text: string;
}

export interface ContentMetadataApiResponse extends ApiResponse {
  request: any;
  response?: ContentMetadata;
}
