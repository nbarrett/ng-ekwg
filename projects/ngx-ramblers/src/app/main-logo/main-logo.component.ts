import { Component, OnInit } from "@angular/core";
import { Organisation } from "../models/system.model";
import { SystemConfigService } from "../services/system/system-config.service";

@Component({
  selector: "app-main-logo",
  templateUrl: "./main-logo.component.html",
  styleUrls: ["./main-logo.component.sass"]

})
export class MainLogoComponent implements OnInit {

  public group: Organisation;

  constructor(private systemConfigService: SystemConfigService) {
  }

  ngOnInit(): void {
    this.systemConfigService.events().subscribe(item => this.group = item.system.group);
  }
}
