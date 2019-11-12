export interface ApiRequest {
  parameters: object;
  url: string;
  body: object;
}

export interface DataQueryOptions {
  limit?: number;
  criteria?: object;
  select?: object;
  sort?: object;
}
