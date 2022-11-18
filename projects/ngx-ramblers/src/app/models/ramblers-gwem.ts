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

export const NewWalkUploadColumnHeadings: string[] = [
  "Date",
  "Title",
  "Description",
  "Walk leaders",
  "Linear or Circular",
  "Start time",
  "Starting location",
  "Starting postcode",
  "Starting gridref",
  "Starting location details",
  "Meeting location",
  "Meeting postcode",
  "Meeting gridref",
  "Meeting location details",
  "Est finish time",
  "Finishing location",
  "Finishing postcode",
  "Finishing gridref",
  "Finishing location details",
  "Difficulty",
  "Distance km",
  "Distance miles",
  "Ascent metres",
  "Ascent feet",
  "Family friendly",
  "Dog friendly",
  "Assistance dog only",
  "No stiles",
  "Refreshments available",
  "Toilets available",
  "Fast pace",
  "Slow pace"
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
