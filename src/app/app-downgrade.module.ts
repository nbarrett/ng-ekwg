import { NgModule } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { LoggerFactory } from "./services/logger-factory.service";

@NgModule({
  providers: [
    {provide: CookieService, useFactory: (i: any) => i.get("cookieService"), deps: ["$injector"]},
    {provide: LoggerFactory, useFactory: (i: any) => i.get("loggerFactory"), deps: ["$injector"]}
  ],
  imports: [],
})

export class AppDowngradeModule {
}
