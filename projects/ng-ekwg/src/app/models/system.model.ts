import { ApiResponse, Identifiable } from "./api-response.model";
import { Link } from "./page.model";

export interface Organisation {
  shortName?: string;
  longName?: string;
  groupCode?: string;
  href?: string;
  pages: Link[];
}

export interface SystemConfigResponse {
  system: SystemConfig
}

export interface Footer {
  quickLinks: Link[];
  legals: Link[];
  pages: Link[];
  appDownloads: {
    google: Link;
    apple: Link
  }
}

export interface ExternalUrls {
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  meetup?: string;
  twitter?: string;
  youtube?: string;
}

export interface Header {
  navigationButtons: Link[];
}

export interface SystemConfig extends Identifiable {
  header: Header,
  footer: Footer
  group: Organisation;
  area: Organisation;
  national: Organisation;
  externalUrls: ExternalUrls
}

export interface SystemConfigApiResponse extends ApiResponse {
  request: any;
  response?: SystemConfig;
}

