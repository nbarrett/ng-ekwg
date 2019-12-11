import { ChangeDetectionStrategy, Component, Inject, OnInit } from "@angular/core";
import { UrlService } from "../../../services/url.service";
import { MemberLoginService } from "src/app/services/member-login.service";

@Component({
  selector: "app-walk-admin",
  templateUrl: "./walk-admin.component.html",
  styleUrls: ["./walk-admin.component.sass"],
  changeDetection: ChangeDetectionStrategy.Default
})
export class WalkAdminComponent implements OnInit {
  allowAdminEdits: boolean;

  constructor(private memberLoginService: MemberLoginService,
              private urlService: UrlService) {
  }

  ngOnInit() {
    this.allowAdminEdits = this.memberLoginService.allowWalkAdminEdits();
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
