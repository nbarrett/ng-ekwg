import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SocialHomeComponent } from "../../pages/social/home/social-home.component";
import { SocialModule } from "./social.module";

@NgModule({
  imports: [SocialModule, RouterModule.forChild([
    {path: ":social-event-id", component: SocialHomeComponent},
    {path: "**", component: SocialHomeComponent}
  ])]
})
export class SocialRoutingModule {
}
