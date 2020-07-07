export interface MeetupConfig {
  meetup: MeetupConfigParameters;
}

export interface MeetupConfigParameters {
  defaultContent: string;
  publishStatus: string;
  guestLimit: number;
  announce: boolean;
}

