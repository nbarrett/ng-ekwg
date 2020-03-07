import { ApiResponse } from "./api-response.model";

export interface ExpenseFilter {
  filter: (arg?: any) => boolean;
  description: string;
  disabled?: boolean;
}

export interface ExpenseClaim {
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
  };
  id?: string;
  expenseEvents: ExpenseEvent[];
  expenseItems: ExpenseItem[];
  cost: number;
}

export interface ExpenseType {
  value: string;
  name: string;
  travel?: boolean;
}

export interface ExpenseItem {
  cost: number;
  description?: string;
  expenseType: ExpenseType;
  expenseDate: number;
  travel?: {
    costPerMile: number,
    miles: number;
    from?: string;
    to?: string,
    returnJourney: boolean
  };
  receipt?: {
    awsFileName?: string;
    originalFileName?: string;
    title: string, fileNameData: any
  };
}

export interface ExpenseNotificationConfiguration {
  component: object;
  memberIds: string[];
  segmentType: string;
  segmentNameSuffix: string;
  destination: string;
}

export interface ExpenseNotificationContentSections {
  sections: {
    expense_id_url: string;
    expense_notification_text: string;
  };
}

export interface ExpenseEventType {
  description: string;
  atEndpoint?: boolean;
  actionable?: boolean;
  editable?: boolean;
  returned?: boolean;
  notifyCreator?: boolean;
  notifyApprover?: boolean;
  notifyTreasurer?: boolean;
}

export interface ExpenseEvent {
  reason?: string;
  eventType?: ExpenseEventType;
  date?: number;
  memberId?: string;
}

export interface ExpenseClaimApiResponse extends ApiResponse {
  request: any;
  response?: ExpenseClaim | ExpenseClaim[];
}

export interface ExpenseNotificationMapping {
  expenseEventType: ExpenseEventType;
  notifyCreator?: object;
  notifyApprover?: object;
  notifyTreasurer?: object;
}
