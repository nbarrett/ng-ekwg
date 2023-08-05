import { ApiResponse, Identifiable } from "./api-response.model";
import { MeetupConfig } from "./meetup-config.model";
import { FilterParametersSearch } from "./member-resource.model";
import { WalkAccessMode } from "./walk-edit-mode.model";
import { WalkEventType } from "./walk-event-type.model";
import { WalkEvent } from "./walk-event.model";
import { WalkVenue } from "./walk-venue.model";

export interface GoogleMapsConfig {
  apiKey: string;
  zoomLevel: number;
}

export interface Walk extends Identifiable {
  contactName?: string;
  walkType?: WalkType;
  briefDescriptionAndStartPoint?: string;
  contactEmail?: string;
  contactId?: string;
  contactPhone?: string;
  displayName?: string;
  distance?: string;
  events: WalkEvent[];
  grade?: string;
  gridReference?: string;
  gridReferenceFinish?: string;
  location?: string;
  longerDescription?: string;
  config?: { meetup: MeetupConfig };
  meetupEventTitle?: string;
  meetupEventDescription?: string;
  meetupEventUrl?: string;
  meetupPublish?: boolean;
  nearestTown?: string;
  osMapsRoute?: string;
  osMapsTitle?: string;
  postcode?: string;
  postcodeFinish?: string;
  ramblersWalkId?: string;
  ramblersWalkUrl?: string;
  startLocationW3w?: string;
  ramblersPublish?: boolean;
  startTime?: string;
  walkDate?: number;
  walkLeaderMemberId?: string;
  venue?: WalkVenue;
  riskAssessment?: RiskAssessmentRecord[];
}

export interface RiskAssessmentRecord {
  confirmationText?: string;
  memberId: string;
  confirmed: boolean;
  confirmationDate: number;
  riskAssessmentSection: string;
  riskAssessmentKey: string;
}

export interface WalkExport {
  displayedWalk: DisplayedWalk;
  validationMessages: string[];
  publishedOnRamblers: boolean;
  selected: boolean;
}

export interface WalkApiResponse extends ApiResponse {
  request: any;
  response?: Walk | Walk[];
}

export enum WalkType {
  CIRCULAR = "Circular",
  LINEAR = "Linear"
}

export enum EventType {
  AWAITING_LEADER = "awaitingLeader",
  AWAITING_WALK_DETAILS = "awaitingWalkDetails",
  WALK_DETAILS_REQUESTED = "walkDetailsRequested",
  WALK_DETAILS_UPDATED = "walkDetailsUpdated",
  WALK_DETAILS_COPIED = "walkDetailsCopied",
  AWAITING_APPROVAL = "awaitingApproval",
  APPROVED = "approved",
  DELETED = "deleted",
  UNKNOWN = "unknown"
}

export interface WalkFilter {
  value: number;
  description: string;
  selected?: boolean;
  adminOnly?: boolean;
}

export enum WalkViewMode {
  VIEW = "view",
  VIEW_SINGLE = "view-single",
  EDIT = "edit",
  EDIT_FULL_SCREEN = "edit-full-screen",
  LIST = "list"
}

export interface DisplayedWalk {
  walk: Walk;
  walkAccessMode: WalkAccessMode;
  status: EventType;
  latestEventType?: WalkEventType;
  walkLink?: string;
  ramblersLink?: string;
}

export interface FilterParameters extends FilterParametersSearch {
  selectType: number;
  ascending: boolean;
}
