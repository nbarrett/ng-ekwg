import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { isEmpty, last } from "lodash-es";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { ApiResponse } from "../models/api-response.model";
import { MeetupErrorResponse } from "../models/meetup-error-response.model";
import { MeetupEventRequest } from "../models/meetup-event-request.model";
import { MeetupEventResponse } from "../models/meetup-event-response.model";
import { MeetupLocationResponse } from "../models/meetup-location-response.model";
import { MeetupVenueRequest } from "../models/meetup-venue-request.model";
import { MeetupVenueConflictResponse, MeetupVenueCreatedResponse, MeetupVenueResponse } from "../models/meetup-venue-response.model";
import { Walk } from "../models/walk.model";
import { DateUtilsService } from "./date-utils.service";
import { Logger, LoggerFactory } from "./logger-factory.service";
import { StringUtilsService } from "./string-utils.service";

@Injectable({
  providedIn: "root"
})
export class MeetupService {
  private receivedEvents: MeetupEventResponse[] = [];
  private eventsUpdated = new Subject<MeetupEventResponse[]>();
  private logger: Logger;

  constructor(private dateUtils: DateUtilsService,
              private stringUtils: StringUtilsService,
              private http: HttpClient, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(MeetupService, NgxLoggerLevel.DEBUG);
  }

  config() {
    return this.http.get("/api/meetup/config");
  }

  isMeetupErrorResponse(message: MeetupEventResponse[] | MeetupErrorResponse): message is MeetupErrorResponse {
    return message && (message as MeetupErrorResponse).status !== undefined;
  }

  meetupEventStatuses(): string[] {
    return Object.keys(MeetupStatus).map(k => MeetupStatus[k as any]);
  }

  location(query?: string): Observable<MeetupLocationResponse> {
    const queryParams = `?query=${query}`;
    return this.http
      .get<ApiResponse>(
        "/api/meetup/locations" + queryParams
      ).pipe(
        mergeMap(apiResponse => {
          this.logger.debug("events API response", apiResponse);
          return apiResponse.response;
        })
      );
  }

  eventsForStatus(status?: string) {
    const queriedStatus = status || MeetupStatus.UPCOMING;
    const queryParams = `?status=${queriedStatus}`;
    this.http
      .get<ApiResponse>(
        "/api/meetup/events" + queryParams
      )
      .subscribe(apiResponse => {
        this.logger.debug("events API response", apiResponse);
        this.receivedEvents = apiResponse.response;
        this.eventsUpdated.next([...this.receivedEvents]);
      });
  }

  eventsListener() {
    return this.eventsUpdated.asObservable();
  }

  async createOrDeleteMeetupEvent(walk: Walk): Promise<any> {
    this.logger.info("createOrDeleteMeetupEvent:meetupPublish", walk.meetupPublish, "meetupEventUrl", walk.meetupEventUrl);
    if (walk.meetupPublish) {
      const eventExists = await this.eventExists(walk);
      if (eventExists) {
        return this.updateEvent(walk);
      } else {
        return this.createEvent(walk);
      }
    } else if (walk.meetupEventUrl) {
      return this.deleteEvent(walk);
    } else {
      const reason = "no action taken as meetupPublish was false and walk had no existing publish status";
      this.logger.info(reason);
      return Promise.resolve(reason);
    }
  }

  async deleteEvent(walk: Walk): Promise<MeetupEventResponse> {
    const eventId = this.eventIdFrom(walk);
    const apiResponse: ApiResponse = await this.http.delete<ApiResponse>("/api/meetup/events/delete/" + eventId).toPromise();
    this.logger.debug("delete event API response", apiResponse);
    delete walk.meetupEventUrl;
    delete walk.meetupEventTitle;
    return apiResponse.response;
  }

  async createEvent(walk: Walk): Promise<MeetupEventResponse> {
    const eventRequest = await this.eventRequestFor(walk);
    const apiResponse = await this.http.post<ApiResponse>("/api/meetup/events/create", eventRequest).toPromise();
    this.logger.debug("create event API response", apiResponse);
    const eventResponse: MeetupEventResponse = apiResponse.response;
    walk.meetupEventUrl = eventResponse.link;
    walk.meetupEventTitle = eventResponse.title;
    return eventResponse;
  }

  async createOrMatchVenue(walk: Walk): Promise<MeetupVenueResponse> {
    const venueRequest = this.venueRequestFor(walk);
    try {
      const createResponse = await this.http.post<ApiResponse>("/api/meetup/venues/create", venueRequest).toPromise();
      this.logger.debug("create venue API response", createResponse);
      if (createResponse.apiStatusCode === 409) {
        return this.extractMatchedVenue(createResponse.response);
      } else {
        return this.extractCreatedVenue(createResponse.response);
      }
    } catch (error) {
      return Promise.reject("Venue request '"
        + this.stringUtils.stringifyObject(venueRequest)
        + "' was rejected by Meetup due to: '"
        + this.extractErrorsFrom(error)
        + "'. Try completing more venue details, or disable Meetup publishing.");
    }
  }

  extractErrorsFrom(httpErrorResponse: HttpErrorResponse): string {
    this.logger.info("api response was", httpErrorResponse);
    return httpErrorResponse.error.response.errors.map(error => this.stringUtils.stringifyObject(error));
  }

  async updateEvent(walk: Walk): Promise<MeetupEventResponse> {
    this.logger.info("updateEvent for", walk);
    const request = await this.eventRequestFor(walk);
    const eventId = this.eventIdFrom(walk);
    const apiResponse = await this.http.patch<ApiResponse>("/api/meetup/events/update/" + eventId, request).toPromise();
    this.logger.info("event update response for event id", eventId, "is", apiResponse);
    return apiResponse.response;
  }

  async eventExists(walk: Walk): Promise<boolean> {
    const eventId = this.eventIdFrom(walk);
    if (eventId) {
      const apiResponse = await this.http.get<ApiResponse>("/api/meetup/events/" + eventId).toPromise();
      this.logger.info("event query response for event id", eventId, "is", apiResponse);
      return apiResponse.apiStatusCode === 200;
    } else {
      return false;
    }
  }

  async eventRequestFor(walk: Walk): Promise<MeetupEventRequest> {
    const venueResponse: MeetupVenueResponse = await this.createOrMatchVenue(walk);
    this.logger.info("venue for", walk.postcode, "is", venueResponse);
    const eventRequest = {
      venue_id: venueResponse.id,
      time: this.dateUtils.startTime(walk),
      duration: this.dateUtils.durationForDistance(walk.distance),
      guest_limit: 2,
      announce: false,
      venue_visibility: "public",
      publish_status: MeetupStatus.DRAFT,
      name: walk.briefDescriptionAndStartPoint,
      description: walk.longerDescription
    };
    this.logger.info("request about to be submitted for walk is", eventRequest);
    return eventRequest;
  }

  venueRequestFor(walk: Walk): MeetupVenueRequest {
    const venueRequest: MeetupVenueRequest = {
      name: walk.venue.name || walk.briefDescriptionAndStartPoint,
      address_1: walk.venue.address1 || walk.nearestTown,
      city: walk.venue.postcode || walk.postcode,
      web_url: walk.venue.url,
      country: "gb",
    };
    if (walk.venue.address2) {
      venueRequest.address_2 = walk.venue.address2;
    }
    this.logger.info("venue request prepared for walk is", venueRequest);
    return venueRequest;
  }

  private eventIdFrom(walk: Walk) {
    return walk.meetupEventUrl && last(walk.meetupEventUrl.split("/").filter(pathParameter => !isEmpty(pathParameter)));
  }

  private extractMatchedVenue(response: MeetupVenueConflictResponse): MeetupVenueResponse {
    return {id: response.errors[0].potential_matches[0].id};
  }

  private extractCreatedVenue(response: MeetupVenueCreatedResponse): MeetupVenueResponse {
    return {id: response.id};
  }
}

export enum MeetupStatus {
  PAST = "past",
  UPCOMING = "upcoming",
  DRAFT = "draft",
  PROPOSED = "proposed",
  SUGGESTED = "suggested"
}
