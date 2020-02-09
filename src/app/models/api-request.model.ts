export interface ApiRequest {
  parameters: object;
  url: string;
  body: object;
}

export interface DataQueryOptions {
  criteria?: object;
  select?: object;
  sort?: object;
}
