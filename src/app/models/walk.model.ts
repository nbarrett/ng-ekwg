import { EventType } from "../services/walks-reference-data.service";

export interface Walk {
  contactName?: string;
  walkType?: string;
  _id?: string;
  briefDescriptionAndStartPoint?: string;
  contactEmail?: string;
  contactId?: string;
  contactPhone?: string;
  displayName?: string;
  distance?: string;
  events: [];
  grade?: string;
  gridReference?: string;
  location?: string;
  longerDescription?: string;
  meetupEventTitle?: string;
  meetupEventUrl?: string;
  nearestTown?: string;
  osMapsRoute?: string;
  osMapsTitle?: string;
  postcode?: string;
  ramblersWalkId?: string;
  startTime?: string;
  status?: EventType;
  walkDate: number;
  walkLeaderMemberId?: string;

  $id?(): any;

  $saveOrUpdate?(saveCallback?, updateCallback?, errorSaveCallback?, errorUpdateCallback?): Walk;
}

