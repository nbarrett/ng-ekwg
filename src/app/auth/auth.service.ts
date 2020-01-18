import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthCredentials, AuthPayload, AuthResponse } from "../models/auth-data.model";
import { AuthTokens } from "../models/auth-tokens";
import { LoginResponse, MemberCookie } from "../models/member.model";
import { Logger, LoggerFactory } from "../services/logger-factory.service";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private BASE_URL = "/api/database/auth";
  private readonly AUTH_TOKEN = "AUTH_TOKEN";
  private readonly REFRESH_TOKEN = "REFRESH_TOKEN";
  private authPayload;
  private logger: Logger;

  constructor(private http: HttpClient, private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(AuthService, NgxLoggerLevel.DEBUG);
  }

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    const url = `${this.BASE_URL}/login`;
    this.logger.debug("logging in", credentials.userName, "via", url);
    const observable = this.http.post<any>(url, credentials);
    observable.subscribe(authResponse => this.storeTokens(authResponse.tokens));
    return observable;
  }

  logout(): Observable<AuthResponse> {
    const url = `${this.BASE_URL}/logout`;
    this.logger.debug("logging out user via", url);
    const observable = this.http.post<any>(url, {
      refreshToken: this.refreshToken(),
      member: this.parseAuthPayload(),
    });
    observable.subscribe(response => {
      this.logger.debug("logout complete", response);
      this.removeTokens();
    });
    return observable;
  }

  isLoggedIn(): boolean {
    return !!this.authToken() && !!this.refreshToken();
  }

  performTokenRefresh() {
    const url = `${this.BASE_URL}/refresh`;
    this.logger.debug("calling", url);
    return this.http.post<any>(url, {
      refreshToken: this.refreshToken()
    }).pipe(
      tap((tokens: AuthTokens) => {
        this.storeAuthToken(tokens.auth);
      })
    );
  }

  auditMemberLogin(userName: string, loginResponse: LoginResponse) {
    const url = `${this.BASE_URL}/audit-member-login`;
    this.logger.debug("calling", url);
    return this.http.post<any>(url, {userName, loginResponse}).pipe(
      tap((response) => {
        this.logger.debug("auditMemberLogin:response:", response);
      })
    );
  }

  authToken() {
    return localStorage.getItem(this.AUTH_TOKEN);
  }

  tokenIssued() {
    const parseJwt1 = this.parseAuthPayload();
    return parseJwt1 && new Date(parseJwt1.iat * 1000);
  }

  tokenExpires() {
    const parseJwt1 = this.parseAuthPayload();
    return parseJwt1 && new Date(parseJwt1.exp * 1000);
  }

  parseAuthPayload(): AuthPayload {
    if (!this.authPayload) {
      const token = this.authToken();
      if (token) {
        const items = token.split(".");
        if (items.length === 0) {
          this.logger.warn("authPayload items zero length");
          this.authPayload = {};
        } else {
          const base64Url = items[1];
          if (!base64Url) {
            this.logger.warn("authPayload itemss zero length");
            this.authPayload = {};
          } else {
            const base64 = base64Url.replace("-", "+").replace("_", "/");
            const jsonPayload = JSON.parse(atob(base64));
            this.logger.info("authPayload:", jsonPayload);
            this.authPayload = jsonPayload;
          }
        }
      }
    }
    return this.authPayload || {};
  }

  refreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeAuthToken(jwt: string) {
    this.logger.debug("storing new auth token:", jwt);
    localStorage.setItem(this.AUTH_TOKEN, jwt);
    delete this.authPayload;
  }

  private storeTokens(tokens: AuthTokens) {
    this.storeAuthToken(tokens.auth);
    this.storeRefreshToken(tokens.refresh);
  }

  private storeRefreshToken(token: string) {
    this.logger.debug("storing refresh token:", token);
    localStorage.setItem(this.REFRESH_TOKEN, token);
  }

  private removeTokens() {
    this.logger.debug("removeTokens:before", this.authPayload);
    localStorage.removeItem(this.AUTH_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    delete this.authPayload;
    this.logger.debug("removeTokens:after", this.authPayload);
  }

  scheduleLogout() {
    this.removeTokens();
  }

}
