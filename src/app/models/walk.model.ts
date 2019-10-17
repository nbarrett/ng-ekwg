import { MeetupConfigParameters } from "./meetup-config.model";
import { WalkEvent } from "./walk-event.model";
import { WalkVenue } from "./walk-venue.model";

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
  events: WalkEvent[];
  grade?: string;
  gridReference?: string;
  location?: string;
  longerDescription?: string;
  config?: { meetup: MeetupConfigParameters };
  meetupEventTitle?: string;
  meetupEventDescription?: string;
  meetupEventUrl?: string;
  meetupPublish?: boolean;
  nearestTown?: string;
  osMapsRoute?: string;
  osMapsTitle?: string;
  postcode?: string;
  ramblersWalkId?: string;
  ramblersPublish?: boolean;
  startTime?: string;
  walkDate: number;
  walkLeaderMemberId?: string;
  venue?: WalkVenue;

  $id?(): any;

  $saveOrUpdate?(saveCallback?, updateCallback?, errorSaveCallback?, errorUpdateCallback?): Promise<Walk>;
}

