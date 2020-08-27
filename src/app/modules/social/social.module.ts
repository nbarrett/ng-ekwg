import { NgModule } from "@angular/core";
import { SocialNotificationDirective } from "../../notifications/social/social-notification.directive";
import { SocialNotificationDetailsComponent } from "../../notifications/social/templates/social-notification-details.component";
import { SocialCarouselComponent } from "../../pages/social/carousel/social-carousel.component";
import { SocialEditModalComponent } from "../../pages/social/edit/social-edit-modal.component";
import { SocialHomeComponent } from "../../pages/social/home/social-home.component";
import { SocialSendNotificationModalComponent } from "../../pages/social/send-notification/social-send-notification-modal.component";
import { SocialDisplayService } from "../../pages/social/social-display.service";
import { SocialListComponent } from "../../pages/social/social-list/social-list.component";
import { EventTimesPipe } from "../../pipes/event-times.pipe";
import { SharedModule } from "../../shared-module";

@NgModule({
  declarations: [
    SocialSendNotificationModalComponent,
    SocialNotificationDetailsComponent,
    SocialEditModalComponent,
    SocialHomeComponent,
    SocialListComponent,
    SocialCarouselComponent,
    SocialNotificationDirective,
    EventTimesPipe,
  ],
  imports: [
    SharedModule
  ],
  providers: [
    SocialDisplayService,
  ]
})
export class SocialModule {
}
