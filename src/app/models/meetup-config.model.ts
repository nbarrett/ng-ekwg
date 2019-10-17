export interface MeetupConfig {
  meetup: MeetupConfigParameters;

  $id?(): any;

  $saveOrUpdate?(saveCallback?, updateCallback?, errorSaveCallback?, errorUpdateCallback?): Promise<MeetupConfig>;
}

export interface MeetupConfigParameters {
  defaultContent: string;
  publishStatus: string;
  guestLimit: number;
  announce: boolean;
}

