import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NgxLoggerLevel } from "ngx-logger";
import { Subscription } from "rxjs";
import { CommitteeReferenceDataService } from "../services/committee/committee-reference-data.service";
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

  constructor(private committeeReferenceData: CommitteeReferenceDataService, public uRLService: UrlService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ContactUsDirective, NgxLoggerLevel.OFF);
  }

  committeeMembers() {
    return this.role ? this.committeeReferenceData.committeeMembersForRole(this.role) : this.committeeReferenceData.committeeMembers();
  }

  email() {
    return this.committeeReferenceData.contactUsField(this.role, "email");
  }

  ngOnInit() {
    this.dataSub = this.committeeReferenceData.events().subscribe(referenceData => {
      this.logger.debug("received event", referenceData);
    });
  }

  ngOnDestroy() {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }
}
