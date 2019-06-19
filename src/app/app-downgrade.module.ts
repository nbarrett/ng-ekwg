import { NgModule } from "@angular/core";
import { SiteEditService } from "./site-editt/site-edit.service";
import { CookieService } from "ngx-cookie-service";
import { LoggerFactory } from "./services/logger-factory.service";

@NgModule({
  providers: [
    SiteEditService,
    {provide: CookieService, useFactory: (i: any) => i.get("cookieService"), deps: ["$injector"]},
    {provide: LoggerFactory, useFactory: (i: any) => i.get("loggerFactory"), deps: ["$injector"]}
  ],
  imports: [],
})

export class AppDowngradeModule {
}
