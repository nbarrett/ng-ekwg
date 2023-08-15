import { Link } from "./page.model";

export enum WalkPopulation {
  WALKS_MANAGER = "walks-manager",
  LOCAL = "local"
}

export interface Group {
  longName?: string;
  groupCode?: string;
}

export interface Organisation extends Group {
  walkPopulation: WalkPopulation;
  shortName?: string;
  href?: string;
  pages: Link[];
}

export interface Ramblers {
  mainSite: Link;
  walksManager: AuthenticationDetailsWithLink;
}

export interface AuthenticationDetailsWithLink extends Link, AuthenticationDetails {
}

export interface AuthenticationDetails {
  userName: string;
  password: string;
  apiKey: string;
}

export interface Footer {
  quickLinks: Link[];
  legals: Link[];
  pages: Link[];
  appDownloads: {
    google: Link;
    apple: Link
  };
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

export interface Image {
  awsFileName?: string;
  originalFileName?: string;
  width: number;
  padding: number;
}

export enum BannerImageType {
  backgrounds = "backgrounds",
  bannerPhotos = "banner-photos",
  icons = "icons",
  logos = "logos"
}

export interface Images {
  rootFolder: BannerImageType;
  images: Image[];
}

export interface SystemConfig {
  icons: Images;
  backgrounds: Images
  logos: Images
  header: Header,
  footer: Footer
  group: Organisation;
  area: Organisation;
  national: Ramblers;
  externalUrls: ExternalUrls
}

export interface ColourSelector {
  class: string;
  badgeClass?: string;
  name: string;
}

export const colourSelectors: ColourSelector[] = [
  {class: "d-none", name: "Hide"},
  {class: "colour-cloudy", badgeClass: "badge badge-cloudy", name: "Cloudy"},
  {class: "colour-granite", badgeClass: "badge badge-granite", name: "Granite"},
  {class: "colour-mintcake", badgeClass: "badge badge-mintcake", name: "Mintcake"},
  {class: "colour-rosycheeks", badgeClass: "badge badge-rosycheeks", name: "Rosy Cheeks"},
  {class: "colour-sunrise", badgeClass: "badge badge-sunrise", name: "Sunrise"},
  {class: "colour-sunset", badgeClass: "badge badge-sunset", name: "Sunset"},
];
