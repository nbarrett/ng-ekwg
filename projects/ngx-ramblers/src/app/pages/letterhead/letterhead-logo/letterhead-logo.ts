import { Component, Input, OnInit } from "@angular/core";
import { LogoFileData, Organisation } from "../../../models/system.model";
import { UrlService } from "../../../services/url.service";

@Component({
  selector: "app-letterhead-logo",
  templateUrl: "./letterhead-logo.html",
})
export class LetterheadLogoComponent implements OnInit {

  public group: Organisation;

  constructor(
    public urlService: UrlService) {
  }

  @Input()
  logo: LogoFileData;

  ngOnInit(): void {
  }
}
