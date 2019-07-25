import { EventType } from "../services/walks-reference-data.service";

export interface Walk {
  _id?: string;
  contactEmail?: string;
  gridReference?: string;
  contactPhone?: string;
  displayName?: string;
  startTime?: string;
  osMapsRoute?: string;
  osMapsTitle?: string;
  briefDescriptionAndStartPoint?: string;
  ramblersWalkId?: string;
  events: [];
  meetupEventUrl?: string;
  meetupEventTitle?: string;
  walkLeaderMemberId?: string;
  status?: EventType;
  postcode?: string;
  walkDate: number;

  $id(): any;
}
