import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommitteeReferenceDataService } from "../services/committee-reference-data.service";
import { UrlService } from "../services/url.service";
import { NgxLoggerLevel } from "ngx-logger";
import { Logger, LoggerFactory } from "../services/logger-factory.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-contact-us",
  templateUrl: "./contact-us.component.html",
  styleUrls: ["./contact-us.component.sass"]
})

export class ContactUsComponent implements OnInit, OnDestroy {

  @Input() format: string;
  @Input() text: string;
  @Input() role: string;
  @Input() heading: string;
  private logger: Logger;
  private dataSub: Subscription;

  constructor(private committeeReferenceData: CommitteeReferenceDataService, private uRLService: UrlService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger(ContactUsComponent, NgxLoggerLevel.OFF);
  }

  committeeMembers() {
    return this.role ? this.committeeReferenceData.committeeMembersForRole(this.role) : this.committeeReferenceData.committeeMembers();
  }

  email() {
    return this.committeeReferenceData.contactUsField(this.role, "email");
  }

  ngOnInit() {
    this.dataSub = this.committeeReferenceData.events.subscribe(referenceData => {
      this.logger.info("received event", referenceData);
    });
  }

  ngOnDestroy() {
    this.dataSub.unsubscribe();
  }
}
