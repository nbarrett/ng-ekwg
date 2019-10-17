import { ChangeDetectionStrategy, Component, Inject, OnInit } from "@angular/core";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-walk-admin",
  templateUrl: "./walk-admin.component.html",
  styleUrls: ["./walk-admin.component.sass"],
  changeDetection: ChangeDetectionStrategy.Default
})
export class WalkAdminComponent implements OnInit {
  allowAdminEdits: false;

  constructor(@Inject("LoggedInMemberService") private loggedInMemberService,
              private urlService: UrlService) {
  }

  ngOnInit() {
    this.allowAdminEdits = this.loggedInMemberService.allowWalkAdminEdits();
  }

  selectWalksForExport() {
    this.urlService.navigateTo("walks", "export");
  }

  addWalkSlots() {
    this.urlService.navigateTo("walks", "add-walk-slots");
  }

  meetupSettings() {
    this.urlService.navigateTo("walks", "meetup-settings");
  }
}
