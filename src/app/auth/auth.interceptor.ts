import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, filter, switchMap, take } from "rxjs/operators";
import { AuthTokens } from "../models/auth-tokens";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private logger: Logger;

  constructor(public authService: AuthService, private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AuthInterceptor, NgxLoggerLevel.DEBUG);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.authService.authToken()) {
      request = this.addToken(request, this.authService.authToken());
    }

    return next.handle(request).pipe(catchError(error => {
      const loginRequest = request.url.includes("login");
      this.logger.debug("loginRequest", loginRequest, "request.url", request.url);
      if (error instanceof HttpErrorResponse && error.status === 401 && !loginRequest) {
        return this.handle401Error(request, next);
      } else {
        this.logger.debug("not handling 401 refresh so throwing", error);
        return throwError(error);
      }
    }));
  }

  private addToken(request: HttpRequest<any>, token: string) {
    this.logger.debug("addToken to header", token);
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    this.logger.debug("handle401Error called:isRefreshing - ", !this.isRefreshing, "request - ", request);
    if (request.url.includes("refresh")) {
      this.logger.debug("handle401Error refresh failed - setting logout flag");
      this.authService.scheduleLogout();
    }
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.logger.debug("handle401Error this.isRefreshing true, refreshTokenSubject - null");
      this.refreshTokenSubject.next(null);
      return this.authService.performTokenRefresh().pipe(
        switchMap((token: AuthTokens) => {
          this.logger.debug("authService.refreshToken observable received:token.jwt", token.auth);
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.auth);
          this.logger.debug("handle401Error this.isRefreshing false, refreshTokenSubject -", token.auth);
          return next.handle(this.addToken(request, token.auth));
        }));
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }
}
