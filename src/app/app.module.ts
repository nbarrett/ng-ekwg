import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { UpgradeModule } from "@angular/upgrade/static";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    UpgradeModule,
    AppRoutingModule
  ],
  providers: [],
  // providers: [{provide: APP_BASE_HREF, useValue: ""}],
  bootstrap: [AppComponent]
})

export class AppModule {


}
