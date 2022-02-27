import { ApiResponse } from "./api-response.model";

export interface RamblersWalksUploadRequest {
  fileName: string;
  walkIdDeletionList: string[];
  headings: string[];
  rows: WalkUploadRow[];
  ramblersUser: string;
}

export interface RamblersWalkResponse {
  ramblersWalkId: string;
  ramblersWalkTitle: string;
  ramblersWalkDate: string;
  ramblersWalkDateValue: number;
}

export interface RamblersWalksApiResponse extends ApiResponse {
  request: any;
  response?: RamblersWalkResponse[];
}

export const WalkUploadColumnHeadings: string[] = [
  "Date",
  "Title",
  "Description",
  "Linear or Circular",
  "Starting postcode",
  "Starting gridref",
  "Starting location details",
  "Show exact starting point",
  "Start time",
  "Show exact meeting point?",
  "Meeting time",
  "Restriction",
  "Difficulty",
  "Local walk grade",
  "Distance miles",
  "Contact id",
  "Contact display name"
];

export interface WalkUploadRow {
  "Date": string;
  "Title": string;
  "Description": string;
  "Linear or Circular": string;
  "Starting postcode": string;
  "Starting gridref": string;
  "Starting location details": string;
  "Show exact starting point": string;
  "Start time": string;
  "Show exact meeting point?": string;
  "Meeting time": string;
  "Restriction": string;
  "Difficulty": string;
  "Local walk grade": string;
  "Distance miles": string;
  "Contact id": string;
  "Contact display name": string;
}
