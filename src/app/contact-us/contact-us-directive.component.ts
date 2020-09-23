import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { CommitteeConfigService } from "../services/committee/commitee-config.service";
import { CommitteeReferenceData } from "../services/committee/committee-reference-data";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { UrlService } from "../services/url.service";

@Component({
  selector: "app-contact-us",
  templateUrl: "./contact-us-directive.component.html",
  styleUrls: ["./contact-us.component.sass"]
})

// tslint:disable-next-line:component-class-suffix
export class ContactUsDirective implements OnInit, OnDestroy {

  @Input() format: string;
  @Input() text: string;
  @Input() role: string;
  @Input() heading: string;
  private logger: Logger;
  private dataSub: Subscription;
  private committeeReferenceData: CommitteeReferenceData;

  constructor(public uRLService: UrlService,
              private loggerFactory: LoggerFactory,
              private committeeConfig: CommitteeConfigService) {
    this.logger = loggerFactory.createLogger(ContactUsDirective, NgxLoggerLevel.OFF);
  }

  ngOnInit() {
    this.dataSub = this.committeeConfig.events().subscribe(data => this.committeeReferenceData = data);
  }

  ngOnDestroy() {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }

  committeeMembers() {
    return this.role ? this.committeeReferenceData?.committeeMembersForRole(this.role) : this.committeeReferenceData?.committeeMembers();
  }

  email() {
    return this.committeeReferenceData?.contactUsField(this.role, "email");
  }

}
