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

export interface Instagram {
  groupUrl?: string;
  showFeed?: boolean;
}

export interface Facebook {
  groupUrl?: string;
  pagesUrl?: string;
  appId?: string;
  showFeed?: boolean;
}

export interface ExternalUrls {
  facebook?: Facebook;
  instagram?: Instagram;
  linkedIn?: string;
  meetup?: string;
  twitter?: string;
  youtube?: string;
}

export interface Header {
  navigationButtons: Link[];
  selectedLogo: string;
}

export interface LogoFileData {
  awsFileName?: string;
  originalFileName?: string;
  width: number;
  padding: number;
}

export interface Logos {
  rootFolder: string;
  images: LogoFileData[]
}

export interface SystemConfig extends Identifiable {
  logos: Logos
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

