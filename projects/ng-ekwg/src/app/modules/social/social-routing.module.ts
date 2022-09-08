import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SocialHomeComponent } from "../../pages/social/home/social-home.component";
import { hasDynamicPath, hasMongoId } from "../../services/path-matchers";
import { DynamicContentComponent } from "../common/dynamic-content/dynamic-content";
import { SocialModule } from "./social.module";

@NgModule({
  imports: [SocialModule, RouterModule.forChild([
    {matcher: hasMongoId, component: SocialHomeComponent},
    {matcher: hasDynamicPath, component: DynamicContentComponent},
    {path: "**", component: SocialHomeComponent}
  ])]
})
export class SocialRoutingModule {
}
