import { Member, MemberUpdateAudit } from "./member.model";

export const DESCENDING = "▼";
export const ASCENDING = "▲";
export const SELECT_ALL = () => true;
export const MEMBER_SORT = ["firstName", "lastName"];

export interface TableFilterItem {
  title: string;
  group?: string;
  filter: any;
}

export interface MemberTableFilter {
  sortField?: string;
  query?: any;
  sortFunction?: any;
  reverseSort?: boolean;
  sortDirection?: string;
  availableFilters?: TableFilterItem[];
  selectedFilter?: TableFilterItem;
  results: Member[];
}

export interface MemberUpdateAuditTableFilter {
  sortField?: string;
  query?: any;
  sortFunction?: any;
  reverseSort?: boolean;
  sortDirection?: string;
  availableFilters?: TableFilterItem[];
  selectedFilter?: TableFilterItem;
  results: MemberUpdateAudit[];
}
