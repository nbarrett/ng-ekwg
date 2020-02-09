import { Injectable } from "@angular/core";
import { CommitteeConfig } from "../models/committee.model";
import { ConfigService } from "./config.service";

@Injectable({
  providedIn: "root"
})
export class CommitteeConfigService {

  constructor(private config: ConfigService) {
  }

  getConfig(): Promise<CommitteeConfig> {
    return this.config.getConfig("committee");
  }

  saveConfig(config) {
    return this.config.saveConfig("committee", config);
  }

}
