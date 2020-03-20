import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable, Subject } from "rxjs";
import { share } from "rxjs/operators";
import { DataQueryOptions } from "../../models/api-request.model";
import { ExpenseClaim, ExpenseClaimApiResponse } from "../../models/expense.model";
import { CommonDataService } from "../common-data-service";
import { Logger, LoggerFactory } from "../logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class ExpenseClaimService {

  private BASE_URL = "/api/database/expense-claim";
  private logger: Logger;
  private expenseNotifications = new Subject<ExpenseClaimApiResponse>();

  constructor(private http: HttpClient,
              private commonDataService: CommonDataService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ExpenseClaimService, NgxLoggerLevel.OFF);
  }

  notifications(): Observable<ExpenseClaimApiResponse> {
    return this.expenseNotifications.asObservable();
  }

  all(dataQueryOptions?: DataQueryOptions): void {
    const params = this.commonDataService.toHttpParams(dataQueryOptions);
    this.logger.debug("all:dataQueryOptions", dataQueryOptions, "params", params.toString());
    this.responseFrom(this.http.get<ExpenseClaimApiResponse>(`${this.BASE_URL}/all`, {params}));
  }

  async createOrUpdate(expense: ExpenseClaim): Promise<ExpenseClaim> {
    if (expense.id) {
      return this.update(expense);
    } else {
      return this.create(expense);
    }
  }

  private async responseFrom(observable: Observable<ExpenseClaimApiResponse>): Promise<ExpenseClaimApiResponse> {
    const shared = observable.pipe(share());
    shared.subscribe((expenseApiResponse: ExpenseClaimApiResponse) => {
      this.logger.info("expenseApiResponse", expenseApiResponse);
      this.expenseNotifications.next(expenseApiResponse);
    }, (httpErrorResponse: HttpErrorResponse) => {
      this.logger.error("httpErrorResponse", httpErrorResponse);
      this.expenseNotifications.next(httpErrorResponse.error);
    });
    return shared.toPromise();
  }

  getById(expenseId: string): void {
    this.logger.debug("getById:", expenseId);
    this.responseFrom(this.http.get<ExpenseClaimApiResponse>(`${this.BASE_URL}/${expenseId}`));
  }

  async update(expense: ExpenseClaim): Promise<ExpenseClaim> {
    this.logger.debug("updating", expense);
    const apiResponse = await this.responseFrom(this.http.put<ExpenseClaimApiResponse>(this.BASE_URL + "/" + expense.id, expense));
    this.logger.debug("updated", expense, "- received", apiResponse);
    return apiResponse.response as ExpenseClaim;
  }

  async create(expenseClaim: ExpenseClaim): Promise<ExpenseClaim> {
    this.logger.debug("creating", expenseClaim);
    const apiResponse = await this.responseFrom(this.http.post<ExpenseClaimApiResponse>(this.BASE_URL, expenseClaim));
    this.logger.debug("created", expenseClaim, "- received", apiResponse);
    return apiResponse.response as ExpenseClaim;
  }

  async delete(expense: ExpenseClaim): Promise<ExpenseClaim> {
    this.logger.debug("deleting", expense);
    const apiResponse = await this.responseFrom(this.http.delete<ExpenseClaimApiResponse>(this.BASE_URL + "/" + expense.id));
    this.logger.debug("deleted", expense, "- received", apiResponse);
    return apiResponse.response as ExpenseClaim;
  }

}
