import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommitteeHomeComponent } from "../../pages/committee/home/committee-home.component";
import { CommitteeModule } from "./committee.module";

@NgModule({
  imports: [CommitteeModule, RouterModule.forChild([
    {path: "", component: CommitteeHomeComponent},
    {path: "committee", component: CommitteeHomeComponent}
  ])]
})
export class CommitteeRoutingModule {
}
