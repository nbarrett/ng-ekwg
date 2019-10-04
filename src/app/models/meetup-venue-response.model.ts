export interface MeetupVenueResponse {
  id: number;
}

export interface MeetupVenuePotentialMatch {
  "rating_count": number;
  "rating": number;
  "visibility": string;
  "name": string;
  "lon": number;
  "lat": number;
  "localized_country_name": string;
  "country": string;
  "city": string;
  "address_1": string;
  "id": number;
}

export interface MeetupVenueConflictResponse {
  "errors": [
    {
      "code": string;
      "message": string;
      "potential_matches": MeetupVenuePotentialMatch []
    }];
}

export interface MeetupVenueCreatedResponse {
  "rating_count": number;
  "rating": number;
  "visibility": string;
  "name": string;
  "lon": string;
  "lat": string;
  "localized_country_name": string;
  "country": string;
  "city": string;
  "address_2": string;
  "address_1": string;
  "id": number;
}
