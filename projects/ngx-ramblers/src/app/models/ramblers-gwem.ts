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

export enum GWEMUploadColumnHeading {
  DATE = "Date",
  TITLE = "Title",
  DESCRIPTION = "Description",
  LINEAR_OR_CIRCULAR = "Linear or Circular",
  STARTING_POSTCODE = "Starting postcode",
  STARTING_GRIDREF = "Starting gridref",
  STARTING_LOCATION_DETAILS = "Starting location details",
  SHOW_EXACT_STARTING_POINT = "Show exact starting point",
  START_TIME = "Start time",
  SHOW_EXACT_MEETING_POINT = "Show exact meeting point?",
  MEETING_TIME = "Meeting time",
  RESTRICTION = "Restriction",
  DIFFICULTY = "Difficulty",
  LOCAL_WALK_GRADE = "Local walk grade",
  DISTANCE_MILES = "Distance miles",
  CONTACT_ID = "Contact id",
  CONTACT_DISPLAY_NAME = "Contact display name"
}

export enum WalkUploadColumnHeading {
  DATE = "Date",
  TITLE = "Title",
  DESCRIPTION = "Description",
  ADDITIONAL_DETAILS = "Additional details",
  WEBSITE_LINK = "Website Link",
  WALK_LEADERS = "Walk leaders",
  LINEAR_OR_CIRCULAR = "Linear or Circular",
  START_TIME = "Start time",
  STARTING_LOCATION = "Starting location",
  STARTING_POSTCODE = "Starting postcode",
  STARTING_GRIDREF = "Starting gridref",
  STARTING_LOCATION_DETAILS = "Starting location details",
  MEETING_TIME = "Meeting time",
  MEETING_LOCATION = "Meeting location",
  MEETING_POSTCODE = "Meeting postcode",
  MEETING_GRIDREF = "Meeting gridref",
  MEETING_LOCATION_DETAILS = "Meeting location details",
  EST_FINISH_TIME = "Est finish time",
  FINISHING_LOCATION = "Finishing location",
  FINISHING_POSTCODE = "Finishing postcode",
  FINISHING_GRIDREF = "Finishing gridref",
  FINISHING_LOCATION_DETAILS = "Finishing location details",
  DIFFICULTY = "Difficulty",
  DISTANCE_KM = "Distance km",
  DISTANCE_MILES = "Distance miles",
  ASCENT_METRES = "Ascent metres",
  ASCENT_FEET = "Ascent feet",
  DOG_FRIENDLY = "Dog friendly",
  INTRODUCTORY_WALK = "Introductory walk",
  NO_STILES = "No stiles",
  FAMILY_FRIENDLY = "Family-friendly",
  WHEELCHAIR_ACCESSIBLE = "Wheelchair accessible",
  ACCESSIBLE_BY_PUBLIC_TRANSPORT = "Accessible by public transport",
  CAR_PARKING_AVAILABLE = "Car parking available",
  CAR_SHARING_AVAILABLE = "Car sharing available",
  COACH_TRIP = "Coach trip",
  REFRESHMENTS_AVAILABLE_PUB_CAFE = "Refreshments available (Pub/cafe)",
  TOILETS_AVAILABLE = "Toilets available"
}

export type WalkUploadRow = {
  [column in keyof WalkUploadColumnHeading]?: string;
}
