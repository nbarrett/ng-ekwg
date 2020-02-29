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
  private memberNotifications = new Subject<ExpenseClaimApiResponse>();

  constructor(private http: HttpClient,
              private commonDataService: CommonDataService,
              loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ExpenseClaimService, NgxLoggerLevel.DEBUG);
  }

  async all(dataQueryOptions?: DataQueryOptions): Promise<ExpenseClaim[]> {
    const params = this.commonDataService.toHttpParams(dataQueryOptions);
    this.logger.debug("all:dataQueryOptions", dataQueryOptions, "params", params.toString());
    const apiResponse = await this.http.get<ExpenseClaimApiResponse>(`${this.BASE_URL}/all`, {params}).toPromise();
    this.logger.debug("all - received", apiResponse);
    return apiResponse.response as ExpenseClaim[];
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
      this.memberNotifications.next(expenseApiResponse);
    }, (httpErrorResponse: HttpErrorResponse) => {
      this.logger.error("httpErrorResponse", httpErrorResponse);
      this.memberNotifications.next(httpErrorResponse.error);
    });
    return await shared.toPromise();
  }

  async getById(expenseId: string): Promise<ExpenseClaim> {
    this.logger.debug("getById:", expenseId);
    const apiResponse = await this.responseFrom(this.http.get<ExpenseClaimApiResponse>(`${this.BASE_URL}/${expenseId}`));
    this.logger.debug("getById - received", apiResponse);
    return apiResponse.response as ExpenseClaim;
  }

  async update(expense: ExpenseClaim): Promise<ExpenseClaim> {
    this.logger.debug("updating", expense);
    const apiResponse = await this.responseFrom(this.http.put<ExpenseClaimApiResponse>(this.BASE_URL + "/" + expense.id, expense));
    this.logger.debug("updated", expense, "- received", apiResponse);
    return apiResponse.response as ExpenseClaim;
  }

  async create(member: ExpenseClaim): Promise<ExpenseClaim> {
    this.logger.debug("creating", member);
    const apiResponse = await this.http.post<ExpenseClaimApiResponse>(this.BASE_URL, member).toPromise();
    this.logger.debug("created", member, "- received", apiResponse);
    return apiResponse.response as ExpenseClaim;
  }

  async delete(expense: ExpenseClaim): Promise<ExpenseClaim> {
    this.logger.debug("deleting", expense);
    const apiResponse = await this.http.delete<ExpenseClaimApiResponse>(this.BASE_URL + "/" + expense.id).toPromise();
    this.logger.debug("deleted", expense, "- received", apiResponse);
    return apiResponse.response as ExpenseClaim;
  }

}
